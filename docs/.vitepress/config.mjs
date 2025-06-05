import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'GraphAI Utils',
  description: 'Comprehensive utilities and middleware for the GraphAI ecosystem',
  base: '/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'Tutorials', link: '/tutorials/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Reference', link: '/reference/' }
    ],

    sidebar: {
      '/quick-start/': [
        {
          text: 'Quick Start',
          items: [
            { text: 'Overview', link: '/quick-start/' },
            { text: 'Add Visualization', link: '/quick-start/add-visualization' },
            { text: 'Deployment', link: '/quick-start/deployment' },
            { text: 'OpenAI Server', link: '/quick-start/openai-server' }
          ]
        }
      ],
      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Overview', link: '/guides/' },
            { text: 'Installation', link: '/guides/installation' },
            { text: 'Configuration', link: '/guides/configuration' },
            { text: 'Integration', link: '/guides/integration' },
            { text: 'Agent Development', link: '/guides/agent-development' },
            { text: 'Performance', link: '/guides/performance' },
            { text: 'Security', link: '/guides/security' },
            { text: 'Troubleshooting', link: '/guides/troubleshooting' },
            { text: 'Contributing', link: '/guides/contributing' }
          ]
        }
      ],
      '/tutorials/': [
        {
          text: 'Tutorials',
          items: [
            { text: 'Overview', link: '/tutorials/' },
            { text: 'Agent Generator', link: '/tutorials/agent-generator' },
            { text: 'Chat Server', link: '/tutorials/chat-server' },
            { text: 'Firebase Integration', link: '/tutorials/firebase-integration' },
            { text: 'Graph Dashboard', link: '/tutorials/graph-dashboard' },
            { text: 'Streaming Data', link: '/tutorials/streaming-data' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Server', link: '/examples/basic-server' },
            { text: 'Custom Agents', link: '/examples/custom-agents' },
            { text: 'Firebase Deployment', link: '/examples/firebase-deployment' },
            { text: 'React Visualizer', link: '/examples/react-visualizer' },
            { text: 'Vue Dashboard', link: '/examples/vue-dashboard' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/reference/' },
            { text: 'Changelog', link: '/reference/changelog' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/reference/api/' },
            { text: 'Express', link: '/reference/api/express' },
            { text: 'Firebase', link: '/reference/api/firebase' },
            { text: 'Event Agent Generator', link: '/reference/api/event-agent-generator' },
            { text: 'Stream Utils', link: '/reference/api/stream-utils' },
            { text: 'Visualization', link: '/reference/api/visualization' }
          ]
        },
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/reference/packages/' },
            { text: 'Express', link: '/reference/packages/express' },
            { text: 'Express Type', link: '/reference/packages/express-type' },
            { text: 'Vue Cytoscape', link: '/reference/packages/vue-cytoscape' },
            { text: 'React Cytoscape', link: '/reference/packages/react-cytoscape' },
            { text: 'Event Agent Generator', link: '/reference/packages/event-agent-generator' },
            { text: 'Stream Utils', link: '/reference/packages/stream-utils' },
            { text: 'Firebase Functions', link: '/reference/packages/firebase-functions' },
            { text: 'Firebase Tools', link: '/reference/packages/firebase-tools' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/receptron/graphai-utils' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/receptron/graphai-utils/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Receptron Team'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})