# Quick Start Guide

Get your first GraphAI application running in minutes. This guide will walk you through setting up an OpenAI-compatible server, adding graph visualization, and deploying to the cloud.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 16+** installed
- **npm** or **yarn** package manager
- Basic knowledge of JavaScript/TypeScript

## 🚀 5-Minute Setup

Let's build your first GraphAI application step by step:

### Step 1: Create a New Project

```bash
mkdir my-graphai-app
cd my-graphai-app
npm init -y
```

### Step 2: Install GraphAI Express

```bash
npm install @receptron/graphai_express graphai @graphai/vanilla
```

### Step 3: Create Your Server

Create a file called `server.js`:

```javascript
import express from 'express';
import { graphai_express } from '@receptron/graphai_express';

const app = express();

// Add GraphAI middleware with OpenAI compatibility
app.use('/v1', graphai_express());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'GraphAI Server' });
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`🚀 GraphAI server running on http://localhost:${PORT}`);
  console.log(`📖 OpenAI-compatible API available at http://localhost:${PORT}/v1`);
});
```

### Step 4: Add Package.json Scripts

Update your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

### Step 5: Start Your Server

```bash
npm run dev
```

🎉 **Success!** Your GraphAI server is now running with OpenAI API compatibility.

## ✅ Test Your Server

Test your server with a simple curl command:

```bash
curl -X POST http://localhost:8085/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, GraphAI!"}
    ]
  }'
```

You should see a response similar to OpenAI's API format.

## 🎯 What's Next?

Now that you have a basic server running, you can:

<div class="grid cards" markdown>

-   :material-server-network: **[Build a Complete OpenAI Server](openai-server.md)**

    ---

    Add authentication, error handling, and advanced features

-   :material-chart-line: **[Add Graph Visualization](add-visualization.md)**

    ---

    Create interactive graphs with Vue.js or React components

-   :material-cloud-upload: **[Deploy to Production](deployment.md)**

    ---

    Deploy your server to Firebase or other cloud platforms

</div>

## 🛠️ Development Tips

### Enable Hot Reload

For faster development, use the `--watch` flag:

```bash
node --watch server.js
```

### Environment Variables

Create a `.env` file for configuration:

```bash
PORT=8085
NODE_ENV=development
GRAPHAI_LOG_LEVEL=debug
```

### TypeScript Support

For TypeScript projects, install types:

```bash
npm install -D typescript @types/node @receptron/graphai_express_type
```

Create `server.ts`:

```typescript
import express from 'express';
import { graphai_express } from '@receptron/graphai_express';

const app = express();
app.use('/v1', graphai_express());

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`GraphAI server running on port ${PORT}`);
});
```

## 🔧 Troubleshooting

### Common Issues

??? question "Module not found errors"

    Make sure you have `"type": "module"` in your `package.json` for ES modules support.

??? question "Port already in use"

    Change the port in your environment variables or kill the process using the port:
    ```bash
    lsof -ti:8085 | xargs kill -9
    ```

??? question "OpenAI API compatibility issues"

    Ensure you're using the correct endpoint path `/v1/chat/completions` and request format.

### Getting Help

- Check the [Troubleshooting Guide](../guides/troubleshooting.md)
- Review [Configuration Options](../guides/configuration.md)
- Ask questions in our [GitHub Discussions](https://github.com/receptron/graphai-utils/discussions)

## 📚 Learn More

Ready to build more advanced applications? Explore our tutorials:

- [**Chat Server Tutorial**](../tutorials/chat-server.md) - Build a complete chat application
- [**Graph Dashboard Tutorial**](../tutorials/graph-dashboard.md) - Create interactive visualizations
- [**Agent Generator Tutorial**](../tutorials/agent-generator.md) - Build custom AI agents
- [**Firebase Integration**](../tutorials/firebase-integration.md) - Deploy to the cloud