# Firebase Integration for GraphAI

Deploy your GraphAI applications seamlessly to Firebase, leveraging Firebase Functions for backend logic and Firebase Hosting for frontend UIs. This tutorial covers setting up `@receptron/graphai_firebase_functions` and `@receptron/firebase-tools`.

## 🎯 What You'll Build

- **A Firebase project** configured for GraphAI.
- **Firebase Functions** running your GraphAI workflows as HTTP-triggered endpoints.
- **A frontend application** (Vue.js or React) hosted on Firebase Hosting, interacting with your GraphAI functions.
- **Deployment scripts** and CI/CD considerations for Firebase.

## 📋 Prerequisites

- **Node.js 16+** installed.
- A **Google Account** to create a Firebase project.
- **Firebase CLI** installed and configured: `npm install -g firebase-tools` then `firebase login`.
- Basic knowledge of **Firebase Functions** and **Firebase Hosting**.
- An existing GraphAI application or workflow (e.g., from the [Chat Server Tutorial](chat-server.md)).

⏱️ **Estimated time**: 50-70 minutes

## 🛠️ Step 1: Firebase Project Setup

1.  **Create a Firebase Project**:
    Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
    Enable the **Blaze (pay-as-you-go)** plan for your project, as Firebase Functions for Node.js 16+ (required by many modern packages) typically require this plan to deploy outbound networking-enabled functions (e.g., to call OpenAI).

2.  **Initialize Firebase in Your Project**:
    Navigate to your GraphAI project's root directory (or a new directory for this tutorial).
    ```bash
    firebase init
    ```
    - Select **Functions** (TypeScript or JavaScript) and **Hosting**.
    - Choose your Firebase project.
    - For Functions:
        - Language: TypeScript (recommended) or JavaScript.
        - ESLint: Yes (recommended).
        - Install dependencies: Yes.
    - For Hosting:
        - Public directory: `public` (or `dist` if your frontend builds there, e.g., Vue/React).
        - Configure as a single-page app: Yes (if applicable).
        - Set up GitHub Action deploys: No (for now, can be added later).

    This will create `firebase.json`, `.firebaserc`, and a `functions` directory.

## 🛠️ Step 2: Configure Firebase Functions for GraphAI

### Install Dependencies
Navigate to the `functions` directory created by `firebase init`:
```bash
cd functions
npm install @receptron/graphai_firebase_functions graphai @graphai/vanilla @graphai/agents
# Add any other specific agent packages your workflow needs
```

### Write Your GraphAI Firebase Function
Modify `functions/src/index.ts` (if TypeScript) or `functions/index.js`.

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";
import { graphai_firebase } from "@receptron/graphai_firebase_functions";
import { GraphAIConfig } from "graphai"; // Assuming GraphAIConfig type is available

// Define your GraphAI workflow configuration
// This could be imported from another file or constructed here
const myChatWorkflow: GraphAIConfig = {
  // version: 0.2, // Ensure your config is compatible
  nodes: {
    userInput: {
      agent: "textInputAgent",
      params: {
        message: "${messages.content}" // Example: expecting OpenAI-like input
      }
    },
    systemPrompt: {
      agent: "textTemplateAgent",
      params: {
        template: "${messages.system || 'You are a helpful Firebase-hosted AI.'}"
      }
    },
    chatLLM: {
      agent: "openAIAgent", // Requires OPENAI_API_KEY to be set in function environment
      params: {
        model: "${model || 'gpt-3.5-turbo'}",
        system: "${:systemPrompt}",
        temperature: "${temperature || 0.7}"
      },
      inputs: [":userInput"]
    },
    // This agent should format the output to be OpenAI compatible if that's the goal
    outputFormatter: {
      agent: "textOutputAgent", 
      params: {
        format: "openai_chat_completion" // Or your desired format
      },
      inputs: [":chatLLM"]
    }
  },
  entry: "userInput",
  exit: "outputFormatter"
};

// Create an HTTP-triggered Firebase Function using graphai_firebase
export const graphaiChat = functions.https.onRequest(
  // graphai_firebase wraps your GraphAI config into an Express-like handler
  graphai_firebase({
    graphConfig: myChatWorkflow,
    // Enable streaming if your workflow and agents support it
    // streaming: true, 
    // streamingConfig: myStreamingChatWorkflow, // if you have a separate one

    // Optional: transform request before it hits GraphAI
    transformRequest: (req) => {
      // Example: Adapt incoming request body to what your graphConfig expects
      // This is crucial if the client sends data in a different format
      const { messages, model, temperature, stream } = req.body;
      const systemMessage = messages?.find((m: any) => m.role === 'system');
      const userMessages = messages?.filter((m: any) => m.role !== 'system') || [];
      
      return {
        messages: { // This structure must match what your graphConfig's textInputAgent expects
          system: systemMessage?.content,
          content: userMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n')
        },
        model,
        temperature,
        stream
      };
    },

    // Optional: transform response before sending to client
    // transformResponse: (graphAIResponse, req, res) => {
    //   return { customData: graphAIResponse, timestamp: Date.now() };
    // },

    // Optional: custom error handler
    errorHandler: (err, req, res, defaultErrorHandler) => {
      functions.logger.error("GraphAI Function Error:", err);
      // Use the default error handler or implement your own
      defaultErrorHandler(err, req, res); 
    }
  })
);

// It's good practice to have a health check endpoint
export const health = functions.https.onRequest((request, response) => {
  functions.logger.info("Health check ping!");
  response.json({ status: "healthy", timestamp: Date.now() });
});
```

### Set Environment Variables for Functions
For secrets like API keys (e.g., `OPENAI_API_KEY` if using `openAIAgent`):
```bash
# Navigate to your project's root or functions directory
firebase functions:config:set open_ai.key="YOUR_OPENAI_API_KEY_HERE"
# You can set multiple variables
# firebase functions:config:set some_service.url="https://api.example.com"

# To see current config:
# firebase functions:config:get
```
Access these in your function code using `functions.config().open_ai.key`.
The `openAIAgent` (if from `@graphai/agents`) might automatically look for `process.env.OPENAI_API_KEY`. Firebase Functions automatically populate `process.env` with configured variables.

## 🛠️ Step 3: Deploy Firebase Functions

From your project's root directory:
```bash
firebase deploy --only functions
```
After deployment, the Firebase CLI will output the URL for your `graphaiChat` function. It will look something like:
`https://<YOUR_REGION>-<YOUR_PROJECT_ID>.cloudfunctions.net/graphaiChat`

Test it with a tool like Postman or cURL:
```bash
curl -X POST \
  https://<YOUR_REGION>-<YOUR_PROJECT_ID>.cloudfunctions.net/graphaiChat/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello from Firebase!"}
    ]
  }'
```
**Note**: The `/v1/chat/completions` path is appended by `graphai_firebase` by default to mimic OpenAI API structure. This can be configured.

## 🛠️ Step 4: Frontend Setup with Firebase Hosting

If you have a Vue.js or React frontend (e.g., the Graph Dashboard from another tutorial).

1.  **Build Your Frontend**:
    Ensure your frontend application is built into the directory specified during `firebase init hosting` (e.g., `dist` or `public`).
    ```bash
    # For a Vue project (if public dir is 'dist')
    npm run build 
    ```

2.  **Configure Firebase Hosting to Rewrite to Functions**:
    Modify `firebase.json` in your project root to proxy API calls from your frontend to your Firebase Function. This avoids CORS issues and provides a cleaner API path.

    ```json
    {
      "functions": {
        "source": "functions", // Or wherever your functions code is
        "runtime": "nodejs18" // Or your chosen runtime
      },
      "hosting": {
        "public": "dist", // Or your frontend build output directory
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            // Any request to /api/* will be rewritten to the graphaiChat function
            "source": "/api/**", 
            "function": "graphaiChat" // Name of your Firebase Function
          },
          {
            // For single-page applications, rewrite all other paths to index.html
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }
    ```
    With this, your frontend can make API calls to `/api/v1/chat/completions` and Firebase Hosting will route them to your `graphaiChat` function.

3.  **Update Frontend API Calls**:
    In your frontend code, change API base URL to `/api`.
    Example: `fetch('/api/v1/chat/completions', { ... })`

## 🛠️ Step 5: Deploy Hosting and Test Integration

1.  **Deploy Hosting (and Functions if changed)**:
    ```bash
    firebase deploy --only hosting # If functions are already deployed
    # OR
    firebase deploy # To deploy everything
    ```
    Firebase CLI will output your Hosting URL.

2.  **Test**:
    Open your Firebase Hosting URL in a browser. Your frontend should load, and its API calls to `/api/...` should now be served by your `graphaiChat` Firebase Function. Check browser developer tools (Network tab) and Firebase Function logs for any issues.

## 🛠️ Step 6: Using `@receptron/firebase-tools`

The `@receptron/firebase-tools` package (v1.0.0) is mentioned in the memory bank. Its specific utilities would determine its usage. Common utilities in such a package might include:

-   **Stream Filters for Firebase**: If Firebase Functions have specific ways they handle streams (e.g., for Firestore triggers or Pub/Sub), this tool might provide adapters. The `firebaseStreamFilter.ts` file suggests this.
-   **Local Emulation Helpers**: Tools to better emulate Firebase services locally when working with GraphAI.
-   **Deployment Scripts**: Enhanced scripts for deploying GraphAI-specific configurations to Firebase.

**Example Conceptual Usage (if it provides a stream filter):**
```typescript
// functions/src/index.ts - hypothetical
import { firebaseStreamFilter } from "@receptron/firebase-tools"; // Assuming export

export const processStorageUpload = functions.storage.object().onFinalize(async (object) => {
  // Get a readable stream from Firebase Storage
  // const fileStream = storage.bucket(object.bucket).file(object.name!).createReadStream();
  
  // const filteredStream = firebaseStreamFilter.transformStorageStream(fileStream, { /* options */ });
  
  // Now pass filteredStream to a GraphAI workflow that expects a stream
  // const graphai = initGraphAI(myStreamProcessingWorkflow, { streamInput: filteredStream });
  // const result = await graphai.run();
  // functions.logger.info("Processed storage object:", result);
});
```
Consult the documentation or source code of `@receptron/firebase-tools` for its actual capabilities. The `firebaseStreamFilter.ts` file is a key indicator of its purpose.

## ✅ Step 7: CI/CD with GitHub Actions (Optional)

Firebase Hosting can integrate with GitHub Actions for automatic deployments.

1.  **Setup GitHub Action for Firebase**:
    ```bash
    firebase init hosting:github
    ```
    This command will guide you through:
    - Authorizing Firebase CLI with GitHub.
    - Creating a service account for GitHub Actions to deploy to Firebase.
    - Generating a GitHub Actions workflow file (e.g., `.github/workflows/firebase-hosting-pull-request.yml` and `firebase-hosting-merge.yml`).

2.  **Customize Workflow**:
    You might need to customize the generated workflow to include steps for building your frontend and deploying functions if they are not already covered.

    Example snippet for a workflow file:
    ```yaml
    # .github/workflows/firebase-deploy.yml
    name: Deploy to Firebase
    on:
      push:
        branches:
          - main
    jobs:
      build_and_deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - name: Setup Node.js
            uses: actions/setup-node@v3
            with:
              node-version: '18' # Match your Firebase Functions runtime
          
          - name: Install Frontend Dependencies & Build
            run: | # Assuming frontend is in root
              npm ci
              npm run build # Or your frontend build command
              
          - name: Install Functions Dependencies
            run: cd functions && npm ci
            
          - name. Deploy to Firebase
            uses: FirebaseExtended/action-hosting-deploy@v0
            with:
              repoToken: '${{ secrets.GITHUB_TOKEN }}'
              firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_YOUR_PROJECT_ID }}'
              channelId: live # Deploy to live channel on merge to main
              projectId: your-project-id
            # Add this to deploy functions as well:
            # entryPoint: . # Root of your project
            # firebaseToolsVersion: latest # Optional
            # run: firebase deploy --only functions,hosting -P your-project-id --token ${{ secrets.FIREBASE_TOKEN }}
            # The action-hosting-deploy might not deploy functions directly,
            # you might need a separate step or a custom script using firebase-tools.
            # A common pattern is to have the action build everything, then use firebase deploy.
    ```
    Refer to [Firebase documentation for GitHub Actions](https://firebase.google.com/docs/hosting/github-integration) for the most up-to-date practices.

## 🎉 Congratulations!

You've successfully integrated your GraphAI application with Firebase:

✅ **Firebase project setup** for GraphAI.
✅ **GraphAI workflows running as Firebase Functions**.
✅ **Frontend hosted on Firebase Hosting**, interacting with backend functions.
✅ Understanding of how to use **`@receptron/graphai_firebase_functions`**.
✅ Conceptual understanding of where **`@receptron/firebase-tools`** might fit.
✅ Path towards **CI/CD for Firebase deployments**.

## 🚀 Next Steps

### Enhance Your Firebase Integration

-   **Firestore/Realtime Database**: Store user data, workflow configurations, or results.
-   **Firebase Authentication**: Secure your functions and frontend with Firebase Auth.
-   **Cloud Storage for Firebase**: Handle file inputs/outputs for your GraphAI workflows.
-   **Firebase Pub/Sub**: Trigger GraphAI workflows from background events.
-   **Monitoring**: Utilize Firebase's built-in monitoring and logging, or integrate third-party tools.

### Explore More Tutorials

-   **[Streaming Data](streaming-data.md)**: Implement real-time streaming through your Firebase Functions.
-   **[Graph Dashboard](graph-dashboard.md)**: Build a more complex frontend on Firebase Hosting.

## 📚 Reference Materials

-   **[`@receptron/graphai_firebase_functions` Documentation](../reference/packages/firebase-functions.md)**
-   **[`@receptron/firebase-tools` Documentation](../reference/packages/firebase-tools.md)**
-   **[Firebase Functions Documentation](https://firebase.google.com/docs/functions)**
-   **[Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)**
-   **[GraphAI Core Concepts](https://github.com/receptron/graphai/blob/main/docs/README.md)**