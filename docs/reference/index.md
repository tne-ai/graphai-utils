# Reference Documentation

This section provides detailed reference material for the GraphAI Utils packages, including API specifications, package details, and changelogs.

## Packages

Detailed information about each individual package within the GraphAI Utils monorepo.

<div class="grid cards" markdown>

-   :material-server-network: **[@receptron/graphai_express](packages/express.md)**

    ---
    Express middleware for creating OpenAI-compatible GraphAI servers. Includes configuration options, API details, and usage examples.
    
    [:octicons-arrow-right-24: View Details](packages/express.md)

-   :material-code-tags: **[@receptron/graphai_express_type](packages/express-type.md)**

    ---
    Browser-compatible TypeScript definitions extracted from the `@receptron/graphai_express` package.
    
    [:octicons-arrow-right-24: View Details](packages/express-type.md)

-   :material-chart-line: **[@receptron/graphai_vue_cytoscape](packages/vue-cytoscape.md)**

    ---
    Vue 3 composable for integrating Cytoscape.js for interactive graph visualizations. Covers props, events, and methods.
    
    [:octicons-arrow-right-24: View Details](packages/vue-cytoscape.md)

-   :material-react: **[@receptron/graphai_react_cytoscape](packages/react-cytoscape.md)**

    ---
    React hook and components for using Cytoscape.js to visualize GraphAI workflows. Details on props, hooks, and usage.
    
    [:octicons-arrow-right-24: View Details](packages/react-cytoscape.md)

-   :material-robot-industrial: **[@receptron/event_agent_generator](packages/event-agent-generator.md)**

    ---
    Vue-based tools and utilities for generating GraphAI agent configurations.
    
    [:octicons-arrow-right-24: View Details](packages/event-agent-generator.md)

-   :material-stream: **[@receptron/stream_utils](packages/stream-utils.md)**

    ---
    Utilities for handling and processing streaming data within Node.js and potentially browser environments.
    
    [:octicons-arrow-right-24: View Details](packages/stream-utils.md)

-   :material-firebase: **[@receptron/graphai_firebase_functions](packages/firebase-functions.md)**

    ---
    Tools for integrating GraphAI workflows with Firebase Cloud Functions, enabling serverless GraphAI backends.
    
    [:octicons-arrow-right-24: View Details](packages/firebase-functions.md)

-   :material-cloud-cog: **[@receptron/firebase-tools](packages/firebase-tools.md)**

    ---
    Development utilities and tools for working with GraphAI in Firebase environments, potentially including stream filters or deployment aids.
    
    [:octicons-arrow-right-24: View Details](packages/firebase-tools.md)

</div>

## API Reference

Detailed API documentation for key modules and functions. This section might be auto-generated from TSDoc comments in the future.

-   **[GraphAI Express API](api/express.md)**: Detailed API for `@receptron/graphai_express` middleware options and helpers.
-   **[Visualization API (Vue/React)](api/visualization.md)**: API for the composables/hooks provided by the Cytoscape visualization packages.
-   **[Firebase API](api/firebase.md)**: API for `@receptron/graphai_firebase_functions` and related tools.
-   **[Stream Utilities API](api/stream-utils.md)**: Functions and classes provided by `@receptron/stream_utils`.

## Changelog

-   **[View Changelog](changelog.md)**: A comprehensive list of changes, new features, bug fixes, and breaking changes for each version of GraphAI Utils packages.

This reference section is intended to be a comprehensive resource for developers working with GraphAI Utils. If you find any discrepancies or areas needing more detail, please [contribute](../guides/contributing.md) or open an issue.