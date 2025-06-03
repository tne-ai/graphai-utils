# Performance Guide

Optimizing the performance of your GraphAI applications is crucial for delivering a good user experience and managing operational costs. This guide covers server-side, client-side, and workflow-specific considerations.

## General Principles

-   **Profile First**: Before optimizing, identify bottlenecks. Use profiling tools for your Node.js server (e.g., Node.js built-in profiler, Chrome DevTools for Node), browser performance tools for frontend, and logging within GraphAI.
-   **Async Everywhere**: Leverage asynchronous operations in your custom agents to prevent blocking the event loop.
-   **Minimize Data Transfer**: Only fetch and send the data you absolutely need between frontend/backend and between agents.
-   **Caching**: Implement caching strategies at various levels (API responses, agent results, external API calls).

## Server-Side Performance (GraphAI Express / Firebase Functions)

### 1. Efficient GraphAI Workflows
    -   **Agent Selection**: Choose efficient agents. Some agents might be more resource-intensive than others.
    -   **Minimize Node Count**: While modularity is good, excessively granular nodes for trivial operations can add overhead.
    -   **Parallel Execution**: Design workflows to maximize parallel execution of independent nodes. GraphAI handles this automatically if dependencies allow.
    -   **Avoid Large Payloads Between Nodes**: If nodes pass very large data objects, consider if only essential parts are needed or if data can be streamed.
    -   **`bypass` Logic**: Use the `bypass` condition on nodes effectively to skip unnecessary computations.
    -   **Error Handling (`onError`)**: Efficient error handling can prevent unnecessary retries or cascading failures.

### 2. Custom Agent Optimization
    -   **Non-Blocking I/O**: Always use asynchronous I/O operations (e.g., `async/await` with `fetch`, database queries).
    -   **Stream Processing**: For large data, use Node.js streams within agents instead of loading everything into memory. `@receptron/stream_utils` can be helpful.
    -   **Memoization/Caching**: If an agent performs expensive computations or API calls with cacheable results, implement caching within the agent or via an external cache (e.g., Redis).
        ```typescript
        // const agentCache = new Map();
        // export const myExpensiveAgent: AgentFunction = async ({ inputs, params, agentId, log }) => {
        //   const cacheKey = JSON.stringify({ agentId, inputs, params }); // Make cache key specific
        //   if (agentCache.has(cacheKey)) {
        //     log?.debug(`Cache hit for ${agentId}`);
        //     return agentCache.get(cacheKey);
        //   }
        //   log?.debug(`Cache miss for ${agentId}`);
        //   // const result = await performExpensiveOperation(inputs, params); // Actual expensive operation
        //   // agentCache.set(cacheKey, result); // Store the actual result
        //   // return result;
        //   // Placeholder for example compilation:
        //   const resultPlaceholder = `Result for ${agentId}`;
        //   agentCache.set(cacheKey, resultPlaceholder);
        //   return resultPlaceholder;
        // };
        ```
    -   **Resource Management**: Properly close connections, release resources, and manage memory in long-running or complex agents.

### 3. Server Configuration
    -   **Node.js Version**: Use a recent, stable LTS version of Node.js.
    -   **Concurrency & Scaling (for self-hosted Express)**:
        -   Use a process manager like PM2 to run your Node.js application in cluster mode, utilizing multiple CPU cores.
        -   Implement horizontal scaling with load balancers if deploying to VMs or containers.
    -   **Firebase Functions Configuration**:
        -   **Memory Allocation**: Allocate sufficient memory to your functions. More memory also means more CPU.
        -   **Timeout**: Set appropriate timeouts. Too short can cause premature exits; too long can increase costs if functions hang.
        -   **Concurrency (`maxInstances`)**: Control the maximum number of concurrent instances to manage costs and downstream service load.
        -   **Regions**: Deploy functions geographically closer to your users or other services they interact with.
    -   **`graphai_express` / `graphai_firebase_functions` Settings**:
        -   **`timeout`**: Set a timeout for GraphAI execution within the middleware to prevent runaway graphs.

### 4. API Layer Optimizations
    -   **Payload Size**: Use `express.json({ limit: '...' })` to set reasonable request size limits.
    -   **Compression**: Use middleware like `compression` for Express to Gzip responses. Firebase Hosting handles this automatically for static assets; ensure your function responses are compressed if large.
    -   **Caching HTTP Responses**: For GET requests that return cacheable data, use HTTP caching headers (e.g., `Cache-Control`, `ETag`). Consider a reverse proxy cache like Nginx or a CDN.
    -   **Rate Limiting**: Protect your API from abuse and overload using `express-rate-limit` or Firebase Functions quotas/custom logic.

### 5. Streaming
    -   For large responses or long-running processes (like LLM interactions), use streaming.
    -   `graphai_express` and `graphai_firebase_functions` have `streaming: true` options.
    -   Ensure your GraphAI workflow's exit node produces a stream (e.g., using `openAIStreamAgent` or a custom streaming agent).
    -   Use Server-Sent Events (SSE) for efficient client-side consumption of text-based streams.

## Client-Side Performance (Visualization & Interaction)

### 1. `@receptron/graphai_vue_cytoscape` / `react_cytoscape`
    -   **Virtualization/Lazy Rendering**: Cytoscape.js itself is optimized, but for extremely large graphs (thousands of nodes/edges), performance can degrade. Consider:
        -   Not rendering all elements at once if possible (data pagination or view-based loading).
        -   Using level-of-detail techniques (e.g., simpler node shapes when zoomed out, hiding labels).
    -   **Efficient Styling**: Complex selectors or very dynamic styles in Cytoscape can impact performance. Keep styles as simple as possible for the common case. Use classes for nodes/edges and define styles for those classes.
    -   **Batch Updates**: When making multiple changes to the graph (adding/removing many nodes/edges), batch them using `cy.batch()` or by updating the `elements` prop once with all changes.
        ```javascript
        // Example with cyInstance if available from useCytoscape hook/composable
        // if (cyInstance.value) { // Vue example
        //   cyInstance.value.batch(() => {
        //     // cyInstance.value.add(newNodes); // Example: newNodes is an array of node/edge definitions
        //     // cyInstance.value.remove(nodesToRemove); // Example: nodesToRemove is a Cytoscape collection
        //   });
        // }
        // Or, for prop-driven updates, ensure the elements array is updated once.
        ```
    -   **Layout Performance**:
        -   Some layouts are more computationally expensive (e.g., `cose` or `fcose` on large graphs). `klay` is generally good for hierarchical data. `grid` or `circle` are very fast.
        -   Avoid re-running layouts unnecessarily. Only run layout when graph structure changes significantly.
        -   For very large graphs, consider running layout algorithms on the server or in a web worker if client-side layout is too slow.
    -   **Event Handling**: Be mindful of complex logic in Cytoscape event handlers (e.g., `on('tap', 'node', ...)`). Debounce or throttle event handlers if they trigger expensive operations.
    -   **Memoization (React)**: Use `React.memo` for your graph components and `useMemo`/`useCallback` for props and handlers to prevent unnecessary re-renders.
### 2. Frontend Application Logic
    -   **Code Splitting**: Load parts of your application (e.g., complex views, heavy libraries like Cytoscape itself if not always needed) only when required using dynamic imports.
    -   **Debouncing/Throttling User Inputs**: For controls that trigger graph updates or API calls frequently.
    -   **Optimistic Updates**: Update the UI immediately upon user action, then reconcile with the server response. This improves perceived performance.
    -   **Efficient State Management**: Use Vuex/Pinia or Redux/Zustand efficiently. Avoid deeply nested reactive objects if they cause performance issues. Select only necessary state in components.
    -   **Minimize DOM Manipulations**: Let Vue/React handle DOM updates. Avoid direct DOM manipulation.
    -   **Web Workers**: Offload CPU-intensive tasks (like complex data transformations before rendering) to web workers.

## Database and External Service Interactions

-   **Efficient Queries**: Optimize database queries (use indexes, select only necessary fields, limit results).
-   **Connection Pooling**: Use connection pooling for databases if your server makes direct connections.
-   **Caching External API Calls**: Cache responses from third-party APIs that don't change often (e.g., using Redis, Memcached, or in-memory cache with TTL).
-   **Retries with Exponential Backoff**: For transient errors when calling external services, implement a retry mechanism with increasing delays.
-   **Timeouts**: Set appropriate timeouts for external calls to prevent your application from hanging.
-   **Batching**: If making many small calls to an external service, check if it supports a batch API to reduce HTTP overhead.

## Monitoring and Logging for Performance

-   **Server-Side**:
    -   Use APM (Application Performance Monitoring) tools like New Relic, Datadog, Sentry Performance, or OpenTelemetry-based solutions.
    -   Log execution times for critical GraphAI workflows or individual agents.
        ```typescript
        // export const myAgent: AgentFunction = async (context) => {
        //   const startTime = Date.now();
        //   // ... agent logic ...
        //   // const result = await performLogic(); // Actual agent logic
        //   // const duration = Date.now() - startTime;
        //   // context.log?.debug(`Agent ${context.agentId} executed in ${duration}ms`);
        //   // return result;
        //   // Placeholder for example:
        //   const resultPlaceholder = `Result for ${context.agentId}`;
        //   const duration = Date.now() - startTime;
        //   context.log?.debug(`Agent ${context.agentId} executed in ${duration}ms`);
        //   return resultPlaceholder;
        // };
        ```
    -   Monitor Node.js event loop lag and CPU/memory usage.
-   **Client-Side**:
    -   Use browser developer tools (Performance tab, Lighthouse).
    -   Track frontend errors and performance metrics with tools like Sentry, LogRocket, or Google Analytics (Core Web Vitals).
-   **Firebase**: Utilize Firebase Performance Monitoring and Cloud Functions logs (which include execution time).

## Load Testing

-   Use tools like k6, Artillery, Playwright (for E2E load tests), or JMeter to simulate traffic and identify performance limits of your backend API and frontend.
-   Test common user scenarios and peak load conditions.
-   Analyze results to find bottlenecks (CPU, memory, I/O, database, external services).

By systematically addressing these areas, you can significantly improve the performance and scalability of your GraphAI Utils applications. Remember that performance optimization is an ongoing process: measure, identify, improve, and repeat.