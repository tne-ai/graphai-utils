import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'GraphAI Utils Documentation',
  description: 'Complete toolkit for building GraphAI-powered applications with OpenAI API compatibility, graph visualization, and cloud deployment',
  
  // Site configuration
  base: '/graphai-utils/',
  lang: 'en-US',
  
  // Theme configuration
  themeConfig: {
    // Site branding
    siteTitle: 'GraphAI Utils',
    logo: '/logo.svg',
    
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start/' },
      { text: 'Tutorials', link: '/tutorials/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'Reference', link: '/reference/' }
    ],
    
    // Sidebar navigation structure matching MkDocs
    sidebar: {
      '/quick-start/': [
        {
          text: 'Quick Start',
          items: [
            { text: 'Overview', link: '/quick-start/' },
            { text: 'OpenAI Server', link: '/quick-start/openai-server' },
            { text: 'Add Visualization', link: '/quick-start/add-visualization' },
            { text: 'Deploy to Cloud', link: '/quick-start/deployment' }
          ]
        }
      ],
      '/tutorials/': [
        {
          text: 'Tutorials',
          items: [
            { text: 'Overview', link: '/tutorials/' },
            { text: 'Chat Server', link: '/tutorials/chat-server' },
            { text: 'Graph Dashboard', link: '/tutorials/graph-dashboard' },
            { text: 'Agent Generator', link: '/tutorials/agent-generator' },
            { text: 'Streaming Data', link: '/tutorials/streaming-data' },
            { text: 'Firebase Integration', link: '/tutorials/firebase-integration' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Server', link: '/examples/basic-server' },
            { text: 'Vue Dashboard', link: '/examples/vue-dashboard' },
            { text: 'React Visualizer', link: '/examples/react-visualizer' },
            { text: 'Firebase Deployment', link: '/examples/firebase-deployment' },
            { text: 'Custom Agents', link: '/examples/custom-agents' }
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
            { text: 'Performance', link: '/guides/performance' },
            { text: 'Troubleshooting', link: '/guides/troubleshooting' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/reference/' },
            {
              text: 'Packages',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/reference/packages/' },
                { text: 'Express Middleware', link: '/reference/packages/express' },
                { text: 'Express Types', link: '/reference/packages/express-type' },
                { text: 'Vue Cytoscape', link: '/reference/packages/vue-cytoscape' },
                { text: 'React Cytoscape', link: '/reference/packages/react-cytoscape' },
                { text: 'Event Agent Generator', link: '/reference/packages/event-agent-generator' },
                { text: 'Stream Utils', link: '/reference/packages/stream-utils' },
                { text: 'Firebase Functions', link: '/reference/packages/firebase-functions' },
                { text: 'Firebase Tools', link: '/reference/packages/firebase-tools' }
              ]
            },
            {
              text: 'API Reference',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/reference/api/' },
                { text: 'Express API', link: '/reference/api/express' },
                { text: 'Event Agent Generator API', link: '/reference/api/event-agent-generator' },
                { text: 'Visualization API', link: '/reference/api/visualization' },
                { text: 'Stream Utils API', link: '/reference/api/stream-utils' },
                { text: 'Firebase API', link: '/reference/api/firebase' }
              ]
            },
            { text: 'Changelog', link: '/reference/changelog' }
          ]
        }
      ]
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/receptron/graphai-utils' },
      { icon: 'npm', link: 'https://www.npmjs.com/search?q=%40receptron%2Fgraphai' }
    ],
    
    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Receptron Team'
    },
    
    // Edit link
    editLink: {
      pattern: 'https://github.com/receptron/graphai-utils/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    
    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    
    // Search configuration
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search docs',
                buttonAriaLabel: 'Search docs'
              },
              modal: {
                noResultsText: 'No results for',
                resetButtonTitle: 'Clear the query',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate'
                }
              }
            }
          }
        }
      }
    },
    
    // Outline configuration
    outline: {
      level: [2, 3],
      label: 'On this page'
    }
  },
  
  // Head configuration
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'GraphAI Utils | Complete GraphAI Toolkit' }],
    ['meta', { property: 'og:site_name', content: 'GraphAI Utils' }],
    ['meta', { property: 'og:image', content: 'https://receptron.github.io/graphai-utils/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://receptron.github.io/graphai-utils/' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');`]
  ],
  
  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    config: (md) => {
      // Add custom markdown-it plugins if needed
    }
  },
  
  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 8000,
    host: true
  },
  
  // Build configuration
  buildEnd: async (siteConfig) => {
    // Custom build end logic if needed
  }
})