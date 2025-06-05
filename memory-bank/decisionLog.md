# Decision Log

This file records architectural and implementation decisions using a list format.
2025-06-02 12:24:59 - Log of updates made.

## Decision: Monorepo Architecture with Yarn Workspaces
**Date**: [Original project setup]
**Rationale**: Enables shared dependencies, consistent tooling, and coordinated releases across related GraphAI utility packages while maintaining package independence.
**Implementation Details**:
- Root package.json defines workspaces: ["packages/*"]
- Each package maintains independent versioning
- Shared devDependencies at root level
- Cross-workspace scripts (test, build, eslint, format)

## Decision: OpenAI API Compatibility as Primary Feature
**Date**: [Core design decision]
**Rationale**: Provides seamless migration path for existing OpenAI API users to GraphAI, reducing adoption friction.
**Implementation Details**:
- Express middleware in `@receptron/graphai_express` package
- Port 8085 default for development server
- Makefile provides `make run` command for easy server startup
- Test suite validates OpenAI API compatibility

## Decision: TypeScript-First Development
**Date**: [Project inception]
**Rationale**: Ensures type safety, better developer experience, and enables robust tooling across the ecosystem.
**Implementation Details**:
- All packages use TypeScript with strict settings
- Build process: `tsc && tsc-alias` for path mapping
- Type definitions (.d.ts) generated for all packages
- tsconfig-paths/register for development-time module resolution

## Decision: Multi-Framework UI Support
**Date**: [UI expansion phase]
**Rationale**: Support diverse frontend ecosystems without forcing technology choices on users.
**Implementation Details**:
- Separate packages for Vue (`@receptron/graphai_vue_cytoscape`) and React
- Cytoscape.js for graph visualization across both frameworks
- Independent build processes suited to each framework's ecosystem

## Decision: Scoped Package Naming (@receptron/*)
**Date**: [Package publication setup]
**Rationale**: Prevents naming conflicts, establishes brand identity, and enables organized package management.
**Implementation Details**:
- All packages use @receptron/ scope
- Descriptive names indicating functionality (graphai_express, stream_utils, etc.)
- Consistent GitHub repository links across packages

## Decision: Node.js Built-in Test Runner
**Date**: [Testing strategy decision]
**Rationale**: Reduces external dependencies while leveraging modern Node.js capabilities for testing.
**Implementation Details**:
- `node --test` with ts-node registration
- Test files prefixed with `test_` for auto-discovery
- TypeScript support without additional test framework overhead
## Decision: Complete Package Ecosystem Analysis
**Date**: [2025-06-02 12:48:13]
**Rationale**: Comprehensive understanding of all 8 packages is essential for informed architectural decisions, development planning, and proper ecosystem utilization.
**Implementation Details**:
- Systematic analysis of package.json files across all packages
- Dependency mapping and version analysis revealing maturity levels:
  - Production-ready (v1.x): `express` (1.0.3), `firebase_functions` (1.0.1), `firebase-tools` (1.0.0)
  - Active development (v0.x): `vue-cytoscape` (0.2.0), `react-cytoscape` (0.0.5), `event_agent_generator` (0.0.6)
  - Early stage (v0.0.x): `stream_utils` (0.0.1), `express_type` (0.1.2)
- Framework parallelization strategy: Vue and React implementations for visualization components
- Minimal cross-package dependencies promoting modularity and independent evolution
- Consistent build patterns using TypeScript + tsc-alias for reliable compilation
- Memory Bank population with comprehensive package relationships and usage patterns

[2025-06-02 12:48:13] - Complete package analysis documented in Memory Bank with full ecosystem understanding
## Decision: Dual Documentation Command Strategy
**Date**: [2025-06-02 19:53:40]
**Rationale**: Provide flexible documentation workflow support with both basic preview and development modes to serve different user needs while maintaining consistency with existing Makefile patterns.
**Implementation Details**:
- `make docs`: Basic MkDocs serve for quick documentation preview
- `make docs-dev`: Development mode with strict validation and enhanced error reporting
- Port 8000 (no conflict with API server on 8085)
- Self-documented help system integration via `##` comments
- Comprehensive implementation plan documented in [`docs/guides/makefile-docs-enhancement.md`](../docs/guides/makefile-docs-enhancement.md)

[2025-06-02 19:53:40] - Architectural planning completed for documentation workflow enhancement
## Decision: Migration from MkDocs to VitePress Documentation System
**Date**: [2025-06-04 21:37:00]
**Rationale**: Switch to VitePress for modern, fast documentation with better TypeScript integration, improved developer experience, and native Vue.js theming capabilities that align with project's frontend stack.
**Implementation Details**:
- Created comprehensive VitePress configuration in `docs/.vitepress/config.mjs` (JavaScript-based for better compatibility)
- Implemented custom theme with brand colors and styling in `docs/.vitepress/theme/`
- Updated Makefile with four VitePress commands:
  - `make docs`: Development server (localhost:5173)
  - `make docs-dev`: Development server with host binding
  - `make docs-build`: Production build
  - `make docs-preview`: Preview built documentation (localhost:4173)
- Added corresponding npm scripts in package.json (`docs:dev`, `docs:build`, `docs:preview`)
- Added VitePress v1.6.3 as development dependency
- Preserved existing documentation structure and navigation hierarchy
- Successfully tested development server startup

[2025-06-04 21:37:00] - VitePress documentation system successfully implemented and tested