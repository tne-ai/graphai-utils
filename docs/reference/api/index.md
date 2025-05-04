# API Reference

This section provides detailed API documentation for the core modules and functions within the GraphAI Utils packages.

Currently, these pages serve as placeholders. In the future, they may be populated with auto-generated API documentation from TSDoc comments within the source code.

## Available API Documentation (Placeholder)

-   **[GraphAI Express API (<code>@receptron/graphai_express</code>)](express.md)**
    -   Detailed breakdown of `graphai_express(config)` function.
    -   Type definitions for `GraphAIExpressConfig` and its options.
    -   Information on `transformRequest`, `transformResponse`, `streamResponseHandler`, and `errorHandler`.
    -   Details on custom route definitions.

-   **[Visualization API (<code>@receptron/graphai_vue_cytoscape</code> & <code>@receptron/graphai_react_cytoscape</code>)](visualization.md)**
    -   API for the `useCytoscape` composable (Vue) and hook (React).
    -   Functions like `initCytoscape`, `addNode`, `addEdge`, `layoutGraph`, `on`, `off`.
    -   Types for elements, layout options, and style definitions.

-   **[Firebase API (<code>@receptron/graphai_firebase_functions</code> & <code>@receptron/firebase-tools</code>)](firebase.md)**
    -   API for `graphai_firebase(config)` function.
    -   Type definitions for `GraphAIFirebaseFunctionConfig`.
    -   Details on utilities from `@receptron/firebase-tools`, such as `firebaseStreamFilter`.

-   **[Stream Utilities API (<code>@receptron/stream_utils</code>)](stream-utils.md)**
    -   Documentation for exported parsers (e.g., `NdjsonParser`, `SSEParser`).
    -   Functions for stream transformation (e.g., `createFilterStream`, `createMapStream`).
    -   Helper utilities for working with Node.js streams and async iterables.

-   **[Event Agent Generator API (<code>@receptron/event_agent_generator</code>)](event-agent-generator.md)**
    -   API for any exported Vue components, composables, or utility functions for generating agent configurations.
    -   Type definitions for agent schemas or configuration objects used by the generator.

Please refer to the source code and type definitions within each package for the most precise API details until this section is fully populated. You can also find usage examples in the [Tutorials](../../tutorials/index.md) and [Examples](../../examples/index.md) sections.