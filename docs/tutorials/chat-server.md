# Build a Chat Server

Learn to build a complete OpenAI-compatible chat server with GraphAI, featuring streaming responses, authentication, and production-ready deployment.

## 🎯 What You'll Build

By the end of this tutorial, you'll have:

- **OpenAI-compatible API server** that works with existing OpenAI client libraries
- **Streaming chat responses** for real-time user experience
- **Authentication system** with API key validation
- **Error handling** and request validation
- **Docker configuration** for easy deployment

## 📋 Prerequisites

- **Node.js 16+** installed
- Basic knowledge of **Express.js** and **JavaScript/TypeScript**
- Familiarity with **REST APIs** and **HTTP requests**

⏱️ **Estimated time**: 30-45 minutes

## 🛠️ Step 1: Project Setup

### Create New Project

```bash
mkdir graphai-chat-server
cd graphai-chat-server
npm init -y
```

### Install Dependencies

```bash
# Core dependencies
npm install @receptron/graphai_express graphai @graphai/vanilla @graphai/agents express cors dotenv

# Development dependencies  
npm install -D typescript @types/node @types/express ts-node nodemon
```

### TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Environment Configuration

Create `.env`:

```bash
PORT=8085
NODE_ENV=development
API_KEY=your_secure_api_key_here
OPENAI_API_KEY=your_openai_key_here
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## 🛠️ Step 2: Basic Server Setup

Create `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { graphai_express } from '@receptron/graphai_express';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// GraphAI OpenAI-compatible endpoint
app.use('/v1', graphai_express({
  // Basic configuration - we'll enhance this
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'server_error'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GraphAI Chat Server running on http://localhost:${PORT}`);
  console.log(`📖 OpenAI API available at http://localhost:${PORT}/v1`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
```

### Package.json Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "curl -f http://localhost:8085/health"
  }
}
```

### Test Basic Server

```bash
npm run dev
```

Visit `http://localhost:8085/health` to verify it's working.

## 🛠️ Step 3: Add Authentication

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    apiKey: string;
    plan: string;
  };
}

export const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Missing or invalid authorization header',
        type: 'authentication_error',
        code: 'missing_api_key'
      }
    });
  }

  const apiKey = authHeader.replace('Bearer ', '');
  
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'authentication_error',
        code: 'invalid_api_key'
      }
    });
  }

  // Add user info to request
  req.user = {
    id: 'user_' + apiKey.slice(-8),
    apiKey: apiKey,
    plan: 'free' // In real app, get from database
  };

  next();
};

function isValidApiKey(apiKey: string): boolean {
  // In production, validate against database
  const validKeys = [
    process.env.API_KEY,
    'demo_key_12345',
    'test_key_67890'
  ];
  
  return validKeys.includes(apiKey);
}

// Rate limiting middleware
export const rateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRequests = requests.get(key)!;
    
    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        error: {
          message: 'Too many requests',
          type: 'rate_limit_exceeded',
          code: 'rate_limit'
        }
      });
    }
    
    userRequests.count++;
    next();
  };
};
```

Update `src/server.ts` to use authentication:

```typescript
import { authenticateApiKey, rateLimit } from './middleware/auth';

// Apply authentication and rate limiting to GraphAI routes
app.use('/v1', 
  authenticateApiKey,
  rateLimit(50, 15 * 60 * 1000), // 50 requests per 15 minutes
  graphai_express({
    // Configuration will be added in next step
  })
);
```

## 🛠️ Step 4: Configure GraphAI Workflow

Create `src/config/graphai-config.ts`:

```typescript
import { GraphAIConfig } from 'graphai';

export const createChatConfig = (): GraphAIConfig => ({
  nodes: {
    // Input processing
    input: {
      agent: 'textInputAgent',
      params: {
        message: '${messages.content}'
      }
    },
    
    // System message handling
    systemPrompt: {
      agent: 'textTemplateAgent',
      params: {
        template: '${messages.system || "You are a helpful AI assistant."}'
      }
    },
    
    // Chat completion with OpenAI
    chatCompletion: {
      agent: 'openAIAgent',
      params: {
        model: '${model || "gpt-3.5-turbo"}',
        temperature: '${temperature || 0.7}',
        max_tokens: '${max_tokens || 2048}',
        stream: '${stream || false}',
        system: '${:systemPrompt}'
      },
      inputs: [':input']
    },
    
    // Format output for OpenAI compatibility
    output: {
      agent: 'textOutputAgent',
      params: {
        format: 'openai_chat_completion'
      },
      inputs: [':chatCompletion']
    }
  },
  
  // Entry and exit points
  entry: 'input',
  exit: 'output'
});

export const createStreamingConfig = (): GraphAIConfig => ({
  nodes: {
    input: {
      agent: 'textInputAgent',
      params: {
        message: '${messages.content}'
      }
    },
    
    systemPrompt: {
      agent: 'textTemplateAgent',
      params: {
        template: '${messages.system || "You are a helpful AI assistant."}'
      }
    },
    
    // Streaming chat completion
    streamingChat: {
      agent: 'openAIStreamAgent',
      params: {
        model: '${model || "gpt-3.5-turbo"}',
        temperature: '${temperature || 0.7}',
        max_tokens: '${max_tokens || 2048}',
        system: '${:systemPrompt}'
      },
      inputs: [':input']
    },
    
    // Stream formatter for OpenAI compatibility
    output: {
      agent: 'streamFormatterAgent',
      params: {
        format: 'openai_chat_completion_chunk'
      },
      inputs: [':streamingChat']
    }
  },
  
  entry: 'input',
  exit: 'output'
});
```

Update `src/server.ts` with GraphAI configuration:

```typescript
import { createChatConfig, createStreamingConfig } from './config/graphai-config';

// Enhanced GraphAI configuration
app.use('/v1', 
  authenticateApiKey,
  rateLimit(50, 15 * 60 * 1000),
  graphai_express({
    graphConfig: createChatConfig(),
    streamingConfig: createStreamingConfig(),
    
    // Enable streaming
    streaming: true,
    
    // Request timeout
    timeout: 30000,
    
    // Custom request transformer
    transformRequest: (req) => {
      const { messages, model, temperature, max_tokens, stream } = req.body;
      
      // Extract system message
      const systemMessage = messages?.find((m: any) => m.role === 'system');
      const userMessages = messages?.filter((m: any) => m.role !== 'system') || [];
      
      return {
        messages: {
          system: systemMessage?.content,
          content: userMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n')
        },
        model,
        temperature,
        max_tokens,
        stream
      };
    },
    
    // Error handling
    errorHandler: (error, req, res, next) => {
      console.error('GraphAI Error:', error);
      
      if (error.code === 'TIMEOUT') {
        return res.status(408).json({
          error: {
            message: 'Request timeout',
            type: 'timeout_error',
            code: 'request_timeout'
          }
        });
      }
      
      res.status(500).json({
        error: {
          message: 'Failed to process request',
          type: 'processing_error',
          code: 'internal_error'
        }
      });
    }
  })
);
```

## 🛠️ Step 5: Add Logging

Create `src/utils/logger.ts`:

```typescript
import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

class Logger {
  private logLevel: string;
  private logFile: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = path.join(process.cwd(), 'logs', 'app.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  private writeLog(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';
    
    // Write to console
    console.log(`[${entry.level.toUpperCase()}] ${entry.timestamp} - ${entry.message}`, entry.meta || '');
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(this.logFile, logLine);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        meta
      });
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        meta
      });
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        meta
      });
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        meta
      });
    }
  }
}

export const logger = new Logger();
```

Add logging to `src/server.ts`:

```typescript
import { logger } from './utils/logger';

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Update error handler to use logger
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'server_error'
    }
  });
});
```

## ✅ Step 6: Testing Your Server

### Test with cURL

```bash
# Test health endpoint
curl http://localhost:8085/health

# Test chat completion
curl -X POST http://localhost:8085/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_key_12345" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello! What is GraphAI?"}
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'

# Test streaming
curl -X POST http://localhost:8085/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo_key_12345" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Tell me a short story"}
    ],
    "stream": true
  }'
```

### Test with JavaScript Client

Create `test-client.js`:

```javascript
// Test non-streaming
async function testChat() {
  const response = await fetch('http://localhost:8085/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_key_12345'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Hello, GraphAI!' }
      ]
    })
  });

  const data = await response.json();
  console.log('Response:', data);
}

// Test streaming
async function testStreaming() {
  const response = await fetch('http://localhost:8085/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_key_12345'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Count to 5 slowly' }
      ],
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
            process.stdout.write(content);
          }
        } catch (e) {
          // Handle parsing errors
        }
      }
    }
  }
}

// Run tests
testChat().then(() => {
  console.log('\n--- Testing streaming ---');
  return testStreaming();
});
```

Run the test:

```bash
node test-client.js
```

## 🛠️ Step 7: Docker Configuration

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S graphai -u 1001

# Create logs directory
RUN mkdir -p logs && chown -R graphai:nodejs /app

# Switch to non-root user
USER graphai

# Expose port
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8085/health || exit 1

# Start application
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  graphai-chat-server:
    build: .
    ports:
      - "8085:8085"
    environment:
      - NODE_ENV=production
      - PORT=8085
      - API_KEY=${API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8085/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Create `.dockerignore`:

```
node_modules
npm-debug.log
dist
logs
.env
.git
```

### Build and Run with Docker

```bash
# Build image
docker build -t graphai-chat-server .

# Run container
docker run -p 8085:8085 --env-file .env graphai-chat-server

# Or use docker-compose
docker-compose up --build
```

## 🎉 Congratulations!

You've built a complete GraphAI chat server with:

✅ **OpenAI API compatibility** - Works with existing OpenAI clients  
✅ **Streaming responses** - Real-time chat experience  
✅ **Authentication** - API key validation and rate limiting  
✅ **Error handling** - Robust error responses  
✅ **Logging** - Comprehensive request and error logging  
✅ **Docker support** - Ready for containerized deployment  

## 🚀 Next Steps

### Enhance Your Server

- **[Add database integration](../guides/integration.md)** for user management
- **[Implement webhooks](../examples/webhooks.md)** for event notifications  
- **[Add monitoring](../guides/troubleshooting.md)** with metrics and alerts
- **[Scale with clustering](../guides/performance.md)** for high availability

### Deploy to Production

- **[Firebase deployment](firebase-integration.md)** - Serverless scaling
- **[Kubernetes deployment](../examples/kubernetes.md)** - Container orchestration
- **[Load balancing](../guides/performance.md)** - Handle high traffic

### Explore More Tutorials

- **[Graph Dashboard](graph-dashboard.md)** - Add visualization to your server
- **[Agent Generator](agent-generator.md)** - Create custom AI agents
- **[Streaming Data](streaming-data.md)** - Advanced real-time processing

## 📚 Reference Materials

- **[Express Package Documentation](../reference/packages/express.md)**
- **[Configuration Guide](../guides/configuration.md)**
- **[API Reference](../reference/api/express.md)**
- **[Troubleshooting](../guides/troubleshooting.md)**