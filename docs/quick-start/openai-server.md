# OpenAI-Compatible Server

Transform GraphAI into a production-ready OpenAI API-compatible server with authentication, error handling, and advanced features.

## Overview

The `@receptron/graphai_express` package provides middleware that makes GraphAI compatible with OpenAI's API format, allowing you to:

- **Drop-in replacement** for OpenAI API in existing applications
- **Custom graph processing** with OpenAI-compatible responses
- **Streaming responses** for real-time interactions
- **Error handling** and request validation

## Basic Setup

### Installation

```bash
npm install @receptron/graphai_express graphai @graphai/vanilla @graphai/agents
```

### Simple Server

```javascript
import express from 'express';
import { graphai_express } from '@receptron/graphai_express';

const app = express();

// Basic GraphAI middleware
app.use('/v1', graphai_express());

app.listen(8085, () => {
  console.log('GraphAI OpenAI-compatible server running on port 8085');
});
```

## Advanced Configuration

### Custom Graph Configuration

```javascript
import express from 'express';
import { graphai_express } from '@receptron/graphai_express';

const app = express();

// Advanced configuration
app.use('/v1', graphai_express({
  // Custom graph configuration
  graphConfig: {
    // Define your GraphAI workflow
    nodes: {
      input: {
        agent: 'textInputAgent',
        params: {}
      },
      process: {
        agent: 'openAIAgent',
        params: {
          model: 'gpt-3.5-turbo'
        },
        inputs: [':input']
      },
      output: {
        agent: 'textOutputAgent',
        inputs: [':process']
      }
    }
  },
  
  // Enable streaming responses
  streaming: true,
  
  // Request timeout
  timeout: 30000,
  
  // Custom error handling
  errorHandler: (error, req, res, next) => {
    console.error('GraphAI Error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        type: 'server_error'
      }
    });
  }
}));

app.listen(8085);
```

### Authentication & Security

```javascript
import express from 'express';
import cors from 'cors';
import { graphai_express } from '@receptron/graphai_express';

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/v1', limiter);

// API Key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'authentication_error'
      }
    });
  }
  
  req.user = getUserFromApiKey(apiKey);
  next();
};

// Apply authentication to GraphAI routes
app.use('/v1', authenticateApiKey, graphai_express());

function isValidApiKey(apiKey) {
  // Implement your API key validation logic
  return apiKey === process.env.VALID_API_KEY;
}

function getUserFromApiKey(apiKey) {
  // Return user information based on API key
  return { id: 'user123', plan: 'pro' };
}
```

## Streaming Responses

Enable real-time streaming for chat completions:

```javascript
import { graphai_express } from '@receptron/graphai_express';

app.use('/v1', graphai_express({
  streaming: true,
  
  // Custom streaming configuration
  streamConfig: {
    // Chunk size for streaming
    chunkSize: 1024,
    
    // Stream interval (ms)
    interval: 50,
    
    // Custom stream formatter
    formatChunk: (chunk) => {
      return `data: ${JSON.stringify({
        id: 'chatcmpl-' + Date.now(),
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'gpt-3.5-turbo',
        choices: [{
          index: 0,
          delta: { content: chunk },
          finish_reason: null
        }]
      })}\n\n`;
    }
  }
}));
```

## Testing Your Server

### Basic Chat Completion

```bash
curl -X POST http://localhost:8085/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is GraphAI?"}
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'
```

### Streaming Chat

```bash
curl -X POST http://localhost:8085/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Tell me a story"}
    ],
    "stream": true
  }'
```

### JavaScript Client Example

```javascript
// Using fetch for streaming
async function streamChatCompletion(messages) {
  const response = await fetch('http://localhost:8085/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-api-key'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && !line.includes('[DONE]')) {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices[0]?.delta?.content;
          if (content) {
            console.log(content); // Process the streaming content
          }
        } catch (e) {
          // Handle parsing errors
        }
      }
    }
  }
}

// Usage
streamChatCompletion([
  { role: 'user', content: 'Hello, GraphAI!' }
]);
```

## Production Configuration

### Environment Variables

Create a `.env` file:

```bash
# Server Configuration
PORT=8085
NODE_ENV=production

# API Keys
VALID_API_KEY=your-secure-api-key-here
OPENAI_API_KEY=your-openai-key-for-fallback

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8085/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Monitoring & Logging

```javascript
import express from 'express';
import morgan from 'morgan';
import { graphai_express } from '@receptron/graphai_express';

const app = express();

// Request logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    requests_total: global.requestCount || 0,
    active_connections: global.activeConnections || 0,
    response_time_avg: global.avgResponseTime || 0
  });
});

app.use('/v1', graphai_express());
```

## Next Steps

- **[Add Graph Visualization](add-visualization.md)** - Enhance your server with visual components
- **[Deploy to Production](deployment.md)** - Scale your server with cloud deployment
- **[Complete Tutorial](../tutorials/chat-server.md)** - Build a full chat application
- **[Configuration Guide](../guides/configuration.md)** - Detailed configuration options