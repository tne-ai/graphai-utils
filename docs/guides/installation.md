# Installation Guide

This guide provides detailed instructions for installing GraphAI Utils packages and setting up your development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 16.x or higher is recommended. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm (Node Package Manager)**: Comes bundled with Node.js.
    OR
-   **Yarn**: An alternative package manager. Install it from [yarnpkg.com](https://yarnpkg.com/).

You can check your versions by running:
```bash
node -v
npm -v
# or
yarn -v
```

## Monorepo Overview

GraphAI Utils is a monorepo managed with Yarn Workspaces. While you'll typically install individual packages for your projects, understanding the monorepo structure can be helpful if you plan to contribute or work with the source code directly.

The key packages you might install are:

-   `@receptron/graphai_express`: For creating OpenAI-compatible servers.
-   `@receptron/graphai_vue_cytoscape`: For Vue.js graph visualization.
-   `@receptron/graphai_react_cytoscape`: For React graph visualization.
-   `@receptron/event_agent_generator`: Tools for generating GraphAI agents.
-   `@receptron/stream_utils`: Utilities for handling streaming data.
-   `@receptron/graphai_firebase_functions`: For Firebase Functions integration.
-   `@receptron/firebase-tools`: Development tools for Firebase.
-   `@receptron/graphai_express_type`: Type definitions for browser use with the Express package.

You will also need core GraphAI packages:
-   `graphai`: The core GraphAI engine.
-   `@graphai/vanilla`: Core vanilla JavaScript agents.
-   `@graphai/agents`: A collection of common, useful agents.

## Installing Individual Packages

For most use cases, you will install specific GraphAI Utils packages into your existing or new project as needed.

### Example: Setting up a Backend Server Project

If you are building an OpenAI-compatible server:

1.  **Create a new project directory (if you haven't already):**
    ```bash
    mkdir my-graphai-server
    cd my-graphai-server
    npm init -y 
    # or yarn init -y
    ```

2.  **Install necessary packages:**
    ```bash
    # Using npm
    npm install express @receptron/graphai_express graphai @graphai/vanilla @graphai/agents
    npm install -D typescript @types/node @types/express ts-node nodemon # For TypeScript development

    # Using yarn
    yarn add express @receptron/graphai_express graphai @graphai/vanilla @graphai/agents
    yarn add -D typescript @types/node @types/express ts-node nodemon # For TypeScript development
    ```

### Example: Setting up a Frontend Vue.js Project for Visualization

If you are building a Vue.js application that needs graph visualization:

1.  **Create a new Vue project (if you haven't already):**
    ```bash
    npm create vue@latest my-vue-graph-app
    cd my-vue-graph-app
    # Follow prompts (e.g., select Vue 3, no TypeScript for simplicity if desired)
    ```

2.  **Install visualization packages:**
    ```bash
    # Using npm
    npm install @receptron/graphai_vue_cytoscape cytoscape cytoscape-klay vue@^3 # Ensure Vue 3

    # Using yarn
    yarn add @receptron/graphai_vue_cytoscape cytoscape cytoscape-klay vue@^3
    ```
    *Note: `cytoscape` and `cytoscape-klay` (or other layout extensions) are peer dependencies for the visualization packages.*

### Example: Setting up a React Project for Visualization

If you are building a React application:

1.  **Create a new React project (if you haven't already):**
    ```bash
    npx create-react-app my-react-graph-app --template typescript
    cd my-react-graph-app
    ```

2.  **Install visualization packages:**
    ```bash
    # Using npm
    npm install @receptron/graphai_react_cytoscape cytoscape cytoscape-klay react@^18 react-dom@^18
    npm install -D @types/cytoscape @types/cytoscape-klay # For TypeScript

    # Using yarn
    yarn add @receptron/graphai_react_cytoscape cytoscape cytoscape-klay react@^18 react-dom@^18
    yarn add -D @types/cytoscape @types/cytoscape-klay # For TypeScript
    ```

## TypeScript Setup

Most GraphAI Utils packages are written in TypeScript and provide type definitions. For the best development experience, using TypeScript in your project is recommended.

1.  **Install TypeScript and necessary types** (as shown in examples above).
2.  **Create a `tsconfig.json` file** in your project root. A basic configuration:
    ```json
    {
      "compilerOptions": {
        "target": "ES2020", // Or newer
        "module": "commonjs", // Or "ESNext" if using ES modules (requires "type": "module" in package.json)
        "lib": ["ES2020", "DOM"], // Add "DOM" for frontend projects
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true, // Useful for importing JSON configs
        "jsx": "react-jsx" // For React projects
      },
      "include": ["src/**/*"], // Or your source directory
      "exclude": ["node_modules", "dist"]
    }
    ```
    Adjust `target`, `module`, `lib`, `rootDir`, `outDir`, and `jsx` according to your project's needs.

## Working with the Monorepo (for Contributors or Advanced Users)

If you intend to contribute to GraphAI Utils or need to work with the latest unreleased code:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/receptron/graphai-utils.git
    cd graphai-utils
    ```

2.  **Install root dependencies and link workspaces:**
    The monorepo uses Yarn Workspaces.
    ```bash
    yarn install
    ```
    This command installs all dependencies for all packages and symlinks them, so changes in one package are immediately available to others within the monorepo.

3.  **Build all packages:**
    There's typically a root-level script to build all packages. Check the `package.json` at the root of the `graphai-utils` monorepo. It might be:
    ```bash
    yarn build
    # or
    yarn workspaces run build
    ```
    This will compile TypeScript to JavaScript for each package, usually into a `lib` or `dist` folder within each package directory.

4.  **Running individual package scripts:**
    You can run scripts defined in a specific package's `package.json` from the root:
    ```bash
    yarn workspace @receptron/graphai_express run build
    yarn workspace @receptron/graphai_vue_cytoscape run dev
    ```

## Common Installation Issues

-   **Peer Dependency Warnings**: Pay attention to peer dependency warnings during installation. You might need to install specific versions of `vue`, `react`, `cytoscape`, etc., manually.
-   **TypeScript Version Conflicts**: Ensure your project's TypeScript version is compatible with the types provided by GraphAI Utils packages.
-   **Node.js Version**: Some packages or their dependencies might require a newer Node.js version. Using the LTS version is generally a good practice.
-   **Module Resolution (ESM vs CommonJS)**: If you encounter module resolution errors (e.g., `ERR_MODULE_NOT_FOUND` or issues with `require` vs `import`), check your `package.json` for `"type": "module"` and ensure your `tsconfig.json` (`module` and `moduleResolution` options) and import statements are consistent.

## Next Steps

Once you have installed the necessary packages, you can proceed to:

-   **[Configuration Guide](configuration.md)**: Learn how to configure the packages.
-   **[Quick Start Guides](../quick-start/index.md)**: Get started with practical examples.
-   **[Tutorials](../tutorials/index.md)**: Follow step-by-step tutorials to build applications.

If you encounter any installation problems not covered here, please check the [Troubleshooting Guide](troubleshooting.md) or open an issue on the [GraphAI Utils GitHub repository](https://github.com/receptron/graphai-utils/issues).