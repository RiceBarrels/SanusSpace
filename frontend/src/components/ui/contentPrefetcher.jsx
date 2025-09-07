"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ContentPrefetcher({ routes = [], onHover = true, onMount = false }) {
    const router = useRouter();
    const prefetchedRoutes = useRef(new Set());

    // Prefetch routes on component mount
    useEffect(() => {
        if (onMount && routes.length > 0) {
            routes.forEach(route => {
                if (!prefetchedRoutes.current.has(route)) {
                    router.prefetch(route);
                    prefetchedRoutes.current.add(route);
                    console.log(`Prefetched route: ${route}`);
                }
            });
        }
    }, [routes, onMount, router]);

    // Method to manually prefetch a specific route
    const prefetchRoute = (route) => {
        if (!prefetchedRoutes.current.has(route)) {
            router.prefetch(route);
            prefetchedRoutes.current.add(route);
            console.log(`Manually prefetched route: ${route}`);
        }
    };

    // Method to prefetch content based on API data without navigation
    const prefetchContent = async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Prefetched content from: ${url}`, data);
            return data;
        } catch (error) {
            console.error(`Failed to prefetch content from ${url}:`, error);
            return null;
        }
    };

    return {
        prefetchRoute,
        prefetchContent,
        prefetchedRoutes: Array.from(prefetchedRoutes.current)
    };
}

// Hook version for easier use in components
export function usePrefetch() {
    const router = useRouter();
    const prefetchedRoutes = useRef(new Set());

    const prefetchRoute = (route) => {
        if (!prefetchedRoutes.current.has(route)) {
            router.prefetch(route);
            prefetchedRoutes.current.add(route);
            console.log(`Prefetched route: ${route}`);
        }
    };

    const prefetchContent = async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Prefetched content from: ${url}`, data);
            return data;
        } catch (error) {
            console.error(`Failed to prefetch content from ${url}:`, error);
            return null;
        }
    };

    return {
        prefetchRoute,
        prefetchContent,
        prefetchedRoutes: Array.from(prefetchedRoutes.current)
    };
} 