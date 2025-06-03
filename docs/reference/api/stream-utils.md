# API Reference: @receptron/stream_utils

This page outlines the conceptual API for the `@receptron/stream_utils` package, focusing on utilities for Node.js stream processing.

## Overview

`@receptron/stream_utils` provides helper functions and classes to simplify common tasks when working with streams in Node.js, particularly relevant for GraphAI agents or services that produce or consume streaming data. Key functionalities likely revolve around parsing and transforming streams.

The primary source files indicated are `src/index.ts` (main exports) and `src/parser.ts` (parsing utilities).

## Parsing Utilities (from `parser.ts`)

These utilities are designed to parse incoming `ReadableStream` data into meaningful chunks or objects.

### `NdjsonParser` (Conceptual Class or Functions)

For parsing Newline Delimited JSON (NDJSON) streams. Each line is a separate JSON object.

**Conceptual API:**
```typescript
import { Readable } from 'stream';
// import { NdjsonParser } from '@receptron/stream_utils'; // Or a function like parseNdjsonStream

// If it's a class that returns an AsyncIterable:
// const parser = new NdjsonParser(options?: NdjsonParserOptions);
// async function* parse(stream: Readable): AsyncIterable<Record<string, any>>;

// If it's a Transform stream:
// class NdjsonParser extends Transform { constructor(options?: TransformOptions); }
// Usage: readableStream.pipe(new NdjsonParser()).on('data', (obj) => { ... });
```
-   **Options**: Might include `maxObjectSize`, error handling for invalid JSON lines.
-   **Output**: Yields JavaScript objects, one for each valid JSON line.

### `SSEParser` (Conceptual Class or Functions)

For parsing Server-Sent Events (SSE) streams.

**Conceptual API:**
```typescript
import { Readable } from 'stream';
// import { SSEParser, SSEEvent } from '@receptron/stream_utils';

// interface SSEEvent {
//   id?: string;
//   event?: string; // Defaults to 'message'
//   data: string;
//   retry?: number;
// }

// If it's a class that returns an AsyncIterable:
// const parser = new SSEParser(options?: SSEParserOptions);
// async function* parse(stream: Readable): AsyncIterable<SSEEvent>;

// If it's a Transform stream:
// class SSEParser extends Transform { constructor(options?: TransformOptions); }
// Usage: readableStream.pipe(new SSEParser()).on('data', (event: SSEEvent) => { ... });
```
-   **Options**: Could include handling for comments, custom event types.
-   **Output**: Yields `SSEEvent` objects, each representing a complete event from the stream.

### Other Potential Parsers

-   **CSV Parser**: For streaming CSV data.
-   **Fixed-Width Parser**: For text streams with fixed-width fields.
-   **XML/HTML Stream Parser**: More complex, might use a library like `sax-js` internally.

## Stream Transformation Utilities (from `index.ts` or other modules)

These utilities would likely be Node.js `Transform` streams or functions that return them, or async generator functions for transforming async iterables.

### `createFilterStream(filterFn)` (Conceptual)

Creates a `Transform` stream that only passes through chunks for which `filterFn` returns true.

```typescript
// import { createFilterStream } from '@receptron/stream_utils';
// type FilterFunction = (chunk: any, encoding?: string) => boolean | Promise<boolean>;
// function createFilterStream(filterFn: FilterFunction, options?: TransformOptions): Transform;
```
-   `filterFn(chunk, encoding)`: A function that receives a chunk and returns `true` to keep it, `false` to discard. Can be async.

### `createMapStream(mapFn)` (Conceptual)

Creates a `Transform` stream that applies `mapFn` to each chunk.

```typescript
// import { createMapStream } from '@receptron/stream_utils';
// type MapFunction = (chunk: any, encoding?: string) => any | Promise<any>;
// function createMapStream(mapFn: MapFunction, options?: TransformOptions): Transform;
```
-   `mapFn(chunk, encoding)`: A function that receives a chunk and returns the transformed chunk. Can be async. If it returns `null` or `undefined`, the chunk might be filtered out.

### `createBatchStream(batchSize, timeoutMs?)` (Conceptual)

Creates a `Transform` stream that groups incoming chunks into arrays (batches).

```typescript
// import { createBatchStream } from '@receptron/stream_utils';
// function createBatchStream(batchSize: number, timeoutMs?: number, options?: TransformOptions): Transform;
```
-   `batchSize`: Maximum number of items in a batch.
-   `timeoutMs`: Optional. Maximum time to wait before emitting an incomplete batch.
-   **Output**: Emits arrays of chunks.

### `streamToAsyncIterable(stream)` (Conceptual)

A utility to convert a Node.js `ReadableStream` into an `AsyncIterable`, if not already provided by Node.js versions (newer Node versions make Readables async iterable by default).

```typescript
// import { streamToAsyncIterable } from '@receptron/stream_utils';
// function streamToAsyncIterable<T = any>(stream: Readable): AsyncIterable<T>;
```

## General Helper Utilities

-   **`pipelinePromise(...streams)`**: A promisified version of `stream.pipeline`.
-   **`drainStream(stream)`**: Consumes a stream completely, perhaps collecting all data (if small enough) or just ensuring it flows.
-   **Error Handling Wrappers**: Utilities to simplify error handling in stream pipelines.

## Usage in GraphAI Agents

Custom GraphAI agents can leverage these utilities:

```typescript
// import { AgentFunction } from 'graphai';
// import { Readable } from 'stream';
// import { NdjsonParser, createMapStream } from '@receptron/stream_utils'; // Conceptual imports

// interface MyStreamingAgentParams { transformationType: string; }

// export const myStreamingProcessorAgent: AgentFunction<MyStreamingAgentParams, [Readable], Readable> = 
//   async ({ inputs, params, log }) => {
//     const inputStream = inputs[0];
//     if (!(inputStream instanceof Readable)) {
//       throw new Error("Input must be a ReadableStream");
//     }

//     const parser = new NdjsonParser(); // Assuming it's a Transform stream
//     const transformer = createMapStream(async (obj: any) => {
//       log?.debug("Transforming object:", obj);
//       // Apply transformation based on params.transformationType
//       return { ...obj, processed: true, type: params.transformationType };
//     });

//     // Chain the streams: inputStream -> parser -> transformer -> outputStream
//     // The result of pipeline is the last stream, which is readable.
//     // Node.js stream.pipeline handles errors and stream destruction.
//     // For simplicity, directly returning the transformed stream.
//     // In a real scenario, you might need to handle the pipeline completion/errors.
    
//     // This is a simplified representation. stream.pipeline might be better.
//     const outputStream = inputStream.pipe(parser).pipe(transformer);
//     return outputStream; 
//   };
```

This API reference is conceptual. The actual exported functions, classes, and their options should be verified from:
1.  The package's `lib/index.d.ts` and `lib/parser.d.ts` (or equivalent type definition files).
2.  Any `README.md` or documentation specific to the `@receptron/stream_utils` package.
3.  Unit tests within the package (e.g., `tests/test_parser.ts`).

The [Streaming Data Tutorial](../../tutorials/streaming-data.md) provides more context on how such utilities would be applied.