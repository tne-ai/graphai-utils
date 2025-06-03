# Contributing Guide

Thank you for your interest in contributing to GraphAI Utils! We welcome contributions from the community to help improve and expand this toolkit.

## Ways to Contribute

There are many ways you can contribute:

-   **Reporting Bugs**: If you find a bug, please open an issue on our [GitHub repository](https://github.com/receptron/graphai-utils/issues).
-   **Suggesting Enhancements**: Have an idea for a new feature or an improvement to an existing one? Open an issue to discuss it.
-   **Writing Documentation**: Improving documentation, adding examples, or creating tutorials is incredibly valuable.
-   **Submitting Code Patches**: Fixing bugs or implementing new features via Pull Requests.
-   **Reviewing Pull Requests**: Help review PRs submitted by others.
-   **Answering Questions**: Help others in GitHub Discussions or by answering questions in issues.

## Getting Started

1.  **Fork the Repository**: Click the "Fork" button on the [GraphAI Utils GitHub page](https://github.com/receptron/graphai-utils) to create your own copy.
2.  **Clone Your Fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/graphai-utils.git
    cd graphai-utils
    ```
3.  **Set Upstream Remote**:
    ```bash
    git remote add upstream https://github.com/receptron/graphai-utils.git
    ```
4.  **Install Dependencies**: GraphAI Utils is a monorepo using Yarn Workspaces.
    ```bash
    yarn install
    ```
    This will install dependencies for all packages and link them.

5.  **Build All Packages**:
    ```bash
    yarn build 
    # Or check package.json for the root build script, e.g., yarn workspaces run build
    ```

## Development Workflow

1.  **Create a New Branch**: Before making changes, create a new branch from the `main` branch (or the relevant development branch).
    ```bash
    git checkout main
    git pull upstream main # Ensure your main is up-to-date
    git checkout -b my-feature-or-fix-branch
    ```
    Branch naming conventions:
    -   Features: `feature/descriptive-name` (e.g., `feature/add-new-agent-utility`)
    -   Bugfixes: `fix/descriptive-name` (e.g., `fix/resolve-cytoscape-layout-issue`)
    -   Documentation: `docs/update-readme-xyz`

2.  **Make Your Changes**:
    -   Work within the relevant package directory (e.g., `packages/graphai_express`).
    -   Follow existing coding styles and patterns.
    -   Write or update unit tests for your changes.
    -   Update documentation (READMEs, JSDoc/TSDoc comments, or files in the `docs/` directory if contributing to the documentation site).

3.  **Test Your Changes**:
    -   Run tests for the specific package you modified:
        ```bash
        yarn workspace @receptron/package-name test
        ```
    -   Run tests for all packages from the root:
        ```bash
        yarn test 
        # Or yarn workspaces run test
        ```
    -   Manually test your changes in a sample application if applicable.

4.  **Lint and Format**:
    Ensure your code adheres to the project's linting and formatting rules.
    ```bash
    yarn eslint # Check for linting errors
    yarn format # Format code using Prettier (or similar)
    # Or from root: yarn workspaces run eslint / yarn workspaces run format
    ```

5.  **Commit Your Changes**:
    -   Use clear and descriptive commit messages. Follow a conventional commit format if the project uses one (e.g., `feat: Add X feature`, `fix: Correct Y bug`, `docs: Update Z documentation`).
    -   Commit frequently with small, logical changes.
    ```bash
    git add .
    git commit -m "feat(express): Add support for custom response transformation"
    ```

6.  **Push to Your Fork**:
    ```bash
    git push origin my-feature-or-fix-branch
    ```

7.  **Open a Pull Request (PR)**:
    -   Go to your fork on GitHub (`https://github.com/YOUR_USERNAME/graphai-utils`).
    -   Click the "Compare & pull request" button for your branch.
    -   Ensure the base repository is `receptron/graphai-utils` and the base branch is `main` (or the appropriate target branch).
    -   Provide a clear title and detailed description for your PR:
        -   What problem does it solve or what feature does it add?
        -   How were the changes implemented?
        -   How can the changes be tested?
        -   Link to any relevant issues (e.g., "Closes #123").
    -   If your PR is a work in progress, mark it as a "Draft" PR.

8.  **Address Feedback**:
    -   Project maintainers will review your PR. Be prepared to discuss your changes and make adjustments based on feedback.
    -   Push new commits to your branch to update the PR.

## Coding Guidelines

-   **TypeScript**: Most packages are written in TypeScript. Please use TypeScript for new code.
-   **Style**: Follow the existing coding style. The project likely uses ESLint and Prettier to enforce style consistency.
-   **Comments**: Write clear JSDoc/TSDoc comments for public APIs, complex logic, and non-obvious code.
-   **Tests**:
    -   Write unit tests for new functionality and bug fixes.
    -   Ensure existing tests pass after your changes.
    -   The project uses Node.js built-in test runner with `ts-node`.
-   **Documentation**:
    -   Update relevant README files or documentation within the `docs/` directory.
    -   For new features, ensure they are documented.

## Documentation Contributions

If you're contributing to the MkDocs documentation site (in the `docs/` directory):

1.  **Install MkDocs and dependencies** (if not already set up by root `yarn install`):
    ```bash
    pip install mkdocs-material mkdocs-git-revision-date-localized-plugin mkdocs-git-committers-plugin-2 mkdocs-minify-plugin pymdown-extensions
    ```
2.  **Preview Documentation Locally**:
    From the root of the `graphai-utils` repository:
    ```bash
    mkdocs serve
    ```
    This will start a local development server (usually at `http://127.0.0.1:8000/`) where you can see your documentation changes live.

3.  **Markdown**: Write documentation in Markdown. Follow existing structure and style.
4.  **Mermaid Diagrams**: Use Mermaid syntax for diagrams where appropriate.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. (If a Code of Conduct file exists, link to it; otherwise, this is a general statement).

## Questions?

If you have questions about contributing, feel free to:
-   Open an issue on GitHub.
-   Start a discussion in the GitHub Discussions tab for the repository.

We appreciate your help in making GraphAI Utils better!