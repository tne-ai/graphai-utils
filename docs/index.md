---
layout: home

hero:
  name: "GraphAI Utils"
  text: "Complete GraphAI Toolkit"
  tagline: "Build powerful AI applications with OpenAI API compatibility, graph visualization, and cloud deployment"
  image:
    src: /logo.svg
    alt: GraphAI Utils
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start/
    - theme: alt
      text: View Examples
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/receptron/graphai-utils

features:
  - icon: 🚀
    title: OpenAI API Compatibility
    details: Transform GraphAI into a drop-in replacement for OpenAI's API with our Express middleware. No code changes required for existing OpenAI applications.
  - icon: 📊
    title: Graph Visualization
    details: Beautiful, interactive graph visualizations for both Vue.js and React applications using Cytoscape.js with advanced layouts.
  - icon: 🛠️
    title: Development Tools
    details: Generate custom agents, handle streaming data, and build complete AI workflows with our developer-focused utilities.
  - icon: ☁️
    title: Cloud Deployment
    details: Deploy your GraphAI applications to Firebase with pre-built functions and development tools.
  - icon: 🔧
    title: TypeScript First
    details: Full TypeScript support across all packages with comprehensive type definitions and strict type checking.
  - icon: 📦
    title: Monorepo Architecture
    details: 8 specialized packages working together with independent versioning and focused responsibilities.
---

## What is GraphAI Utils?

GraphAI Utils is a collection of 8 specialized packages that transform GraphAI into a production-ready platform for building AI applications. Whether you're creating OpenAI-compatible APIs, visualizing complex graphs, or deploying to the cloud, we've got you covered.

## 🎯 Who This Is For

:::details API Developers
**Goal**: Create OpenAI-compatible servers

**Perfect for**: Migrating from OpenAI API or building new AI services

**Start with**: [OpenAI Server Tutorial](quick-start/openai-server.md)
:::

:::details Frontend Developers
**Goal**: Add graph visualization to applications

**Perfect for**: Building dashboards, workflow editors, or data visualization tools

**Start with**: [Add Visualization Guide](quick-start/add-visualization.md)
:::

:::details Full-Stack Developers
**Goal**: Build complete AI applications

**Perfect for**: End-to-end AI solutions with visualization and API layers

**Start with**: [Chat Server Tutorial](tutorials/chat-server.md)
:::

:::details DevOps Engineers
**Goal**: Deploy and scale AI applications

**Perfect for**: Production deployments and cloud infrastructure

**Start with**: [Firebase Deployment](quick-start/deployment.md)
:::

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# 1. Install the core package
npm install @receptron/graphai_express

# 2. Create a simple server
echo 'import { graphai } from "@receptron/graphai_express";
const app = graphai();
app.listen(8085, () => console.log("GraphAI server running on port 8085"));' > server.js

# 3. Run your OpenAI-compatible server
node server.js
```

🎉 **That's it!** You now have an OpenAI-compatible API server running on `http://localhost:8085`

## 📦 Package Ecosystem

<div class="package-grid">

<div class="package-card">

### 🖥️ Express Middleware
Transform GraphAI into an OpenAI API-compatible server

<span class="version-badge">v1.0.3 (Production Ready)</span>

[Learn more →](reference/packages/express.md)

</div>

<div class="package-card">

### 📊 Vue Cytoscape
Interactive graph visualization for Vue.js applications

<span class="version-badge">v0.2.0 (Active Development)</span>

[Learn more →](reference/packages/vue-cytoscape.md)

</div>

<div class="package-card">

### ⚛️ React Cytoscape
Graph visualization components for React applications

<span class="version-badge">v0.0.5 (Early Development)</span>

[Learn more →](reference/packages/react-cytoscape.md)

</div>

<div class="package-card">

### 🤖 Agent Generator
Visual tools for creating and configuring GraphAI agents

<span class="version-badge">v0.0.6 (Active Development)</span>

[Learn more →](reference/packages/event-agent-generator.md)

</div>

<div class="package-card">

### 🌊 Stream Utils
Utilities for handling streaming data and real-time processing

<span class="version-badge">v0.0.1 (Early Development)</span>

[Learn more →](reference/packages/stream-utils.md)

</div>

<div class="package-card">

### 🔥 Firebase Functions
Deploy GraphAI to Firebase Cloud Functions

<span class="version-badge">v1.0.1 (Production Ready)</span>

[Learn more →](reference/packages/firebase-functions.md)

</div>

<div class="package-card">

### ☁️ Firebase Tools
Development utilities for Firebase deployment

<span class="version-badge">v1.0.0 (Production Ready)</span>

[Learn more →](reference/packages/firebase-tools.md)

</div>

<div class="package-card">

### 📝 Express Types
TypeScript definitions for browser compatibility

<span class="version-badge">v0.1.2 (Stable)</span>

[Learn more →](reference/packages/express-type.md)

</div>

</div>

## 🎯 Common Use Cases

### Build an AI Chat Server
Create a complete chat server with OpenAI compatibility in minutes.
[Follow the tutorial →](tutorials/chat-server.md)

### Visualize AI Workflows
Add interactive graph visualization to your applications.
[See examples →](examples/vue-dashboard.md)

### Deploy to Production
Scale your GraphAI applications with Firebase.
[Deployment guide →](tutorials/firebase-integration.md)

### Create Custom Agents
Generate and customize AI agents for your specific needs.
[Agent tutorial →](tutorials/agent-generator.md)

## 🔗 Related Projects

- **[GraphAI Core](https://github.com/receptron/graphai)** - The core GraphAI library
- **[GraphAI Agents](https://github.com/receptron/graphai-agents)** - Collection of pre-built agents

## 🤝 Community & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/receptron/graphai-utils/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/receptron/graphai-utils/discussions)
- **NPM**: [Find packages on NPM](https://www.npmjs.com/search?q=%40receptron%2Fgraphai)

## 📋 What's Next?

Ready to start building? Choose your path:

<div class="feature-grid">

<div class="feature-card">

<span class="feature-icon">🚀</span>

### [Quick Start](quick-start/)

Get your first GraphAI application running in 5 minutes

</div>

<div class="feature-card">

<span class="feature-icon">🎓</span>

### [Tutorials](tutorials/)

Step-by-step guides for building real applications

</div>

<div class="feature-card">

<span class="feature-icon">💻</span>

### [Examples](examples/)

Copy-paste examples and complete sample applications

</div>

<div class="feature-card">

<span class="feature-icon">📖</span>

### [Reference](reference/)

Complete API documentation and package details

</div>

</div>