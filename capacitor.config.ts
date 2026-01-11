import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumina.readingjournal',
  appName: 'Lumina',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
