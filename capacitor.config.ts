import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenone.app',
  appName: '禅一',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#f7f5f0",
      androidSplashResourceName: "splash",
      showSpinner: false, // Hide spinner for Zen look
    }
  }
};

export default config;