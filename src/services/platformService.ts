import { Capacitor } from '@capacitor/core';

export const PlatformService = {
  isNative: () => Capacitor.isNativePlatform(),
  isWeb: () => !Capacitor.isNativePlatform(),
  getPlatform: () => Capacitor.getPlatform(),
};