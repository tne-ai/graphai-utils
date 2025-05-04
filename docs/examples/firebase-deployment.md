# Example: Firebase Cloud Deployment

This example walks through deploying a full-stack GraphAI application—consisting of a GraphAI backend (Firebase Function) and a simple frontend (Firebase Hosting)—to Firebase.

## Features Demonstrated

-   **`@receptron/graphai_firebase_functions`**: Deploying GraphAI workflows as Firebase Functions.
-   **Firebase Hosting**: Serving a static frontend that interacts with the GraphAI backend.
-   **Firebase Project Setup**: Configuring a Firebase project for a GraphAI application.
-   **Backend-Frontend Integration**: Rewriting frontend API calls to backend functions.
-   **Environment Configuration**: Managing API keys and settings in Firebase.

## Prerequisites

-   Node.js 16+
-   npm or yarn
-   A Google Account and a Firebase project (Blaze plan recommended for outbound networking).
-   Firebase CLI installed and logged in (`npm install -g firebase-tools`, `firebase login`).

## Code Structure

We'll create a project with the following structure:

```
graphai-firebase-example/
├── firebase.json        # Firebase project configuration
├── .firebaserc          # Firebase project association
├── functions/           # Firebase Functions code
│   ├── src/
│   │   └── index.ts     # GraphAI backend logic
│   ├── package.json
│   └── tsconfig.json
└── public/              # Frontend static assets
    └── index.html       # Simple frontend UI
    └── script.js        # Frontend JavaScript
```

## Step 1: Initialize Firebase Project

1.  Create a project directory:
    ```bash
    mkdir graphai-firebase-example
    cd graphai-firebase-example
    ```

2.  Initialize Firebase:
    ```bash
    firebase init
    ```
    -   Select **Functions** (TypeScript) and **Hosting**.
    -   Connect to your Firebase project.
    -   Functions: Use TypeScript, ESLint (yes), install dependencies (yes).
    -   Hosting: Public directory: `public`, configure as SPA (yes), set up GitHub Action (no for now).

## Step 2: Implement Firebase Function with GraphAI

1.  Navigate to the `functions` directory and install dependencies:
    ```bash
    cd functions
    npm install @receptron/graphai_firebase_functions graphai @graphai/vanilla @graphai/agents
    # Add other agent dependencies if your workflow needs them
    ```

2.  Write the function in `functions/src/index.ts`:

    ```typescript
    import * as functions from "firebase-functions";
    import { graphai_firebase, GraphAIExpressConfig } from "@receptron/graphai_firebase_functions";
    import { GraphAIConfig } from "graphai";

    // A simple GraphAI workflow for demonstration
    const demoWorkflow: GraphAIConfig = {
      nodes: {
        userInput: {
          agent: "textInputAgent",
          params: { message: "${query.text}" } // Expecting input from query param: ?text=...
        },
        echoBot: {
          agent: "textTemplateAgent",
          params: {
            template: "Firebase GraphAI echo: You said '${inputs[0]}'. Timestamp: ${Date.now()}"
          },
          inputs: [":userInput"]
        },
        // To make it OpenAI compatible for chat, the output needs specific structure
        // For this simple echo, graphai_firebase will wrap it.
        finalOutput: {
          agent: "textOutputAgent",
          inputs: [":echoBot"]
        }
      },
      entry: "userInput",
      exit: "finalOutput"
    };

    const graphaiFirebaseConfig: GraphAIExpressConfig = {
      graphConfig: demoWorkflow,
      // This function will adapt the HTTP request to what the graphConfig expects.
      // Firebase Functions pass Express-like req, res objects.
      transformRequest: (req) => {
        // For this example, our graph expects input from req.query.text
        // If it were a POST, we'd use req.body
        return {
          query: req.query // Pass all query params
        };
      },
      // transformResponse is optional, graphai_firebase provides default formatting
    };

    // Export the GraphAI function
    // This will create an HTTP endpoint.
    // By default, graphai_firebase creates OpenAI-like paths, e.g., /v1/chat/completions
    // If you want a simpler path for a non-OpenAI-like graph, you might need a custom Express app.
    // For this example, we'll use the default.
    export const graphaiDemo = functions.https.onRequest(
      graphai_firebase(graphaiFirebaseConfig)
    );

    // A simple health check function
    export const health = functions.https.onRequest((request, response) => {
      functions.logger.info("Health check successful!");
      response.json({ status: "healthy", service: "GraphAI Demo on Firebase" });
    });
    ```

3.  Set environment variables (if your workflow uses them, e.g., OpenAI API Key):
    ```bash
    # In project root or functions/ directory
    # firebase functions:config:set service.apikey="YOUR_KEY"
    ```

## Step 3: Create a Simple Frontend

1.  Create `public/index.html`:

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GraphAI Firebase Demo</title>
        <style>
            body { font-family: sans-serif; margin: 20px; background-color: #f4f7f6; color: #333; }
            .container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            input[type="text"] { padding: 10px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; width: calc(100% - 120px); }
            button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background-color: #0056b3; }
            #response { margin-top: 20px; padding: 10px; background-color: #e9ecef; border-radius: 4px; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>GraphAI Firebase Demo</h1>
            <p>Enter text to send to the GraphAI echo function:</p>
            <input type="text" id="inputText" placeholder="Type something...">
            <button id="sendButton">Send</button>
            <h2>Response:</h2>
            <div id="response">Waiting for response...</div>
        </div>
        <script src="script.js"></script>
    </body>
    </html>
    ```

2.  Create `public/script.js`:

    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        const inputText = document.getElementById('inputText');
        const sendButton = document.getElementById('sendButton');
        const responseDiv = document.getElementById('response');

        sendButton.addEventListener('click', async () => {
            const text = inputText.value;
            if (!text) {
                responseDiv.textContent = 'Please enter some text.';
                return;
            }

            responseDiv.textContent = 'Sending...';

            try {
                // The path /api/v1/chat/completions will be rewritten by Firebase Hosting
                // to the graphaiDemo function.
                // We are using a GET request with a query parameter as defined in our
                // graph's textInputAgent and transformRequest.
                // For a typical OpenAI POST, the method and body would differ.
                const encodedText = encodeURIComponent(text);
                const apiUrl = `/api/v1/chat/completions?text=${encodedText}`; 
                // Note: graphai_firebase by default creates /v1/chat/completions for POST.
                // For a GET request to a custom graph like this, a more direct function mapping
                // or a custom express app within the Firebase Function might be cleaner.
                // Let's assume for this demo, we are making a GET request and the
                // graphai_firebase or our transformRequest handles it.
                // A more standard way for this simple echo would be a direct function path.
                // We will adjust firebase.json to route /api/echo to graphaiDemo.

                // Let's simplify and assume a direct path for the echo for clarity.
                // We'll adjust firebase.json to route `/api/echo` to `graphaiDemo`
                // and the function will just be `graphai_firebase(demoWorkflow)` without OpenAI paths.
                // For now, we'll stick to the default pathing and make a POST.

                const postPayload = {
                    // This structure is what an OpenAI client would send.
                    // Our transformRequest on the server adapts this.
                    messages: [{ role: "user", content: text }] 
                };
                
                // Using the default POST /v1/chat/completions path
                const response = await fetch('/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postPayload)
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`HTTP error ${response.status}: ${errorData}`);
                }

                const data = await response.json();
                
                // Assuming OpenAI-like response structure due to graphai_firebase default
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    responseDiv.textContent = data.choices[0].message.content;
                } else {
                    responseDiv.textContent = JSON.stringify(data, null, 2);
                }

            } catch (error) {
                console.error('Error:', error);
                responseDiv.textContent = `Error: ${error.message}`;
            }
        });
    });
    ```

## Step 4: Configure Firebase Hosting Rewrites

Modify `firebase.json` in the project root:

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18" // Or your chosen runtime (e.g., nodejs20)
  },
  "hosting": {
    "public": "public", // Our frontend files are in 'public/'
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        // Requests to /api/... will be routed to the 'graphaiDemo' Firebase Function.
        "source": "/api/**", 
        "function": "graphaiDemo" 
      },
      {
        // For SPA: all other requests serve index.html
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
This configuration means that when the frontend calls `fetch('/api/v1/chat/completions', ...)`:
1. Firebase Hosting intercepts it.
2. The `source: "/api/**"` rule matches.
3. The request is internally routed to the `graphaiDemo` Firebase Function.
4. The `graphaiDemo` function receives the request at its root (e.g., `https://<region>-<project>.cloudfunctions.net/graphaiDemo/v1/chat/completions` where `/v1/chat/completions` is the part matched by `**`).

## Step 5: Deploy and Test

1.  Deploy everything to Firebase:
    ```bash
    firebase deploy
    ```
    This will deploy both your Firebase Function (`graphaiDemo`) and your frontend static files in `public/` to Firebase Hosting.

2.  Test:
    -   Open the Hosting URL provided by the Firebase CLI in your browser.
    -   You should see the simple frontend.
    -   Enter text and click "Send".
    -   The frontend will make a call to `/api/v1/chat/completions`, which gets routed to your `graphaiDemo` function.
    -   The function executes the GraphAI workflow, and the response should be displayed on the page.
    -   Check Firebase Function logs in the Firebase Console for any errors or log messages.

## Key Concepts

-   **`graphai_firebase`**: A utility from `@receptron/graphai_firebase_functions` that wraps a GraphAI configuration and exposes it as an HTTP handler suitable for Firebase Functions. It handles request parsing and response formatting, often mimicking OpenAI API structure by default.
-   **Firebase Functions**: Serverless backend logic. Your GraphAI workflows run here.
-   **Firebase Hosting**: Serves your static frontend assets (HTML, CSS, JS).
-   **Hosting Rewrites**: Crucial for integrating frontend and backend by routing API calls from the frontend's domain to the backend functions, avoiding CORS issues and simplifying API URLs.
-   **Environment Configuration**: Firebase Functions have their own system for managing environment variables and secrets, separate from local `.env` files.

## Further Enhancements

-   **More Complex Workflow**: Replace `demoWorkflow` with a more sophisticated GraphAI workflow involving multiple agents, conditional logic, or external API calls (e.g., to OpenAI via `openAIAgent`).
-   **Authentication**: Secure your Firebase Function using Firebase Authentication or API keys.
-   **Error Handling**: Implement more robust error handling in both the function and the frontend.
-   **Streaming**: If your GraphAI workflow supports streaming, adapt the Firebase Function and frontend to handle Server-Sent Events (SSE) or WebSockets.
-   **`@receptron/firebase-tools`**: Explore this package for any utilities that might simplify Firebase-specific tasks, like stream filtering for Firebase event triggers (e.g., Firestore, Storage).

This example provides a complete, albeit simple, blueprint for deploying GraphAI applications on Firebase.