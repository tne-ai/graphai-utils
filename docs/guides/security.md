# Security Best Practices Guide

Securing your GraphAI applications is essential to protect data, prevent abuse, and maintain user trust. This guide covers key security considerations when using GraphAI Utils.

## Authentication

Ensure that only authorized users or services can access your GraphAI APIs and functionalities.

1.  **API Key Authentication**:
    -   For server-to-server communication or trusted clients.
    -   Generate strong, unique API keys.
    -   Transmit keys securely (e.g., in an `Authorization: Bearer <key>` header).
    -   Validate keys on the server-side with a secure comparison.
    -   Store API keys securely (e.g., environment variables, secrets managers like HashiCorp Vault, AWS Secrets Manager, Google Secret Manager).
    -   Implement middleware in Express (or Firebase Function checks) to validate API keys before processing requests with `graphai_express` or `graphai_firebase_functions`.

2.  **OAuth 2.0 / OpenID Connect (OIDC)**:
    -   For user-facing applications.
    -   Integrate with identity providers (e.g., Auth0, Okta, Firebase Authentication, Keycloak).
    -   Validate JWTs (JSON Web Tokens) received from clients.
    -   Associate user identities with permissions and roles.

3.  **Firebase Authentication**:
    -   If using Firebase, leverage Firebase Auth for user authentication (email/password, social logins, phone).
    -   Secure Firebase Functions by checking `context.auth` in HTTP-triggered functions.
        ```typescript
        // // In a Firebase Function
        // export const securedGraphAIFunction = functions.https.onCall(async (data, context) => {
        //   if (!context.auth) {
        //     throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
        //   }
        //   // const userId = context.auth.uid;
        //   // ... proceed with GraphAI execution, potentially passing userId for authorization ...
        //   // return graph.run({ ...data, userId });
        // });
        ```
        For `onRequest` functions used with `graphai_firebase_functions`, you'd typically verify an ID token passed in the `Authorization` header.

## Authorization

Once authenticated, determine what actions the user/service is allowed to perform.

1.  **Role-Based Access Control (RBAC)**:
    -   Define roles (e.g., `admin`, `editor`, `viewer`).
    -   Assign permissions to roles (e.g., "execute_workflow_X", "view_graph_Y").
    -   Check user's role and permissions before allowing access to specific GraphAI workflows or administrative UIs.

2.  **Ownership/Resource-Based Permissions**:
    -   If users can create their own workflows or data, ensure they can only access/modify their own resources.
    -   Pass user/tenant ID into GraphAI workflows and use it in custom agents to filter data access (e.g., in database queries).

3.  **Input Validation for Permissions**:
    -   Be cautious if workflow IDs or agent configurations are passed from the client. Validate that the authenticated user has permission to use/execute them.

## Input Validation and Sanitization

Prevent injection attacks and ensure data integrity.

1.  **Validate All Client Inputs**:
    -   Use libraries like Zod, Joi, or `express-validator` to validate request bodies, query parameters, and headers before they reach `transformRequest` or your GraphAI workflows.
    -   Check for expected types, formats, lengths, ranges.

2.  **Sanitize Data for Specific Contexts**:
    -   If user input is used to construct database queries, use parameterized queries or ORM features to prevent SQL injection.
    -   If user input is rendered in HTML (e.g., in a visualization label), ensure it's properly escaped to prevent XSS (Cross-Site Scripting). Cytoscape labels are generally rendered on a canvas, which is safer, but be mindful if using HTML-like labels or tooltips.

3.  **GraphAI `params` Security**:
    -   Avoid constructing agent `params` directly from unvalidated user input if those params could be interpreted in a dangerous way by an agent (e.g., a `codeExecutionAgent` or an agent that builds file paths).
    -   Prefer to use user input as `inputs` to agents, which are typically treated as data, not configuration.

## Secure Communication (HTTPS)

-   **Always use HTTPS** for all communication between clients, your servers, and external services.
-   **Firebase Hosting and Functions** provide HTTPS by default.
-   For self-hosted Express servers, configure SSL/TLS certificates (e.g., using Let's Encrypt with Nginx or Caddy as a reverse proxy).
-   Ensure internal service-to-service communication is also secured if on an untrusted network.

## Dependency Management

-   **Keep Dependencies Updated**: Regularly update your `npm` packages (including GraphAI Utils, Express, Firebase SDKs, etc.) to patch known vulnerabilities. Use `npm audit` or `yarn audit`.
-   **Use Trusted Packages**: Be cautious when adding new dependencies. Check their popularity, maintenance status, and reported vulnerabilities.

## Server-Side Security (Express / Node.js)

1.  **Use Security Middleware**:
    -   `helmet`: Sets various HTTP headers to help protect against common web vulnerabilities (XSS, clickjacking, etc.).
    -   `cors`: Configure Cross-Origin Resource Sharing properly. Only allow trusted origins.
    -   `csurf` (if using sessions/cookies): Protect against Cross-Site Request Forgery. Less relevant for stateless APIs using tokens.
    -   Rate limiting (e.g., `express-rate-limit`): Prevent brute-force attacks and denial-of-service.

2.  **Error Handling**:
    -   Implement robust global error handlers.
    -   Avoid leaking sensitive information (stack traces, internal paths) in error responses to clients in production. Log detailed errors on the server.

3.  **Session Management (if applicable)**:
    -   Use secure session cookies (HttpOnly, Secure, SameSite attributes).
    -   Store session data server-side (e.g., Redis) rather than client-side if it contains sensitive info.

## Firebase Security

1.  **Firestore/Realtime Database Security Rules**:
    -   Define strong security rules to control read/write access to your data.
    -   Test your rules thoroughly using the Firebase emulator or simulator.

2.  **Cloud Storage for Firebase Security Rules**:
    -   Secure access to files stored in Cloud Storage.

3.  **Firebase Functions Security**:
    -   As mentioned, validate `context.auth` for callable functions or ID tokens for HTTP functions.
    -   Set appropriate IAM permissions for the service accounts your functions use, following the principle of least privilege.
    -   Protect function URLs if they are not meant for public invocation (e.g., by requiring an API key or checking caller identity).

4.  **API Key Security**:
    -   Restrict Firebase API keys in the Google Cloud Console to only allow access from your authorized domains or apps. Note that client-side API keys are inherently discoverable. Server-side operations should use Admin SDKs with service accounts.

## Secure Agent Development

When creating custom GraphAI agents:

1.  **Principle of Least Privilege**: If an agent interacts with external services, ensure its credentials/API keys have only the minimum necessary permissions.
2.  **Input Validation within Agents**: Even if validation happens at the API layer, it's good practice for agents to validate their `inputs` and `params` if they perform critical operations.
3.  **Avoid Executing Arbitrary Code**: Be extremely cautious if an agent needs to evaluate code or run shell commands based on inputs (e.g., a `codeRunnerAgent`). This is a significant security risk and should be heavily sandboxed or avoided.
4.  **Secrets in Agents**: Do not hardcode secrets in agent code. Pass them via `params` (sourced from secure environment variables or a secrets manager at the graph execution level) or have the agent fetch them securely at runtime.

## Logging and Monitoring for Security

-   **Audit Logs**: Log important security-related events (logins, failed login attempts, permission changes, access to sensitive resources, critical errors).
-   **Monitor Logs**: Regularly review logs for suspicious activity. Use tools that can alert on security anomalies.
-   **Intrusion Detection/Prevention Systems (IDS/IPS)**: For self-hosted environments, consider network-level security.

## Content Security Policy (CSP)

-   For frontend applications (especially those displaying user-generated content or complex visualizations), implement a Content Security Policy to mitigate XSS and other injection attacks. This is configured via HTTP headers.

## Regular Security Audits

-   Periodically review your application's security posture.
-   Consider penetration testing for critical applications.

Security is an ongoing process, not a one-time setup. Stay informed about common web vulnerabilities (e.g., OWASP Top 10) and best practices.