# Troubleshooting Guide

This guide helps you diagnose and resolve common issues encountered while working with GraphAI Utils packages.

## General Debugging Steps

1.  **Check Logs**: This is often the first and most important step.
    -   **Server-Side (Node.js/Express/Firebase Functions)**: Look at your server console output. Firebase Functions logs are available in the Firebase Console. Use `console.log`, `console.error`, or a dedicated logger (like Pino, Winston, or GraphAI's built-in agent logger `context.log`).
    -   **Client-Side (Browser)**: Open your browser's Developer Tools (usually F12) and check the Console tab for errors and log messages. Check the Network tab to inspect API requests and responses.
    -   **GraphAI Agent Logs**: Within custom agents, use `context.log.debug()`, `context.log.info()`, etc. Ensure your GraphAI instance or `graphai_express` config has an appropriate log level set.

2.  **Isolate the Problem**:
    -   Try to reproduce the issue with a minimal setup or a simplified GraphAI workflow.
    -   If multiple packages are involved, test each part in isolation if possible. For example, test your GraphAI workflow directly using `new GraphAI(...).run()` before integrating it with Express.
    -   Comment out parts of your code or workflow to pinpoint where the error occurs.

3.  **Verify Configurations**:
    -   Double-check your `GraphAIConfig` for correct node IDs, agent names, input mappings (`:` syntax), and parameters.
    -   Review configurations for `graphai_express`, `graphai_firebase_functions`, or Cytoscape components.
    -   Ensure environment variables are correctly set and accessible.

4.  **Check Package Versions**:
    -   Ensure you are using compatible versions of GraphAI Utils packages, GraphAI core, Node.js, Vue/React, etc. Check `package.json` and consult individual package `README` files for peer dependency requirements.
    -   Sometimes, deleting `node_modules` and `package-lock.json` (or `yarn.lock`) and running `npm install` (or `yarn install`) again can resolve versioning or caching issues.

5.  **Read Error Messages Carefully**: Error messages often contain clues about the file, line number, and type of error.

## Common Issues and Solutions

### GraphAI Core & Workflow Execution

-   **Error: "Agent 'agentName' not found"**
    -   **Cause**: The agent ID used in a node definition is not registered with the `GraphAI` instance.
    -   **Solution**: Ensure the agent function is correctly imported and included in the `agents` object passed to the `GraphAI` constructor. Check for typos in the agent ID.
        ```typescript
        // const graph = new GraphAI(config, { ...vanillaAgents, myCustomAgent });
        ```

-   **Error: "Input not found for node 'nodeId'" or "Cannot read property 'x' of undefined" when accessing inputs.**
    -   **Cause**: An input specified for a node (e.g., `":sourceNode.property"`) is not available, the source node didn't produce output, or the path is incorrect.
    -   **Solution**:
        -   Verify the source node ID and property path in the `inputs` array.
        -   Ensure the source node executes successfully before the current node.
        -   Log the output of the source node to see its structure.
        -   If using `$0`, `$1` for graph inputs, ensure data is passed to `graph.run(inputs)`.

-   **Infinite Loops in Graph**:
    -   **Cause**: Circular dependencies between nodes without a proper breaking condition or if using `loop` functionality incorrectly.
    -   **Solution**: Review your graph structure. Use the `loop` parameter with a `count` or `while` condition that eventually terminates. Add logging to trace execution flow.

-   **TypeErrors in Agents**:
    -   **Cause**: Agent receives input of an unexpected type, or `params` are incorrect.
    -   **Solution**: Add type checks and validation at the beginning of your custom agent functions. Use TypeScript for better type safety during development. Log inputs and params.

### `@receptron/graphai_express` & `@receptron/graphai_firebase_functions`

-   **404 Not Found for API Endpoints**:
    -   **Cause**: Middleware not mounted correctly, base path issues, or incorrect URL.
    -   **Solution**:
        -   Ensure `app.use('/basePath', graphai_express(config))` is correctly set up.
        -   Remember `graphai_express` creates OpenAI-like paths by default (e.g., `/v1/chat/completions`) relative to where it's mounted. So if mounted at `/api`, the full path would be `/api/v1/chat/completions`.
        -   Check `firebase.json` rewrites if using Firebase Hosting with Functions.

-   **Incorrect Request Data Reaching GraphAI**:
    -   **Cause**: `transformRequest` function is missing, incorrect, or not adapting the HTTP request body/query to the format expected by your graph's entry node.
    -   **Solution**: Carefully implement `transformRequest`. Log the output of `transformRequest` and the input received by your first GraphAI node to debug.

-   **CORS Errors**:
    -   **Cause**: Cross-Origin Resource Sharing policy blocking requests from your frontend.
    -   **Solution (Express)**: Use the `cors` middleware: `app.use(cors({ origin: 'http://your-frontend-domain.com' }));`.
    -   **Solution (Firebase Functions)**: Firebase Functions HTTP triggers handle basic CORS for `OPTIONS` requests. For more control, you might need to set CORS headers manually or use the `cors` npm package if wrapping your function handler. `graphai_firebase_functions` might have a `cors` option in its config.

-   **Streaming Not Working**:
    -   **Cause**: `streaming: true` not set in config, graph's exit node not producing a stream, or client not handling SSE/stream correctly.
    -   **Solution**:
        -   Verify `streaming: true` in `graphai_express` or `graphai_firebase_functions` config.
        -   Ensure the agent in your graph's `exit` node (e.g., `openAIStreamAgent`) is designed to output a stream.
        -   Check client-side code for correct stream consumption (e.g., `fetch` with `ReadableStream`, `EventSource`).
        -   Ensure server is setting `Content-Type: text/event-stream` for SSE.

-   **Timeout Errors (e.g., 504 Gateway Timeout, Function Timeout)**:
    -   **Cause**: GraphAI workflow takes too long to execute.
    -   **Solution**:
        -   Optimize your GraphAI workflow and agents (see [Performance Guide](performance.md)).
        -   Increase timeout settings:
            -   In `graphai_express` config: `timeout: 60000` (milliseconds).
            -   For Firebase Functions: In `functions.runWith({ timeoutSeconds: 300 }).https.onRequest(...)`.
            -   For API Gateway / Load Balancer in front of Express.
        -   Consider breaking down long workflows into smaller, asynchronous steps (e.g., using message queues).

### Visualization Packages (`vue_cytoscape`, `react_cytoscape`)

-   **Graph Not Rendering**:
    -   **Cause**: Cytoscape container element not found, `elements` prop empty or malformed, incorrect initialization.
    -   **Solution**:
        -   Ensure the `ref` passed to `initCytoscape` correctly points to a valid DOM element with non-zero dimensions.
        -   Log the `elements` array to verify its structure: `[{ group: 'nodes', data: { id: '...' } }, { group: 'edges', data: { source: '...', target: '...' } }]`.
        -   Check browser console for Cytoscape.js errors.

-   **Layout Not Working or Looks Strange**:
    -   **Cause**: Layout extension (e.g., `cytoscape-klay`) not registered, incorrect layout name or options.
    -   **Solution**:
        -   Ensure layout extensions are imported and registered with Cytoscape core (e.g., `cytoscape.use(klay);`). The GraphAI Utils packages usually handle this.
        -   Verify `layout: { name: 'klay', ... }` configuration. Check Cytoscape.js and layout extension docs for valid options.

-   **Events Not Firing (e.g., node tap)**:
    -   **Cause**: Event listener not correctly attached or selector is wrong.
    -   **Solution**: Use the `on(eventName, selector, handler)` method from `useCytoscape`. Verify `selector` (e.g., `'node'`, `'edge.myClass'`). Log inside the handler.

-   **Performance Issues with Large Graphs**:
    -   **Solution**: See [Performance Guide](performance.md) for tips on batching updates, efficient styling, and considering server-side layout for very large graphs.

### `@receptron/stream_utils`

-   **Parsing Errors**:
    -   **Cause**: Stream data not matching the expected format for the parser.
    -   **Solution**: Inspect raw stream chunks. Ensure correct encoding. Verify parser configuration.

-   **Stream Not Ending or Hanging**:
    -   **Cause**: Upstream source not ending the stream, or an error in a stream transform not being handled.
    -   **Solution**: Ensure `stream.push(null)` (for Node.js Readable streams) or equivalent is called when data is finished. Handle errors in async iterators or stream pipelines.

## Advanced Debugging Tools

-   **Node.js Inspector**:
    Run your Node.js application with the `--inspect` flag: `node --inspect src/server.js`.
    Open Chrome and go to `chrome://inspect` to connect the debugger. You can set breakpoints, step through code, and inspect variables.

-   **VS Code Debugger**: Configure `launch.json` to debug your Node.js or TypeScript application directly within VS Code.

-   **Browser Performance Profiler**: Use the "Performance" tab in browser developer tools to analyze frontend rendering performance, JavaScript execution, and identify bottlenecks in your Vue/React components.

## Asking for Help

If you're still stuck after trying these steps:

1.  **Search Existing Issues**: Check the [GraphAI Utils GitHub Issues](https://github.com/receptron/graphai-utils/issues) to see if someone has reported a similar problem.
2.  **Create a Minimal Reproducible Example**: Create the smallest possible piece of code that demonstrates the issue. This helps others understand and debug your problem quickly.
3.  **Open a New Issue**: Provide:
    -   Clear description of the problem and what you expect to happen.
    -   Steps to reproduce the issue.
    -   Your minimal reproducible example.
    -   Relevant code snippets (GraphAI config, agent code, server setup, frontend component).
    -   Error messages and stack traces (formatted as code).
    -   Versions of Node.js, GraphAI Utils packages, and other relevant libraries.
    -   What you've already tried to debug it.

By providing detailed information, you make it easier for the community or maintainers to help you.