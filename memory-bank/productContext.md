# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-06-02 12:19:08 - Log of updates made will be appended as footnotes to the end of this file.

## Project Overview
GraphAI Utils is a comprehensive monorepo containing utilities and middleware for the GraphAI ecosystem. The project is maintained by the Receptron team and provides tools for integrating GraphAI with various frameworks and platforms.

## Project Goal

* **Primary Goal**: Create an OpenAI API-compatible server using GraphAI as the backend engine
* **Secondary Goals**: Provide visualization and development tools for GraphAI workflows
* **Ecosystem Integration**: Support multiple frontend frameworks (Vue, React) and deployment platforms (Firebase)

## Key Features

### Core Server Infrastructure
* **Express Middleware** (`@receptron/graphai_express` v1.0.3): Transforms GraphAI into an OpenAI API-compatible server with CORS support and agent filters
* **Express Types** (`@receptron/graphai_express_type` v0.1.2): Browser-compatible type definitions extracted from the express package

### Visualization Components
* **Vue Cytoscape** (`@receptron/graphai_vue_cytoscape` v0.2.0): Vue.js composable for graph visualization using Cytoscape.js with Klay layout
* **React Cytoscape** (`@receptron/graphai_react_cytoscape` v0.0.5): React component for graph visualization with ES module support

### Development & Generation Tools
* **Event Agent Generator** (`@receptron/event_agent_generator` v0.0.6): Vue-based tools for generating GraphAI agents with text input capabilities
* **Stream Utilities** (`@receptron/stream_utils` v0.0.1): Core utilities for handling streaming data processing

### Firebase Integration
* **Firebase Functions** (`@receptron/graphai_firebase_functions` v1.0.1): Cloud Functions integration with GraphAI agent filters
* **Firebase Tools** (`@receptron/firebase-tools` v1.0.0): Development tools for Firebase web integration

### Cross-Package Features
* **Type Safety**: Comprehensive TypeScript support across all packages with strict ESLint configuration
* **Consistent Build System**: Standardized build, test, and formatting workflows across packages
* **Monorepo Management**: Yarn workspaces for efficient dependency management and cross-package development

## Overall Architecture

* **Monorepo Structure**: Uses Yarn workspaces for package management
* **Build System**: TypeScript compilation with tsc-alias for path mapping
* **Package Distribution**: Each package builds to `lib/` directory with .d.ts type definitions
* **Testing**: Node.js built-in test runner with ts-node for TypeScript execution
* **Development**: Vite for frontend packages, Express for server development
* **Code Quality**: ESLint + Prettier for consistent code formatting