# Changelog

This document records notable changes, new features, bug fixes, and breaking changes for the GraphAI Utils packages. Versions are managed independently for each package within the monorepo.

Please refer to the `CHANGELOG.md` file within each individual package directory in the [GraphAI Utils GitHub repository](https://github.com/receptron/graphai-utils/tree/main/packages) for the most detailed and up-to-date information.

This page provides a high-level overview or will link to individual changelogs if they are centralized here in the future.

## General Process

-   Changes are tracked per package.
-   Semantic Versioning (SemVer - `MAJOR.MINOR.PATCH`) is generally followed.
    -   `MAJOR` version for incompatible API changes.
    -   `MINOR` version for adding functionality in a backward-compatible manner.
    -   `PATCH` version for backward-compatible bug fixes.

## Package Versions (as of last documentation update - June 2, 2025)

This is a snapshot based on information from the memory bank. For the absolute latest, always check `package.json` files in the repository.

-   **`@receptron/graphai_express`**: `v1.0.3`
-   **`@receptron/graphai_express_type`**: `v0.1.2`
-   **`@receptron/graphai_vue_cytoscape`**: `v0.2.0`
-   **`@receptron/graphai_react_cytoscape`**: `v0.0.5`
-   **`@receptron/event_agent_generator`**: `v0.0.6`
-   **`@receptron/stream_utils`**: `v0.0.1`
-   **`@receptron/graphai_firebase_functions`**: `v1.0.1`
-   **`@receptron/firebase-tools`**: `v1.0.0`

## Recent Notable Changes (Example Format - To Be Populated)

This section would ideally be populated with significant updates across the packages.

---

### `@receptron/graphai_express`

#### `v1.0.3` - YYYY-MM-DD
-   **Fix**: Resolved issue with default OpenAI response formatting for empty content.
-   **Feat**: Added `disableOpenAICompatibleRoutes` option to `GraphAIExpressConfig`.

#### `v1.0.0` - YYYY-MM-DD
-   **Major**: Initial production-ready release.
-   **Feat**: Support for OpenAI API compatibility.
-   **Feat**: Streaming responses via SSE.

---

### `@receptron/graphai_vue_cytoscape`

#### `v0.2.0` - YYYY-MM-DD
-   **Feat**: Improved reactivity for `elements` and `layout` props.
-   **Fix**: Corrected event listener detachment in `onUnmounted`.

---

*(This pattern would continue for other packages and their versions.)*

## How to Find Detailed Changelogs

1.  **GitHub Repository**: Navigate to the `packages/` directory in the [GraphAI Utils GitHub repository](https://github.com/receptron/graphai-utils).
2.  **Select a Package**: Go into the directory of the specific package you are interested in (e.g., `packages/graphai_express`).
3.  **Find `CHANGELOG.md`**: Look for a `CHANGELOG.md` file in that package's directory. If it exists, it will contain the detailed history for that package.
4.  **Commit History**: If a dedicated changelog file is not present, you can review the commit history for that package directory on GitHub for changes.
5.  **NPM**: The NPM page for each package might also link to its repository or provide some version history.

We strive to keep changelogs informative to help users understand the impact of updates and new versions.