# Package: @receptron/graphai_express_type

**Version**: `0.1.2` (Stable)

## Overview

`@receptron/graphai_express_type` provides TypeScript definitions that are specifically tailored for client-side (browser) consumption of APIs built with `@receptron/graphai_express`. While `@receptron/graphai_express` itself includes comprehensive types for server-side development, this package offers a potentially more lightweight or browser-focused subset of those types.

The primary purpose is to enable type-safe interactions from frontend applications when calling GraphAI Express-powered backends, particularly for understanding request structures expected by the server or the shape of responses (especially OpenAI-compatible ones).

## Key Features

-   **Client-Side Type Safety**: Helps frontend developers correctly type API calls and handle responses.
-   **Browser Compatibility**: Types are designed to be compatible with browser environments, potentially omitting Node.js-specific types that might be part of the main `@receptron/graphai_express` package's full type set.
-   **OpenAI API Structures**: Likely includes types for common OpenAI API request and response payloads (e.g., `ChatCompletionRequest`, `ChatCompletionResponse`).
-   **Lightweight**: May offer a smaller type footprint compared to importing all types from the server-side package.

## Installation

```bash
npm install @receptron/graphai_express_type
# or
yarn add @receptron/graphai_express_type
```
This package typically contains only type definitions (`.d.ts` files) and no runtime JavaScript code. It's usually installed as a regular dependency (not a devDependency) in frontend projects if you need to import types directly.

## Core API & Usage

You would use this package in your frontend TypeScript code to type your API client functions or state management.

```typescript
// Example in a frontend service (e.g., api.ts)
import type { 
  ChatCompletionRequest, // Assuming this type is exported
  ChatCompletionResponse // Assuming this type is exported
} from '@receptron/graphai_express_type';

const API_BASE_URL = '/api'; // Your API base path

export async function getChatCompletion(
  payload: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer YOUR_API_KEY' // If auth is needed
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // Handle API errors, potentially using error types from the package
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API request failed');
  }

  return response.json() as Promise<ChatCompletionResponse>;
}

// Example usage in a Vue or React component:
async function handleSendMessage(userInput: string) {
  const requestPayload: ChatCompletionRequest = {
    model: "gpt-3.5-turbo", // Or the model your backend uses
    messages: [
      { role: "user", content: userInput }
    ],
    // stream: false, // Optional
  };

  try {
    const result: ChatCompletionResponse = await getChatCompletion(requestPayload);
    const assistantMessage = result.choices[0]?.message?.content;
    console.log("Assistant:", assistantMessage);
    // Update UI with assistantMessage
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    // Update UI with error
  }
}
```

### Expected Types (Conceptual)

This package would typically export types like:

-   `OpenAIError`: Structure for OpenAI-compatible error responses.
-   `Message`: Interface for `{ role: string, content: string }`.
-   `ChatCompletionRequest`: Interface for the request body of `/v1/chat/completions`.
    -   `model: string`
    -   `messages: Message[]`
    -   `temperature?: number`
    -   `max_tokens?: number`
    -   `stream?: boolean`
    -   ... other OpenAI parameters
-   `ChatCompletionChoice`: Interface for a choice object in the response.
-   `ChatCompletionResponse`: Interface for the full response from `/v1/chat/completions`.
    -   `id: string`
    -   `object: string`
    -   `created: number`
    -   `model: string`
    -   `choices: ChatCompletionChoice[]`
    -   `usage?: { prompt_tokens: number, completion_tokens: number, total_tokens: number }`
-   Types for streaming chunks if applicable (e.g., `ChatCompletionChunk`).
-   Potentially types for other OpenAI endpoints like Embeddings, if supported by `@receptron/graphai_express`.

The build process for this package, as indicated by `cp ../express/lib/type.* lib/` in its `package.json`, suggests it directly copies type definition files (likely `type.d.ts` and `type.js` if there's any minimal JS helper) from the main `@receptron/graphai_express` package's `lib` directory. This ensures type consistency while allowing for a separate, client-focused package.

## Use Cases

-   Frontend applications (Vue, React, Angular, Svelte, Vanilla JS with TypeScript) that need to communicate with a backend built using `@receptron/graphai_express`.
-   Ensuring that the request payloads sent by the client match what the server expects.
-   Providing type safety when handling responses from the server, making it easier to access nested properties.
-   Sharing common types between frontend and backend if both are part of the same monorepo (though in that case, direct path imports or TypeScript project references might also be used).

## Relationship to `@receptron/graphai_express`

-   **Source of Types**: The types are derived or directly copied from `@receptron/graphai_express`.
-   **Purpose**: While `@receptron/graphai_express` is for building the server, `@receptron/graphai_express_type` is for consuming the server's API from a client.
-   **Runtime Code**: This package is expected to contain primarily type definitions and minimal to no runtime JavaScript code. Its main role is during development and compile-time type checking.

If you are developing both the frontend and backend, using this package can help maintain consistency in the data structures exchanged over the API.