import { captureElementAsDataUrl, dataUrlToFile, downloadDataUrl } from "lib/image/capture";
import { RefObject, useRef, useState } from "react";

const IMAGE_FILENAME = "confetti-profit.png";

interface UseProfitCardShareParams {
  cardRef: RefObject<HTMLDivElement | null>;
  profitPercentage: number;
  contestAddress: string;
  chainName: string;
}

const useProfitCardShare = ({ cardRef, profitPercentage, contestAddress, chainName }: UseProfitCardShareParams) => {
  const [isSharing, setIsSharing] = useState(false);
  const cachedFileRef = useRef<File | null>(null);

  const captureCard = async () => {
    if (!cardRef.current) return null;

    return captureElementAsDataUrl(cardRef.current, {
      removeSelector: '[aria-label="Share profit card"], [aria-label="Save profit card image"]',
      tweaks: clone => {
        const symbolEl = clone.querySelector(".profit-card-percentage-symbol") as HTMLElement | null;
        if (symbolEl) symbolEl.style.verticalAlign = "bottom";
      },
    });
  };

  const prepareImage = async () => {
    const dataUrl = await captureCard();
    if (!dataUrl) return;
    cachedFileRef.current = dataUrlToFile(dataUrl, IMAGE_FILENAME);
  };

  const handleShare = async () => {
    if (!cachedFileRef.current || !navigator.share) return;

    setIsSharing(true);
    try {
      const contestUrl = `https://confetti.win/contest/${chainName}/${contestAddress}`;

      await navigator.share({
        text: `+${profitPercentage.toFixed(0)}% profit on @confetti_win!\n${contestUrl}`,
        files: [cachedFileRef.current],
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to share:", error);
      }
    } finally {
      setIsSharing(false);
      cachedFileRef.current = null;
    }
  };

  const handleSaveImage = async () => {
    try {
      const dataUrl = await captureCard();
      if (!dataUrl) return;
      downloadDataUrl(dataUrl, IMAGE_FILENAME);
    } catch (error) {
      console.error("Failed to save image:", error);
    }
  };

  return { prepareImage, handleShare, handleSaveImage, isSharing };
};

export default useProfitCardShare;
