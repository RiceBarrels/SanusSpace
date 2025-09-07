"use client"

import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'

class SplashScreenManager {
  constructor() {
    this.isNative = Capacitor.isNativePlatform()
    this.isHidden = false
  }

  async hide(options = {}) {
    if (!this.isNative || this.isHidden) return
    
    try {
      await SplashScreen.hide({
        fadeOutDuration: options.fadeOutDuration || 300,
        ...options
      })
      this.isHidden = true
      console.log('✅ Splash screen hidden successfully')
    } catch (error) {
      console.error('❌ Error hiding splash screen:', error)
    }
  }

  async show(options = {}) {
    if (!this.isNative) return
    
    try {
      await SplashScreen.show({
        showDuration: options.showDuration || 3000,
        fadeInDuration: options.fadeInDuration || 200,
        ...options
      })
      this.isHidden = false
      console.log('✅ Splash screen shown successfully')
    } catch (error) {
      console.error('❌ Error showing splash screen:', error)
    }
  }

  async hideWhenReady(delay = 500) {
    // Add a small delay to ensure smooth transition
    setTimeout(() => this.hide(), delay)
  }
}

// Singleton instance
export const splashScreenManager = new SplashScreenManager()

// Hook for React components
export function useSplashScreen() {
  const hide = (options) => splashScreenManager.hide(options)
  const show = (options) => splashScreenManager.show(options)
  const hideWhenReady = (delay) => splashScreenManager.hideWhenReady(delay)
  
  return {
    hide,
    show,
    hideWhenReady,
    isNative: splashScreenManager.isNative
  }
}