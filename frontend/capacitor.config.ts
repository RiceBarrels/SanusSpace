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
      resizeOnFullScreen: true,
    },
    Browser: {
    },
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: "#FFFDF1",
      androidSplashResourceName: "splash_background",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#9ECFCA",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  server: {
    androidScheme: 'sanusspace',
    iosScheme: 'sanusspace',
    allowNavigation: ['jsxixsqrvxqptdunnqis.supabase.co'],
    cleartext: true,
    hostname: 'app' // for production 
    // url: 'http://192.168.150.177:3000' // for testing with local server
  },
};

export default config;
