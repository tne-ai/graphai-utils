# Package: @receptron/stream_utils

**Version**: `0.0.1` (Early Development)

## Overview

`@receptron/stream_utils` is a utility package designed to provide tools and helper functions for working with Node.js streams, particularly in the context of GraphAI applications. Streaming is crucial for handling large data, real-time interactions (like LLM responses), and efficient I/O operations.

This package likely contains parsers, transformers, and other utilities to simplify common streaming tasks that might arise when building custom GraphAI agents or handling stream-based I/O in services using GraphAI.

## Key Features

-   **Stream Parsing**: Utilities to parse incoming streams (e.g., NDJSON, Server-Sent Events, custom chunked formats). The `src/parser.ts` file strongly suggests this.
-   **Stream Transformation**: Tools to modify, filter, or aggregate data as it flows through a stream.
-   **Node.js Stream Compatibility**: Works with Node.js `Readable`, `Writable`, and `Transform` streams.
-   **Async Iterator Support**: May provide helpers for working with async iterables, which are a common way to consume streams.
-   **TypeScript Support**: Built with TypeScript, offering type safety for stream operations.

## Installation

```bash
npm install @receptron/stream_utils
# or
yarn add @receptron/stream_utils
```
This package is likely a utility library with no direct UI or runtime server component of its own. It's meant to be used as a dependency in other Node.js projects or GraphAI agents.

## Core API & Usage (Conceptual)

The exact API would be defined in `src/index.ts` and `src/parser.ts`. Based on common stream utility patterns, here are some conceptual examples:

### 1. Stream Parsers (from `src/parser.ts`)

#### Example: Parsing a Newline-Delimited JSON (NDJSON) Stream

```typescript
import { Readable } from 'stream';
// Assuming an export like this from @receptron/stream_utils/parser
import { NdjsonParser } from '@receptron/stream_utils'; 

async function processNdjsonStream(stream: Readable) {
  const parser = new NdjsonParser(); // Or NdjsonParser() if it's a function

  // Option 1: Using events (if parser is a Transform stream)
  // stream.pipe(parser)
  //   .on('data', (jsonObject) => {
  //     console.log('Parsed JSON object:', jsonObject);
  //   })
  //   .on('error', (err) => console.error('Parse error:', err))
  //   .on('end', () => console.log('Stream ended.'));

  // Option 2: Using async iteration (if parser returns an async iterable)
  try {
    for await (const jsonObject of parser.parse(stream)) { // Or parser directly if it's an async generator
      console.log('Parsed JSON object:', jsonObject);
      // Use this jsonObject as input to a GraphAI agent or other logic
    }
    console.log('Stream parsing complete.');
  } catch (error) {
    console.error('Error processing NDJSON stream:', error);
  }
}

// Create a sample NDJSON stream
const sampleStream = Readable.from([
  '{"id": 1, "value": "apple"}\n',
  '{"id": 2, "value": "banana"}\n',
  '{"id": 3, "value": "cherry"}' // Last line might not have newline
]);

processNdjsonStream(sampleStream);
```

#### Example: Parsing Server-Sent Events (SSE) Stream

```typescript
import { Readable } from 'stream';
// Assuming an export like this
import { SSEParser } from '@receptron/stream_utils';

async function processSSEStream(stream: Readable) {
  const parser = new SSEParser(); // Or sseParser()

  try {
    for await (const event of parser.parse(stream)) {
      // event might be like: { id?: string, event?: string, data: string, retry?: number }
      console.log(`SSE Event (type: ${event.event || 'message'}):`, event.data);
      if (event.data.trim() === '[DONE]') { // Common OpenAI stream end signal
          console.log('SSE Stream indicated [DONE]');
      }
    }
    console.log('SSE Stream parsing complete.');
  } catch (error) {
    console.error('Error processing SSE stream:', error);
  }
}

// Create a sample SSE stream
const sseSampleStream = Readable.from([
  'id: event1\n',
  'event: update\n',
  'data: {"key": "value1"}\n\n',
  'data: Simple message\n\n',
  ': comment line\n',
  'data: {"key": "value2", "progress": 50}\n\n',
  'data: [DONE]\n\n'
]);

processSSEStream(sseSampleStream);
```

### 2. Stream Transformers

Utilities to modify data as it flows.

#### Example: Filtering a Stream

```typescript
import { Readable, Transform } from 'stream';
// Assuming a utility like this
import { createFilterStream } from '@receptron/stream_utils';

const numberStream = Readable.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `${n}\n`));

// Filter for even numbers (assuming chunks are numbers or stringified numbers)
const evenNumberFilter = createFilterStream((chunk: string | Buffer) => {
  try {
    const num = parseInt(chunk.toString(), 10);
    return num % 2 === 0;
  } catch {
    return false;
  }
});

numberStream
  .pipe(evenNumberFilter)
  .on('data', (evenNumberChunk) => {
    console.log('Even number:', evenNumberChunk.toString().trim());
  })
  .on('end', () => console.log('Filtered stream ended.'));
```

#### Example: Mapping/Transforming Stream Chunks

```typescript
import { Readable, Transform } from 'stream';
// Assuming a utility like this
import { createMapStream } from '@receptron/stream_utils';

const objectStream = Readable.from([
  JSON.stringify({ id: 1, name: "Alice", score: 80 }) + '\n',
  JSON.stringify({ id: 2, name: "Bob", score: 95 }) + '\n'
]);

// Transform to a simpler object with an added status
const statusTransformer = createMapStream((jsonStringChunk: string | Buffer) => {
  try {
    const obj = JSON.parse(jsonStringChunk.toString());
    return JSON.stringify({ 
      userId: obj.id, 
      status: obj.score > 90 ? 'Excellent' : 'Good' 
    }) + '\n';
  } catch (e) {
    // Handle parse error, maybe push an error object or skip
    return null; // Or push an error marker
  }
});

objectStream
  .pipe(statusTransformer)
  .on('data', (transformedChunk) => {
    console.log('Transformed:', transformedChunk.toString().trim());
  })
  .on('end', () => console.log('Transformed stream ended.'));
```

## Use Cases

-   **Custom GraphAI Agents**:
    -   An agent that receives a raw stream (e.g., from an HTTP request or file) and uses parsers from `stream_utils` to process it.
    -   An agent that consumes data from one stream, transforms it using utilities from this package, and outputs another stream.
-   **Server-Side Stream Handling**:
    -   In `graphai_express`'s `streamResponseHandler` to parse or format stream chunks before sending to the client.
    -   Processing incoming streaming data in an Express route before passing it to a GraphAI workflow.
-   **Client-Side Stream Consumption**:
    -   If a GraphAI server sends data in a custom streaming format, a Node.js or browser client could use `stream_utils` (if it has browser-compatible parts) to parse these streams.
-   **Data Pipelines**: Building data processing pipelines where streams are passed between different transformation stages.

## Integration with GraphAI

-   **Input to Agents**: A stream (e.g., `Readable`) can be an input to a GraphAI agent. The agent would then use `for await...of` or pipe it through `stream_utils` transformers/parsers.
-   **Output from Agents**: An agent can return a `Readable` stream. This stream could be generated or transformed using `stream_utils`.
-   **`@receptron/graphai_express` / `@receptron/graphai_firebase_functions`**: If `streaming: true` is enabled, the output stream from the graph's exit node can be directly piped to the HTTP response, potentially after being processed by a `streamResponseHandler` that uses `stream_utils`.

## Testing

-   The package includes `tests/test_parser.ts`, indicating unit tests for its parsing functionalities. This is a good place to look for concrete usage examples of the parsers.

Given its early version (`0.0.1`), the API surface might be small or subject to change. Always refer to the package's own `README.md` (if available), type definitions (`lib/index.d.ts`, `lib/parser.d.ts`), and test files for the most accurate and up-to-date information.

The [Streaming Data Tutorial](../../tutorials/streaming-data.md) provides practical examples of handling streams in a GraphAI context, where these utilities would be highly relevant.