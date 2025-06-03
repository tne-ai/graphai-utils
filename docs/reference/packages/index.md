# GraphAI Utils Packages

This section provides detailed reference pages for each individual package within the GraphAI Utils monorepo.

## Overview

GraphAI Utils is a collection of specialized NPM packages designed to enhance and extend the capabilities of the core [GraphAI engine](https://github.com/receptron/graphai). These utilities cover areas such as API server creation, frontend visualization, Firebase integration, and more.

Each package is independently versioned and can be installed separately, allowing you to pick and choose the tools you need for your specific project.

## Package List

Click on a package name to navigate to its detailed reference page, which includes:
-   Package purpose and key features.
-   Installation instructions.
-   Core API and usage examples.
-   Configuration options.
-   Dependencies and peer dependencies.
-   Version information (linking to the main [Changelog](../changelog.md)).

---

### Core Server & API

-   **[:material-server-network: @receptron/graphai_express](express.md)**
    -   Transforms GraphAI into an Express.js middleware, enabling OpenAI API compatibility and custom HTTP interfaces for your workflows.

-   **[:material-code-tags: @receptron/graphai_express_type](express-type.md)**
    -   Provides TypeScript definitions for `@receptron/graphai_express` that are specifically tailored for browser/client-side usage, often for understanding server responses or request structures.

### Visualization

-   **[:material-chart-line: @receptron/graphai_vue_cytoscape](vue-cytoscape.md)**
    -   A Vue 3 composable for integrating Cytoscape.js, allowing for interactive visualization and manipulation of graph structures in Vue applications.

-   **[:material-react: @receptron/graphai_react_cytoscape](react-cytoscape.md)**
    -   A React hook and components for leveraging Cytoscape.js to render and interact with graphs within React applications.

### Development & Utility Tools

-   **[:material-robot-industrial: @receptron/event_agent_generator](event-agent-generator.md)**
    -   Vue-based tools designed to assist in the creation and configuration of GraphAI agent JSON structures.

-   **[:material-stream: @receptron/stream_utils](stream-utils.md)**
    -   A set of utilities for working with Node.js streams, useful for creating streaming agents or handling streaming data in conjunction with GraphAI.

### Cloud & Firebase Integration

-   **[:material-firebase: @receptron/graphai_firebase_functions](firebase-functions.md)**
    -   Facilitates the deployment of GraphAI workflows as serverless Firebase Cloud Functions, providing an Express-like interface.

-   **[:material-cloud-cog: @receptron/firebase-tools](firebase-tools.md)**
    -   Contains development utilities specifically for using GraphAI within the Firebase ecosystem, such as stream filters for Firebase event sources.

---

For information on how these packages work together, see the [Integration Patterns Guide](../../guides/integration.md).
For installation details, refer to the [Installation Guide](../../guides/installation.md).