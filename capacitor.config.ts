import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astrobin',
  appName: 'AstroBin',
  webDir: 'dist/frontend/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  ios: {
    scrollEnabled: true,
    contentInset: 'never',
    limitsNavigationsToAppBoundDomains: true,
    backgroundColor: 'black',
  }
};

export default config;
