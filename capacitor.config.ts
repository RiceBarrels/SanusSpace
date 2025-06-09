import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.reforkit.app',
  appName: 'Sanus Space',
  webDir: 'out',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
    Browser: {
      presentationStyle: 'fullscreen',
    },
  },
  server: {
    androidScheme: 'sanusspace',
    iosScheme: 'sanusspace',
    allowNavigation: ['jsxixsqrvxqptdunnqis.supabase.co'],
    cleartext: true,
    // hostname: 'app' // for production
    url: 'http://100.80.135.22:3000' // for testing with local server
  },
};

export default config;
