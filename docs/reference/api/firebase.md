# API Reference: Firebase Integration

This page details the API for packages related to Firebase integration:
-   `@receptron/graphai_firebase_functions`
-   `@receptron/firebase-tools` (specifically conceptual utilities like `firebaseStreamFilter`)

## `@receptron/graphai_firebase_functions`

### `graphai_firebase(config: GraphAIFirebaseFunctionConfig): FirebaseHttpHandler`

This is the main function exported by `@receptron/graphai_firebase_functions`. It's a factory that returns an HTTP request handler suitable for Firebase Cloud Functions (`functions.https.onRequest`).

-   **`config`**: `GraphAIFirebaseFunctionConfig` - An object containing the configuration for the handler.
-   **Returns**: `FirebaseHttpHandler` - A function `(req: functions.https.Request, res: functions.Response) => void | Promise<void>` that can be exported as a Firebase Function.

### `GraphAIFirebaseFunctionConfig` Interface

This interface is very similar to `GraphAIExpressConfig` from `@receptron/graphai_express`.

```typescript
import * as functions from 'firebase-functions'; // For Request, Response types
import { GraphAIConfig, GraphAI, Logger as GraphAILogger } from 'graphai';
import { Readable } from 'stream';

// Define a compatible logger type if not directly from graphai
type CompatibleLogger = Pick<GraphAILogger, 'debug' | 'info' | 'warn' | 'error'>;

export interface GraphAIFirebaseFunctionConfig {
  // Core GraphAI workflow configuration
  graphConfig?: GraphAIConfig | ((req: functions.https.Request) => GraphAIConfig | Promise<GraphAIConfig>);
  
  // Configuration for streaming requests
  streaming?: boolean; // Default: false
  streamingConfig?: GraphAIConfig | ((req: functions.https.Request) => GraphAIConfig | Promise<GraphAIConfig>);

  // Request and response transformation functions
  transformRequest?: (req: functions.https.Request) => Record<string, any> | Array<any> | Promise<Record<string, any> | Array<any>>;
  transformResponse?: (graphAIResult: any, req: functions.https.Request, res: functions.Response) => any | Promise<any>;
  
  // Custom handler for streaming responses
  streamResponseHandler?: (
    stream: Readable | AsyncIterable<any>, 
    req: functions.https.Request, 
    res: functions.Response
  ) => Promise<void>;

  // Error handling
  errorHandler?: (
    err: Error, 
    req: functions.https.Request, 
    res: functions.Response, 
    defaultErrorHandler: (err: Error, req: functions.https.Request, res: functions.Response) => void
  ) => void;

  // Operational settings
  logger?: CompatibleLogger; // e.g., functions.logger

  // CORS settings (can also be handled at Firebase Hosting rewrite level)
  cors?: boolean | string | string[]; // true for all, or specific origins

  // OpenAI API compatibility settings (similar to graphai_express)
  openAICompatibleBasePath?: string; // Default: "/v1"
  disableOpenAICompatibleRoutes?: boolean; // Default: false
  
  // Note: Firebase-specific timeout and memory are set when defining the function,
  // e.g., functions.runWith({ timeoutSeconds: 120, memory: '1GB' }).https.onRequest(...)
  // However, an internal timeout for GraphAI execution itself might be present like in express.
  timeout?: number; // Optional: Internal GraphAI execution timeout
}
```
The properties and their behavior largely mirror those in `GraphAIExpressConfig` from `@receptron/graphai_express`, with the main difference being that `req` and `res` objects are Firebase's `functions.https.Request` and `functions.Response` types.

Refer to the [`@receptron/graphai_express` API documentation](express.md) for more detailed explanations of common properties like `graphConfig`, `streaming`, `transformRequest`, `transformResponse`, `errorHandler`, and OpenAI compatibility options, as their purpose is analogous.

## `@receptron/firebase-tools`

This package provides utilities for working with GraphAI in Firebase environments, with a likely focus on stream processing from Firebase event sources, indicated by `firebaseStreamFilter.ts`. The API here is more conceptual as it depends on the specific utilities exported.

### Conceptual `FirebaseStreamFilter` Utilities

These are hypothetical examples based on the package's purpose.

#### `FirestoreChangeStreamProcessor` (Conceptual Class or Functions)

Could be used to process data from Firestore triggers (e.g., `onWrite`, `onCreate`, `onUpdate`, `onDelete`) or Firestore change streams if used directly.

```typescript
// Conceptual Usage
// import { FirestoreChangeStreamProcessor } from '@receptron/firebase-tools';
// import * as functions from 'firebase-functions';

// export const myFirestoreTrigger = functions.firestore
//   .document('myCollection/{docId}')
//   .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
//     const processor = new FirestoreChangeStreamProcessor({ /* options */ });
//     const normalizedEvent = processor.normalizeEvent(change, context.params.docId);
//     
//     // Pass normalizedEvent to a GraphAI workflow
//     // const graph = new GraphAI(config, agents);
//     // await graph.run({ firestoreData: normalizedEvent });
//   });
```
-   **`normalizeEvent(change, docId)`**: Might take a Firestore `Change` object and context params, returning a standardized object suitable as input for a GraphAI workflow.
-   **`processStream(firestoreNativeStream)`**: If directly working with a lower-level Firestore stream, this might adapt it into an `AsyncIterable` of processed items.

#### `FileStreamProcessor` (Conceptual Class or Functions)

For processing files from Firebase Cloud Storage, typically within an `functions.storage.object().onFinalize` trigger.

```typescript
// Conceptual Usage
// import { FileStreamProcessor } from '@receptron/firebase-tools';
// import * as functions from 'firebase-functions';
// import { getStorage } from 'firebase-admin/storage';

// export const myStorageTrigger = functions.storage.object().onFinalize(async (objectMetadata) => {
//   const bucket = getStorage().bucket(objectMetadata.bucket);
//   const fileStream = bucket.file(objectMetadata.name!).createReadStream();
//   
//   const processor = new FileStreamProcessor({ lineByLine: true, encoding: 'utf8' });
//   
//   for await (const line of processor.process(fileStream)) {
//     // Pass line to a GraphAI workflow
//     // const graph = new GraphAI(lineProcessingConfig, agents);
//     // await graph.run({ textLine: line });
//   }
// });
```
-   **`process(stream: Readable)`**: Takes a Node.js `ReadableStream` (from `file.createReadStream()`) and returns an `AsyncIterable` of processed chunks (e.g., lines, parsed CSV rows, etc.).
-   Options might include `encoding`, `lineByLine`, `csvParseOptions`, etc.

#### Other Potential Utilities

-   **Pub/Sub Message Parser**: A utility to parse messages from `functions.pubsub.topic().onPublish()` triggers.
-   **Firebase Auth Event Normalizer**: Adapt user creation/deletion events from `functions.auth.user().onCreate()` or `onDelete()`.
-   **Helpers for Local Emulation**: Functions to assist in testing Firebase-triggered GraphAI workflows locally by simulating event payloads.

To understand the precise API of `@receptron/firebase-tools`:
1.  Check for a `README.md` in its package directory.
2.  Examine its main export file (likely `lib/index.js` or `lib/index.d.ts`).
3.  Look at the type definitions for `lib/firebaseStreamFilter.d.ts` and other exported modules.
4.  Review any test files within the package for usage examples.

The [Firebase Integration Tutorial](../../tutorials/firebase-integration.md) provides practical examples of using `@receptron/graphai_firebase_functions` and discusses where tools from `@receptron/firebase-tools` would be applicable.