# Package: @receptron/firebase-tools

**Version**: `1.0.0` (Production Ready)

## Overview

`@receptron/firebase-tools` is a utility package providing development tools specifically for using GraphAI within the Firebase ecosystem. Based on its file structure (containing `src/firebaseStreamFilter.ts`), a key feature of this package is likely related to processing or adapting streams originating from Firebase event sources.

This package complements `@receptron/graphai_firebase_functions` by providing more specialized utilities that might not fit directly into the core function-wrapping logic.

## Key Features

-   **Firebase Stream Filtering/Processing**: The presence of `firebaseStreamFilter.ts` strongly suggests utilities for handling streams from Firebase event sources like Firestore change streams, Cloud Storage events, or Pub/Sub messages. This could involve:
    -   Parsing raw event data.
    -   Transforming event payloads into a format suitable for GraphAI workflows.
    -   Batching or debouncing events.
    -   Error handling specific to Firebase event streams.
-   **Development Aids**: May include helper functions or scripts for local development and testing of GraphAI applications that are intended for Firebase deployment.
-   **Configuration Helpers**: Potentially utilities to assist in configuring GraphAI or Firebase services for optimal interaction.
-   **TypeScript Support**: Built with TypeScript for type safety.

## Installation

This package would typically be installed as a dependency in the `functions` directory of a Firebase project, alongside `@receptron/graphai_firebase_functions` if you are using both.

```bash
# Navigate to your Firebase project's functions directory
cd functions

npm install @receptron/firebase-tools
# or
yarn add @receptron/firebase-tools
```

## Core API & Usage (Conceptual based on `firebaseStreamFilter.ts`)

The primary utility is likely related to stream processing.

### `firebaseStreamFilter` (Conceptual)

This module might export functions or classes to work with streams from Firebase.

**Scenario 1: Processing Firestore Document Changes**

Imagine a Firebase Function triggered by `onWrite` to a Firestore collection. The trigger provides data about the change. If these changes were to be processed as a stream (e.g., if many documents change rapidly or if you're using Firestore change streams directly if available for your use case), a filter could be useful.

```typescript
// In functions/src/index.ts
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
// Assuming firebaseStreamFilter exports a function or class
import { FirestoreChangeStreamProcessor } from '@receptron/firebase-tools'; 
import { GraphAI } from 'graphai';
// import { myGraphAIConfigForFirestoreEvents } from './graphai-configs';
// import { allAgents } from './agents';

initializeApp();

// export const processMyCollectionChanges = functions.firestore
//   .document('myCollection/{docId}')
//   .onWrite(async (change, context) => {
//     const processor = new FirestoreChangeStreamProcessor({ /* options */ });
    
//     // This is conceptual: Firestore onWrite provides a single Change object.
//     // A real stream scenario might involve listening to snapshot streams or a custom setup.
//     // For a single event, you might just transform the data directly.
//     // const graphAIInput = processor.transformSingleEvent(change, context.params.docId);

//     // If Firestore offered a direct stream of changes for a query, it would look more like:
//     // const firestoreStream = getFirestoreChangeStreamForQuery('myCollection'); // Hypothetical
//     // const processedStream = processor.processStream(firestoreStream);
//     // for await (const item of processedStream) {
//     //   const graph = new GraphAI(myGraphAIConfigForFirestoreEvents, allAgents);
//     //   await graph.run({ firestoreItem: item });
//     // }

//     // More likely for a single onWrite event:
//     const beforeData = change.before.data();
//     const afterData = change.after.data();
//     const eventType = change.before.exists && change.after.exists ? 'update' : (change.after.exists ? 'create' : 'delete');
    
//     functions.logger.info(`Doc ${context.params.docId} ${eventType}`, { beforeData, afterData });

//     // Here, firebase-tools might offer a utility to normalize this event for GraphAI
//     // const normalizedEvent = FirebaseTools.normalizeFirestoreEvent(change, context);
//     // const graph = new GraphAI(myGraphAIConfigForFirestoreEvents, allAgents);
//     // await graph.run({ firestoreEvent: normalizedEvent });

//     return null;
//   });
```

**Scenario 2: Processing Files from Cloud Storage**

A function triggered when a new file is uploaded to Firebase Cloud Storage.

```typescript
// In functions/src/index.ts
// import * as functions from 'firebase-functions';
// import { getStorage } from 'firebase-admin/storage';
// import { initializeApp } from 'firebase-admin/app';
// import { FileStreamProcessor } from '@receptron/firebase-tools'; // Assuming export
// import { GraphAI } from 'graphai';
// import { myFileProcessingWorkflow } from './graphai-configs';
// import { allAgents } from './agents';

// initializeApp(); // If not already done

// export const processUploadedFile = functions.storage.object().onFinalize(async (object) => {
//   const bucket = getStorage().bucket(object.bucket);
//   const filePath = object.name;

//   if (!filePath) {
//     functions.logger.error('File path is undefined.');
//     return;
//   }
//   if (!object.contentType?.startsWith('text/')) {
//     functions.logger.info(`Skipping non-text file: ${filePath}`);
//     return;
//   }

//   const fileStream = bucket.file(filePath).createReadStream();
//   const processor = new FileStreamProcessor({ encoding: 'utf-8', lineByLine: true }); // Conceptual options

//   try {
//     // The processor from firebase-tools would yield chunks (e.g., lines)
//     for await (const line of processor.process(fileStream)) {
//       functions.logger.info(`Processing line from ${filePath}:`, line);
//       // const graph = new GraphAI(myFileProcessingWorkflow, allAgents);
//       // await graph.run({ fileLine: line, originalFile: filePath });
//       // Example: Log each line
//     }
//     functions.logger.info(`Finished processing file ${filePath}`);
//   } catch (error) {
//     functions.logger.error(`Error processing file ${filePath}:`, error);
//   }
// });
```
In these scenarios, `firebaseStreamFilter.ts` would contain the logic for `FirestoreChangeStreamProcessor` or `FileStreamProcessor`, handling the specifics of those Firebase event sources and transforming their outputs into a more generic stream or iterable that GraphAI agents can consume.

## Use Cases

-   **Real-time Data Processing**: Reacting to changes in Firestore and feeding them into GraphAI workflows for analysis, transformation, or triggering further actions.
-   **File Processing Pipelines**: When files are uploaded to Cloud Storage (e.g., CSVs, logs, text documents), use GraphAI to process their content line-by-line or chunk-by-chunk.
-   **Event-Driven Architectures**: Integrating GraphAI with Firebase event sources (Pub/Sub, Auth triggers, etc.) by providing a standardized way to adapt event data for GraphAI consumption.
-   **Local Development & Testing**: The tools might include utilities to mock or simulate Firebase event sources to facilitate local testing of GraphAI workflows that are designed to run in Firebase.

## Relationship with Other Packages

-   **`@receptron/graphai_firebase_functions`**: While `graphai_firebase_functions` helps expose GraphAI as HTTP endpoints, `@receptron/firebase-tools` likely focuses on adapting *non-HTTP* Firebase event sources to feed data *into* GraphAI workflows (which might then be run by `graphai_firebase_functions` if invoked via HTTP, or directly by a `GraphAI` instance in a background function).
-   **`@receptron/stream_utils`**: `firebaseStreamFilter.ts` might internally use utilities from `stream_utils` for common stream manipulation tasks, but specialize them for Firebase-specific stream characteristics.

## Important Considerations

-   **Firebase Event Structure**: Each Firebase service (Firestore, Storage, Pub/Sub, Auth) has its own unique event payload structure. Utilities in this package would need to understand these structures.
-   **Error Handling**: Robust error handling for streams is critical, especially for background functions, to prevent silent failures or infinite retries.
-   **Idempotency**: For event-driven functions, consider whether your GraphAI workflow needs to be idempotent if events can be delivered more than once.

As this package is at version `1.0.0` and marked "Production Ready" in the memory bank, it should have a stable API. The best way to understand its precise capabilities is to:
1.  Examine its exported modules and type definitions (`lib/index.d.ts`, `lib/firebaseStreamFilter.d.ts`).
2.  Look for any `README.md` file within its package directory in the monorepo.
3.  Check for example usages, possibly in the test files of `@receptron/firebase-tools` or in projects that use it.

The [Firebase Integration Tutorial](../../tutorials/firebase-integration.md) provides context on deploying GraphAI to Firebase, where these tools would be most relevant.