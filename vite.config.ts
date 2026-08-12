
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  import path from 'path';

  /**
   * Relative base (`./`) makes asset URLs work for both:
   * - Project Pages: https://org.github.io/<repo>/
   * - Subdomain / private Pages: https://*.pages.github.io/ (served at site root, not /<repo>/)
   *
   * Set BASE_PATH=/my/subpath/ only when you explicitly host under a fixed path (e.g. CDN).
   */
  const base =
    process.env.BASE_PATH != null && process.env.BASE_PATH !== ''
      ? process.env.BASE_PATH.replace(/\/?$/, '/')
      : './';

  export default defineConfig({
    base,
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/f0c15171c575bb8aa71b3703f917cb5be31788dd.png': path.resolve(__dirname, './src/assets/f0c15171c575bb8aa71b3703f917cb5be31788dd.png'),
        'figma:asset/ec90618f4fe697ef59f9ba376c95f32ab905bf13.png': path.resolve(__dirname, './src/assets/ec90618f4fe697ef59f9ba376c95f32ab905bf13.png'),
        'figma:asset/e80552e5cd311931922a10d6dd70061713e6b1ac.png': path.resolve(__dirname, './src/assets/e80552e5cd311931922a10d6dd70061713e6b1ac.png'),
        'figma:asset/cf1083401990504fa214e1814dd9e86530f6484c.png': path.resolve(__dirname, './src/assets/cf1083401990504fa214e1814dd9e86530f6484c.png'),
        'figma:asset/c3e2da2431edb45e665c1d6bfc0377ef4df16956.png': path.resolve(__dirname, './src/assets/c3e2da2431edb45e665c1d6bfc0377ef4df16956.png'),
        'figma:asset/99ba70c9442119f320638528787cb086eabb5871.png': path.resolve(__dirname, './src/assets/99ba70c9442119f320638528787cb086eabb5871.png'),
        'figma:asset/956984e2f299222affe9c3f9d1b91d646e618dbf.png': path.resolve(__dirname, './src/assets/956984e2f299222affe9c3f9d1b91d646e618dbf.png'),
        'figma:asset/8128ea9b2697cf84d6336d0cf0bbd261c3cae4a6.png': path.resolve(__dirname, './src/assets/8128ea9b2697cf84d6336d0cf0bbd261c3cae4a6.png'),
        'figma:asset/6f1e4ef08a4e8899bba87998c3410a8132536714.png': path.resolve(__dirname, './src/assets/6f1e4ef08a4e8899bba87998c3410a8132536714.png'),
        'figma:asset/4791b41afa3cbdfd3b5bceec099dbf0fe05b97cd.png': path.resolve(__dirname, './src/assets/4791b41afa3cbdfd3b5bceec099dbf0fe05b97cd.png'),
        'figma:asset/44a0d931f8b012dcfc18715f7a64847e76751825.png': path.resolve(__dirname, './src/assets/44a0d931f8b012dcfc18715f7a64847e76751825.png'),
        'figma:asset/41836246ebeea8335f78a1ba2a938aabf44d0607.png': path.resolve(__dirname, './src/assets/41836246ebeea8335f78a1ba2a938aabf44d0607.png'),
        'figma:asset/31a207ddb210814d45f4e60c5afe26c81fb55207.png': path.resolve(__dirname, './src/assets/31a207ddb210814d45f4e60c5afe26c81fb55207.png'),
        'figma:asset/15ef82c8ee79f6111e42949aea8f2307269524d3.png': path.resolve(__dirname, './src/assets/15ef82c8ee79f6111e42949aea8f2307269524d3.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });