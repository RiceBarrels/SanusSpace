import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Sanus Space',
  webDir: 'out',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['jsxixsqrvxqptdunnqis.supabase.co','accounts.google.com'],
    cleartext: true,
  },
};

export default config;
