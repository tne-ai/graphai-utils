import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'GraphAI Utils Documentation',
  description: 'Complete toolkit for building GraphAI-powered applications',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start/' }
    ],
    
    sidebar: [
      {
        text: 'Quick Start',
        items: [
          { text: 'Overview', link: '/quick-start/' }
        ]
      }
    ]
  }
})