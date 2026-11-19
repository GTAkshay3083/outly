import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.outly.app',
  appName: 'Outly',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#08080A',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#08080A',
    },
  },
};

export default config;
