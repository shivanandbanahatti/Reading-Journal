import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.granth.readingjournal',
  appName: 'Granth',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
