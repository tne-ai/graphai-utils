# Handle Real-Time Streaming Data

Learn how to process and manage real-time streaming data in your GraphAI applications using `@receptron/stream_utils` and streaming capabilities of agents like `openAIStreamAgent`.

## 🎯 What You'll Build

- **A GraphAI server endpoint** that handles streaming requests and produces streaming responses.
- **A client-side application** (Node.js or browser) that consumes and displays these streams.
- **Usage of `@receptron/stream_utils`** for parsing, transforming, or manipulating data streams.
- **Integration of streaming agents** (e.g., `openAIStreamAgent`) in a GraphAI workflow.

## 📋 Prerequisites

- **Node.js 16+** installed.
- Basic knowledge of **Express.js** and **JavaScript/TypeScript**.
- Understanding of **GraphAI workflows** and agents.
- Familiarity with **async iterators** and **ReadableStreams** in JavaScript.
- A running GraphAI server setup (see [Chat Server Tutorial](chat-server.md) for a base).

⏱️ **Estimated time**: 60-75 minutes

## 🛠️ Step 1: Server Setup for Streaming

We'll modify the chat server from the [Chat Server Tutorial](chat-server.md) to better illustrate streaming.

### Install/Verify Dependencies
Ensure your server project has the necessary packages:
```bash
npm install @receptron/graphai_express @receptron/stream_utils graphai @graphai/vanilla @graphai/agents express
```

### Configure a Streaming GraphAI Workflow
In your server's GraphAI configuration (e.g., `src/config/graphai-config.ts` from the chat server tutorial), ensure you have a workflow designed for streaming. The `openAIStreamAgent` is key here.

```typescript
// src/config/graphai-config.ts (example for streaming)
import { GraphAIConfig } from 'graphai';

export const createAdvancedStreamingConfig = (): GraphAIConfig => ({
  nodes: {
    userInput: {
      agent: "textInputAgent",
      params: {
        message: "${messages.content}" // Assuming input format from chat server
      }
    },
    systemMessage: {
      agent: "textTemplateAgent",
      params: {
        template: "${messages.system || 'You are a helpful streaming AI.'}"
      }
    },
    // Agent that produces a stream
    llmStreamer: {
      agent: "openAIStreamAgent", // This agent must output a stream
      params: {
        model: "${model || 'gpt-3.5-turbo'}",
        temperature: "${temperature || 0.7}",
        system: "${:systemMessage}"
      },
      inputs: [":userInput"]
    },
    // stream_utils can be used here if a custom stream transformation is needed
    // For example, a chunk parser or a rate limiter for the stream itself
    chunkProcessor: {
      // This is a conceptual agent using stream_utils.
      // You might build this custom agent or use stream_utils directly in the express handler.
      agent: "customStreamTransformAgent", 
      params: {
        // e.g., using a parser from @receptron/stream_utils
        // parser: new StreamUtils.JSONChunkParser() 
      },
      inputs: [":llmStreamer"] // Takes the stream from llmStreamer
    },
    // Formats each chunk for SSE (Server-Sent Events)
    sseFormatter: {
      agent: "streamFormatterAgent", 
      params: {
        format: "openai_chat_completion_chunk" // Or a custom SSE format
      },
      inputs: [":chunkProcessor"] // Or directly from ":llmStreamer" if no custom processing
    }
  },
  entry: "userInput",
  exit: "sseFormatter" // The final output should be the formatted stream
});
```

### Update Express Server for Streaming
In `src/server.ts`, ensure `graphai_express` is configured to handle streaming.

```typescript
// src/server.ts
import { graphai_express } from '@receptron/graphai_express';
import { createAdvancedStreamingConfig } from './config/graphai-config'; // Your config

// ... other imports and setup ...

app.use('/v1/stream', // A dedicated streaming endpoint
  // ... authentication, rateLimit middleware ...
  graphai_express({
    // IMPORTANT: Use the streaming-specific config for this route
    graphConfig: createAdvancedStreamingConfig(), // This config MUST be designed for streaming output
    streaming: true, // Enable streaming mode in graphai_express

    // Optional: Custom stream handling if graphConfig doesn't output SSE directly
    // streamResponseHandler: async (stream, req, res) => {
    //   res.setHeader('Content-Type', 'text/event-stream');
    //   res.setHeader('Cache-Control', 'no-cache');
    //   res.setHeader('Connection', 'keep-alive');
    //   res.flushHeaders(); // Important for SSE

    //   try {
    //     for await (const chunk of stream) {
    //       // Here, use @receptron/stream_utils if needed for chunk processing
    //       // const processedChunk = StreamUtils.transform(chunk);
    //       res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    //     }
    //   } catch (error) {
    //     console.error("Stream error:", error);
    //     // Try to write an error to the client if headers not sent
    //     if (!res.headersSent) {
    //        res.status(500).json({ error: "Stream processing failed" });
    //     }
    //   } finally {
    //     res.end();
    //   }
    // },
    
    errorHandler: (error, req, res, next) => {
      // ... your error handling ...
      logger.error('Streaming Endpoint Error', { error: error.message });
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to initiate stream" });
      } else {
        // If headers sent, can only end the response, maybe log client-side error
        res.end();
      }
    }
  })
);

// ... app.listen ...
```
**Note**: The `streamFormatterAgent` in the `graphConfig` is often preferred as it keeps stream formatting logic within the GraphAI workflow. The `streamResponseHandler` is an alternative for more complex, direct Express-level control.

## 🛠️ Step 2: Using `@receptron/stream_utils`

`@receptron/stream_utils` provides utilities for working with streams. This could be on the server (inside a custom agent or handler) or on the client.

### Example: Custom Stream Transformation Agent (Conceptual)
If you were to build `customStreamTransformAgent` mentioned above:

```typescript
// src/agents/customStreamTransformAgent.ts
import { AgentFunction } from 'graphai';
import { Readable } from 'stream';
// Assuming stream_utils has a parser or transformer class/function
import { LineByLineParser, /* other utils */ } from '@receptron/stream_utils'; 

export const customStreamTransformAgent: AgentFunction<{ parserType?: string }, Readable, Readable> = async ({
  inputs,
  params
}) => {
  const inputStream = inputs[0]; // Assuming stream is the first input

  // Create a new Readable stream for the output
  const outputStream = new Readable({ read() {} });

  const parser = params.parserType === 'line' ? new LineByLineParser() : null; // Example

  (async () => {
    try {
      for await (const chunk of inputStream) {
        let processedChunk = chunk;
        if (parser && chunk instanceof Buffer) { // Or string
          // This is conceptual. Actual parser API from stream_utils will differ.
          // parser.push(chunk.toString()); 
          // let line;
          // while(line = parser.pop()) {
          //   outputStream.push(JSON.stringify({ type: "line_data", content: line }) + "\n");
          // }
          // For simplicity, let's assume a direct transform for now
          processedChunk = `[PROCESSED]: ${chunk.toString()}`;
        } else {
          // If no specific parser, or chunk is not buffer/string, pass through or handle
          processedChunk = chunk.toString(); // Ensure it's a string for this example
        }
        outputStream.push(processedChunk);
      }
      outputStream.push(null); // End the output stream
    } catch (error) {
      outputStream.destroy(error as Error);
    }
  })();

  return outputStream;
};
```
**Note**: The actual API of `@receptron/stream_utils` is crucial here. This is a simplified, conceptual example. The utils might provide pipeable Node.js Transform streams, async generator functions, or other helpers.

### Server-Side Stream Parsing (Alternative to Agent)
If you need to parse a stream from an external source *before* it enters GraphAI:

```typescript
// In an Express route handler before calling graphai_express
// app.post('/ingest-stream', async (req, res) => {
//   const externalStream = getExternalStream(); // Function to get a stream
//   const parser = new StreamUtils.SomeParser(); // From @receptron/stream_utils
//   const processedDataForGraphAI = [];

//   for await (const item of parser.parse(externalStream)) {
//     processedDataForGraphAI.push(item);
//   }
  
//   // Now pass processedDataForGraphAI to GraphAI (not as a stream input)
//   // This is for ingesting and processing a stream, then feeding results to GraphAI.
// });
```

## 🛠️ Step 3: Client-Side Stream Consumption

### Node.js Client Example

Create `test-streaming-client.js`:
```javascript
// test-streaming-client.js
async function consumeStream() {
  console.log('Attempting to connect to streaming endpoint...');
  try {
    const response = await fetch('http://localhost:8085/v1/stream/chat/completions', { // Ensure endpoint matches server
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_api_key_here' // Use a valid key
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Or whatever your graph expects
        messages: [
          { role: 'user', content: 'Tell me a very long story about a brave robot.' }
        ],
        stream: true // Standard OpenAI param to indicate streaming preference
      })
    });

    if (!response.ok) {
      console.error(`Error from server: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return;
    }

    console.log('Connected to stream. Waiting for data...');
    
    // Assuming server sends Server-Sent Events (SSE)
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('\nStream finished.');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Process buffer line by line for SSE
      let eolIndex;
      while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
        const eventBlock = buffer.substring(0, eolIndex);
        buffer = buffer.substring(eolIndex + 2);

        if (eventBlock.startsWith('data: ')) {
          const jsonData = eventBlock.substring(6);
          if (jsonData.trim() === '[DONE]') { // OpenAI-like stream end signal
            console.log('\n[DONE] signal received.');
            // The stream might still send a final empty data: [DONE] or just close
            continue;
          }
          try {
            const parsed = JSON.parse(jsonData);
            // Assuming OpenAI chunk format
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              process.stdout.write(content);
            } else if (parsed.error) {
              console.error('\nError in stream chunk:', parsed.error);
            }
          } catch (e) {
            console.warn('\nCould not parse JSON chunk:', jsonData, e.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('\nFailed to connect or consume stream:', error.message);
  }
}

consumeStream();
```
Run with `node test-streaming-client.js`.

### Browser Client Example (Conceptual using `EventSource`)

If your server correctly implements Server-Sent Events (SSE).

```html
<!-- public/index.html or similar -->
<!DOCTYPE html>
<html>
<head>
    <title>GraphAI Stream Test</title>
</head>
<body>
    <h1>Streaming Data</h1>
    <button id="startStream">Start Stream</button>
    <div id="output" style="white-space: pre-wrap; border: 1px solid #ccc; padding: 10px; min-height: 100px;"></div>

    <script>
        const outputDiv = document.getElementById('output');
        const startButton = document.getElementById('startStream');
        let eventSource;

        startButton.onclick = () => {
            if (eventSource) {
                eventSource.close();
            }
            outputDiv.textContent = 'Starting stream...\n';

            // Construct the URL for EventSource. POST body needs to be sent via a different mechanism
            // or use fetch API for POST and then handle the stream.
            // For simplicity, if your streaming endpoint supports GET with query params for a demo:
            // eventSource = new EventSource('/v1/stream/chat/completions?message=Hello&model=gpt-3.5-turbo');
            
            // More realistically, you initiate with fetch POST, then handle the ReadableStream
            // This example uses fetch for POST and manual SSE parsing.
            fetch('/v1/stream/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your_api_key_here'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: 'Tell me a story about a web developer.' }],
                    stream: true
                })
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                function processText({ done, value }) {
                    if (done) {
                        outputDiv.textContent += '\nStream complete.';
                        return;
                    }
                    buffer += decoder.decode(value, { stream: true });
                    
                    let eolIndex;
                    while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
                        const eventBlock = buffer.substring(0, eolIndex);
                        buffer = buffer.substring(eolIndex + 2);

                        if (eventBlock.startsWith('data: ')) {
                            const jsonData = eventBlock.substring(6);
                             if (jsonData.trim() === '[DONE]') {
                                outputDiv.textContent += '\n[DONE]';
                                continue;
                            }
                            try {
                                const parsed = JSON.parse(jsonData);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    outputDiv.textContent += content;
                                }
                            } catch (e) {
                                console.warn('Could not parse JSON chunk:', jsonData, e.message);
                                outputDiv.textContent += `\nError parsing: ${jsonData}\n`;
                            }
                        }
                    }
                    return reader.read().then(processText);
                }
                return reader.read().then(processText);
            })
            .catch(error => {
                console.error('Streaming error:', error);
                outputDiv.textContent += `\nError: ${error.message}`;
            });
        };
    </script>
</body>
</html>
```
**Note on Browser Client**: `EventSource` API is simpler for SSE but doesn't support POST requests with bodies directly. The `fetch` API example above shows how to handle a POST request and then read its streaming body, manually parsing SSEs.

## ✅ Step 4: Testing and Validation

- **Start your GraphAI server** (`npm run dev`).
- **Run your Node.js client** (`node test-streaming-client.js`) or open the HTML page in a browser.
- **Observe the output**: Chunks of data should appear incrementally.
- **Check server logs**: Look for any errors or unexpected behavior.
- **Test edge cases**:
    - What happens if the client disconnects abruptly?
    - How does the server handle errors during stream generation?
    - Test with different input prompts to see varying stream lengths.

## 🎉 Congratulations!

You've successfully set up and consumed streaming data with GraphAI:

✅ **Server endpoint for streaming** using `graphai_express`.
✅ **GraphAI workflow** with streaming agents like `openAIStreamAgent`.
✅ **Client-side consumption** of streams (Node.js and browser concepts).
✅ Explored conceptual use of **`@receptron/stream_utils`** for stream manipulation.

## 🚀 Next Steps

### Enhance Streaming Capabilities

- **Bidirectional Streaming**: Explore WebSockets for full-duplex communication if needed.
- **Advanced Stream Processing**: Implement more complex transformations with `@receptron/stream_utils` or custom Node.js Transform streams within your agents.
- **Stream Buffering/Caching**: For scenarios where clients might join mid-stream or need to catch up.
- **Error Propagation**: Ensure errors from within the stream are correctly propagated to the client.
- **Backpressure Handling**: If your stream source is very fast, ensure your processing and client consumption can keep up, or implement backpressure.

### Explore More Tutorials

- **[Graph Dashboard](graph-dashboard.md)**: Visualize the status of streaming agents.
- **[Agent Generator](agent-generator.md)**: Create a UI to configure parameters for your streaming agents.

## 📚 Reference Materials

- **[Express Package Documentation](../reference/packages/express.md)**
- **[`@receptron/stream_utils` Documentation](../reference/packages/stream-utils.md)** (Link to actual docs)
- **[Node.js Streams API](https://nodejs.org/api/stream.html)**
- **[MDN Fetch API (ReadableStream)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#body)**
- **[MDN Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)**