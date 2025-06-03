# GraphAI Utils

Build powerful AI applications with GraphAI's comprehensive toolkit for OpenAI API compatibility, graph visualization, and cloud deployment.

## What is GraphAI Utils?

GraphAI Utils is a collection of 8 specialized packages that transform GraphAI into a production-ready platform for building AI applications. Whether you're creating OpenAI-compatible APIs, visualizing complex graphs, or deploying to the cloud, we've got you covered.

## ✨ Key Features

### 🚀 **OpenAI API Compatibility**
Transform GraphAI into a drop-in replacement for OpenAI's API with our Express middleware. No code changes required for existing OpenAI applications.

### 📊 **Graph Visualization**
Beautiful, interactive graph visualizations for both Vue.js and React applications using Cytoscape.js with advanced layouts.

### 🛠️ **Development Tools**
Generate custom agents, handle streaming data, and build complete AI workflows with our developer-focused utilities.

### ☁️ **Cloud Deployment**
Deploy your GraphAI applications to Firebase with pre-built functions and development tools.

## 🎯 Who This Is For

=== "API Developers"

    **Goal**: Create OpenAI-compatible servers
    
    **Perfect for**: Migrating from OpenAI API or building new AI services
    
    **Start with**: [OpenAI Server Tutorial](quick-start/openai-server.md)

=== "Frontend Developers"

    **Goal**: Add graph visualization to applications
    
    **Perfect for**: Building dashboards, workflow editors, or data visualization tools
    
    **Start with**: [Add Visualization Guide](quick-start/add-visualization.md)

=== "Full-Stack Developers"

    **Goal**: Build complete AI applications
    
    **Perfect for**: End-to-end AI solutions with visualization and API layers
    
    **Start with**: [Chat Server Tutorial](tutorials/chat-server.md)

=== "DevOps Engineers"

    **Goal**: Deploy and scale AI applications
    
    **Perfect for**: Production deployments and cloud infrastructure
    
    **Start with**: [Firebase Deployment](quick-start/deployment.md)

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

<div class="grid cards" markdown>

-   :material-server: **Express Middleware**

    ---

    Transform GraphAI into an OpenAI API-compatible server
    
    **Version**: 1.0.3 (Production Ready)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/express.md)

-   :material-chart-line: **Vue Cytoscape**

    ---

    Interactive graph visualization for Vue.js applications
    
    **Version**: 0.2.0 (Active Development)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/vue-cytoscape.md)

-   :material-react: **React Cytoscape**

    ---

    Graph visualization components for React applications
    
    **Version**: 0.0.5 (Early Development)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/react-cytoscape.md)

-   :material-robot: **Agent Generator**

    ---

    Visual tools for creating and configuring GraphAI agents
    
    **Version**: 0.0.6 (Active Development)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/event-agent-generator.md)

-   :material-stream: **Stream Utils**

    ---

    Utilities for handling streaming data and real-time processing
    
    **Version**: 0.0.1 (Early Development)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/stream-utils.md)

-   :material-firebase: **Firebase Functions**

    ---

    Deploy GraphAI to Firebase Cloud Functions
    
    **Version**: 1.0.1 (Production Ready)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/firebase-functions.md)

-   :material-cloud-upload: **Firebase Tools**

    ---

    Development utilities for Firebase deployment
    
    **Version**: 1.0.0 (Production Ready)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/firebase-tools.md)

-   :material-code-braces: **Express Types**

    ---

    TypeScript definitions for browser compatibility
    
    **Version**: 0.1.2 (Stable)
    
    [:octicons-arrow-right-24: Learn more](reference/packages/express-type.md)

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

<div class="grid cards" markdown>

-   :material-rocket-launch: **[Quick Start](quick-start/index.md)**

    ---

    Get your first GraphAI application running in 5 minutes

-   :material-school: **[Tutorials](tutorials/index.md)**

    ---

    Step-by-step guides for building real applications

-   :material-code-tags: **[Examples](examples/index.md)**

    ---

    Copy-paste examples and complete sample applications

-   :material-book-open-page-variant: **[Reference](reference/index.md)**

    ---

    Complete API documentation and package details

</div>