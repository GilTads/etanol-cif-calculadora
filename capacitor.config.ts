import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a7f23cd0db344e0c9a8f8018c5b9ee34',
  appName: 'SH CIF',
  webDir: 'dist',
  // server: {
  //   url: 'https://a7f23cd0-db34-4e0c-9a8f-8018c5b9ee34.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'etanol-cif',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle : "Biometric login for capacitor sqlite"
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
      }
    },
    // Adicione a configuração do SplashScreen aqui
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#2e5959",
      androidScaleType: "CENTER_CROP",
      androidSplashResourceName: "splash",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen"
    }
  }
};

export default config;