"use client"

import { useState } from 'react'

export default function LoadingScreen({ message = "Loading...", showIcon = true }) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        {showIcon && (
          <div className="relative">
            {/* App Icon */}
            <div className="w-24 h-24 rounded-3xl bg-background flex items-center justify-center shadow-lg animate-pulse">
              <img 
                src="/icons/icon-96.webp" 
                alt="Sanus Space" 
                className="w-20 h-20 rounded-2xl"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center hidden">
                <span className="text-2xl font-bold text-primary-foreground">S</span>
              </div>
            </div>
            
            {/* Animated ring around icon */}
            <div className="absolute inset-0 w-24 h-24 rounded-3xl border-4 border-primary/30 animate-spin"></div>
          </div>
        )}
        
        {/* Loading dots animation */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Loading message */}
        <p className="text-muted-foreground text-lg font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  )
}

// Hook to manage loading states
export function useAppLoading(initialLoading = true) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [loadingMessage, setLoadingMessage] = useState("Loading...")

  const startLoading = (message = "Loading...") => {
    setLoadingMessage(message)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  const updateMessage = (message) => {
    setLoadingMessage(message)
  }

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    updateMessage
  }
}