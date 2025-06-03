# Deploy to Production

Deploy your GraphAI applications to production with Firebase, Docker, or traditional cloud platforms. This guide covers deployment strategies for both backend servers and frontend visualizations.

## Firebase Deployment

Firebase provides the fastest path to production for GraphAI applications with built-in scaling, monitoring, and global CDN.

### Prerequisites

```bash
npm install -g firebase-tools
npm install @receptron/graphai_firebase_functions @receptron/firebase-tools
```

### Firebase Functions Setup

1. **Initialize Firebase project:**

```bash
firebase login
firebase init functions
```

2. **Install GraphAI dependencies:**

```bash
cd functions
npm install @receptron/graphai_firebase_functions graphai @graphai/vanilla
```

3. **Create your function (`functions/index.js`):**

```javascript
import { onRequest } from 'firebase-functions/v2/https';
import { graphai_firebase } from '@receptron/graphai_firebase_functions';

// GraphAI OpenAI-compatible endpoint
export const graphai = onRequest({
  cors: true,
  memory: '1GiB',
  timeoutSeconds: 60,
  maxInstances: 10
}, graphai_firebase({
  // Your GraphAI configuration
  graphConfig: {
    nodes: {
      input: { agent: 'textInputAgent' },
      process: { 
        agent: 'openAIAgent',
        inputs: [':input'],
        params: { model: 'gpt-3.5-turbo' }
      },
      output: { 
        agent: 'textOutputAgent',
        inputs: [':process'] 
      }
    }
  }
}));

// Health check endpoint
export const health = onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GraphAI Firebase Functions'
  });
});
```

4. **Deploy to Firebase:**

```bash
firebase deploy --only functions
```

Your GraphAI API will be available at:
`https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/graphai/v1/chat/completions`

### Frontend Deployment with Firebase Hosting

For Vue.js or React applications with GraphAI visualization:

1. **Build your frontend:**

```bash
# Vue.js
npm run build

# React
npm run build
```

2. **Initialize Firebase Hosting:**

```bash
firebase init hosting
```

3. **Configure `firebase.json`:**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "graphai"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

4. **Deploy everything:**

```bash
firebase deploy
```

## Docker Deployment

### Dockerfile for GraphAI Server

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S graphai -u 1001

# Change ownership
RUN chown -R graphai:nodejs /app
USER graphai

# Expose port
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8085/health || exit 1

# Start application
CMD ["node", "server.js"]
```

### Docker Compose for Full Stack

```yaml
version: '3.8'

services:
  graphai-server:
    build: .
    ports:
      - "8085:8085"
    environment:
      - NODE_ENV=production
      - PORT=8085
      - CORS_ORIGIN=https://yourdomain.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8085/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - graphai-server
    restart: unless-stopped

volumes:
  graphai_data:
```

### Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    upstream graphai {
        server graphai-server:8085;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location /v1/ {
            proxy_pass http://graphai;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Enable streaming
            proxy_buffering off;
            proxy_cache off;
        }

        location /health {
            proxy_pass http://graphai;
        }

        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

## Cloud Platform Deployment

### Vercel (Serverless)

1. **Install Vercel CLI:**

```bash
npm install -g vercel
```

2. **Create `vercel.json`:**

```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "@vercel/node"
    }
  },
  "routes": [
    {
      "src": "/v1/(.*)",
      "dest": "/api/graphai.js"
    }
  ]
}
```

3. **Create API function (`api/graphai.js`):**

```javascript
import { graphai_express } from '@receptron/graphai_express';

const handler = graphai_express({
  // Your GraphAI configuration
});

export default handler;
```

4. **Deploy:**

```bash
vercel --prod
```

### Railway

1. **Connect your GitHub repository**
2. **Add environment variables:**
   - `NODE_ENV=production`
   - `PORT=8085`

3. **Railway will automatically deploy** using your `package.json` scripts

### Heroku

1. **Create `Procfile`:**

```
web: node server.js
```

2. **Deploy:**

```bash
heroku create your-graphai-app
git push heroku main
```

## Environment Configuration

### Production Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=8085

# API Configuration  
OPENAI_API_KEY=your_openai_key_here
GRAPHAI_LOG_LEVEL=info

# Security
API_KEY_SECRET=your_secure_secret_here
CORS_ORIGIN=https://yourdomain.com

# Database (if needed)
DATABASE_URL=postgresql://user:pass@host:port/db

# Monitoring
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key
```

### Secrets Management

For sensitive configuration:

=== "Firebase"

    ```bash
    # Set secrets using Firebase CLI
    firebase functions:secrets:set OPENAI_API_KEY
    firebase functions:secrets:set API_KEY_SECRET
    ```

=== "Docker"

    ```yaml
    # docker-compose.yml
    services:
      graphai-server:
        environment:
          - OPENAI_API_KEY_FILE=/run/secrets/openai_key
        secrets:
          - openai_key
    
    secrets:
      openai_key:
        file: ./secrets/openai_key.txt
    ```

=== "Kubernetes"

    ```bash
    # Create secrets
    kubectl create secret generic graphai-secrets \
      --from-literal=openai-api-key=your_key_here \
      --from-literal=api-key-secret=your_secret_here
    ```

## Monitoring & Observability

### Health Checks

```javascript
// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  };

  // Check external dependencies
  const checks = {
    database: checkDatabase(),
    openai: checkOpenAI(),
    redis: checkRedis()
  };

  const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    ...health,
    checks
  });
});
```

### Logging Setup

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in your GraphAI middleware
app.use('/v1', (req, res, next) => {
  logger.info('GraphAI request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});
```

## Performance Optimization

### Production Optimizations

```javascript
import compression from 'compression';
import helmet from 'helmet';

const app = express();

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// Request caching for static responses
import redis from 'redis';
const client = redis.createClient();

const cacheMiddleware = (duration) => (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  
  client.get(key, (err, result) => {
    if (result) {
      res.json(JSON.parse(result));
    } else {
      res.originalJson = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.originalJson(body);
      };
      next();
    }
  });
};

// Cache responses for 5 minutes
app.use('/v1/models', cacheMiddleware(300));
```

## Troubleshooting Deployment

### Common Issues

??? question "Function timeout errors"

    **Solution**: Increase timeout limits and optimize your GraphAI workflow
    
    ```javascript
    // Firebase Functions
    export const graphai = onRequest({
      timeoutSeconds: 300, // 5 minutes max
      memory: '2GiB'
    }, handler);
    ```

??? question "CORS errors in production"

    **Solution**: Configure CORS properly for your domain
    
    ```javascript
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    ```

??? question "Memory issues with large graphs"

    **Solution**: Implement streaming and optimize graph size
    
    ```javascript
    // Enable streaming for large responses
    app.use('/v1', graphai_express({
      streaming: true,
      maxGraphSize: 1000 // Limit graph complexity
    }));
    ```

## Next Steps

- **[Complete Tutorial](../tutorials/firebase-integration.md)** - Full Firebase deployment walkthrough
- **[Performance Guide](../guides/performance.md)** - Optimize your production deployment  
- **[Monitoring Setup](../guides/troubleshooting.md)** - Set up comprehensive monitoring
- **[Security Guide](../guides/configuration.md)** - Secure your production environment