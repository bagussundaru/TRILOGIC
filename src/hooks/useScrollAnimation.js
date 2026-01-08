import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for scroll-triggered animations using Intersection Observer
 * QCLAY-style scroll animations
 */
export function useScrollAnimation(options = {}) {
    const {
        threshold = 0.1,
        rootMargin = '0px 0px -50px 0px',
        triggerOnce = true
    } = options;

    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref: elementRef, isVisible };
}

/**
 * Hook for stagger animations on multiple elements
 */
export function useStaggerAnimation(itemCount, baseDelay = 0.05) {
    const getDelay = useCallback((index) => {
        return index * baseDelay;
    }, [baseDelay]);

    const getStaggerClass = useCallback((index) => {
        return `stagger-${Math.min(index + 1, 8)}`;
    }, []);

    return { getDelay, getStaggerClass };
}

/**
 * Component wrapper for scroll-triggered animations
 */
export function ScrollAnimation({
    children,
    className = '',
    animation = 'fadeInUp',
    delay = 0,
    threshold = 0.1,
    ...props
}) {
    const { ref, isVisible } = useScrollAnimation({ threshold });

    const animationClasses = {
        fadeInUp: 'scroll-trigger',
        slideLeft: 'scroll-trigger slide-left',
        slideRight: 'scroll-trigger slide-right',
        scale: 'scroll-trigger scale'
    };

    return (
        <div
            ref={ref}
            className={`${animationClasses[animation] || 'scroll-trigger'} ${isVisible ? 'visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}s` }}
            {...props}
        >
            {children}
        </div>
    );
}

export default useScrollAnimation;
