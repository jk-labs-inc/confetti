import { useState, useEffect } from "react";
import { FRAME_COUNT, CYCLE_DURATION_MS, FRAME_URLS } from "./constants";

export const useFrameAnimation = () => {
  const [isReady, setIsReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const images: HTMLImageElement[] = [];

    const preloadImages = async () => {
      const promises = FRAME_URLS.map(src => {
        return new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
          images.push(img);
        });
      });

      try {
        await Promise.all(promises);
        if (isMounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to preload loader images:", error);
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    let lastFrameIndex = -1;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = (elapsed % CYCLE_DURATION_MS) / CYCLE_DURATION_MS;
      const frameIndex = Math.floor(progress * FRAME_COUNT);

      if (frameIndex !== lastFrameIndex) {
        lastFrameIndex = frameIndex;
        setCurrentFrame(frameIndex);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isReady]);

  return { isReady, currentFrame };
};
