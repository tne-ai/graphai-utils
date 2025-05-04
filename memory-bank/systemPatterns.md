# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-06-02 12:27:07 - Log of updates made.

## Coding Patterns

* **TypeScript First**: All packages use TypeScript with strict typing and .d.ts generation
* **Build Pattern**: Consistent `tsc && tsc-alias` build process across packages
* **Path Mapping**: Uses `tsconfig-paths/register` for module resolution during development
* **Export Strategy**: Each package exports from `lib/index.js` with type definitions in `lib/index.d.ts`
* **Naming Convention**: Scoped packages under `@receptron/` namespace
* **Version Management**: Independent versioning per package (ranging from 0.0.1 to 1.0.3)

## Architectural Patterns

* **Monorepo Structure**: Yarn workspaces with packages/ directory containing all modules
* **Layered Architecture**:
  - Core utilities (stream_utils, express_type)
  - Middleware layer (express, firebase_functions)
  - UI components (vue-cytoscape, react-cytoscape, event_agent_generator)
  - Development tools (firebase-tools)
* **Framework Agnostic Core**: Core GraphAI functionality separated from framework-specific implementations
* **Micro-package Strategy**: Small, focused packages with single responsibilities
* **API Compatibility Layer**: Express middleware provides OpenAI API compatibility for GraphAI

## Testing Patterns

* **Node.js Test Runner**: Uses built-in `node --test` with ts-node registration
* **Test Location**: Test files in dedicated `test/` directories
* **Naming Convention**: Test files prefixed with `test_` for auto-discovery
* **TypeScript Testing**: Direct TypeScript execution in tests via ts-node
* **Integration Testing**: Express package includes API server testing capabilities

## Package Dependencies & Relationships

### Core Dependencies
* **GraphAI Ecosystem**: Core packages depend on `graphai` (^1.0.4) and `@graphai/vanilla` (^1.0.9)
* **Agent Filters**: Express and Firebase Functions packages use `@graphai/agent_filters` for filtering capabilities
* **Framework Dependencies**:
  - Vue packages: Vue 3.5.13 with Composition API
  - React package: React 18.3.1 with hooks
  - Express packages: Express 4.21.2 with CORS 2.8.5

### Package Interdependencies
* **express_type** ← **express**: Type package copies type definitions from express package
* **firebase_functions** → **express**: Shares similar structure and agent filter usage
* **vue-cytoscape** ↔ **react-cytoscape**: Parallel implementations for different frameworks
* **event_agent_generator**: Standalone Vue application for agent generation

### Version Maturity Levels
* **Production Ready** (v1.x): `express` (1.0.3), `firebase_functions` (1.0.1), `firebase-tools` (1.0.0)
* **Early Development** (v0.x): `vue-cytoscape` (0.2.0), `express_type` (0.1.2), `stream_utils` (0.0.1)
* **Active Development** (v0.0.x): `event_agent_generator` (0.0.6), `react-cytoscape` (0.0.5)

### Build & Development Patterns
* **Framework-Specific Builds**:
  - Vue packages: Vite + TypeScript with Vue SFC support
  - React package: Vite + React plugin with ES modules
  - Node.js packages: TypeScript compilation with tsc-alias
* **Shared Tooling**: ESLint, Prettier, TypeScript configurations shared via monorepo root
* **Package Publishing**: All packages build to `lib/` directory with corresponding `.d.ts` files

[2025-06-02 12:42:27] - Added comprehensive package analysis covering dependencies, relationships, maturity levels, and build patterns