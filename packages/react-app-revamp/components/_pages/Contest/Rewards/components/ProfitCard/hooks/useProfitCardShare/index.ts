import { generateTwitterShareUrlForProfitCard } from "@helpers/share";
import { saveImageToBucket } from "lib/buckets";
import { toPng } from "html-to-image";
import { RefObject, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface UseProfitCardShareParams {
  cardRef: RefObject<HTMLDivElement | null>;
  shareRef: RefObject<HTMLDivElement | null>;
  profitPercentage: number;
  contestAddress: string;
  chainName: string;
}

const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);

  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mime });
};

const useProfitCardShare = ({
  cardRef,
  shareRef,
  profitPercentage,
  contestAddress,
  chainName,
}: UseProfitCardShareParams) => {
  const [isSharing, setIsSharing] = useState(false);

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    if (shareRef.current) {
      shareRef.current.style.display = "none";
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "black",
        filter: node => {
          if (node instanceof HTMLElement && node.getAttribute("data-headlessui-state") !== null) return false;
          return true;
        },
      });
    } finally {
      if (shareRef.current) {
        shareRef.current.style.display = "";
      }
    }
  }, [cardRef, shareRef]);

  const handleShareOnTwitter = useCallback(async () => {
    setIsSharing(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const file = dataUrlToFile(dataUrl, "confetti-profit.png");
      const imageUrl = await saveImageToBucket({
        fileId: `profit-cards/${uuidv4()}.png`,
        type: "image/png",
        file,
      });

      const twitterUrl = generateTwitterShareUrlForProfitCard(profitPercentage, contestAddress, chainName, imageUrl);
      window.open(twitterUrl, "_blank");
    } catch (error) {
      console.error("Failed to share on Twitter:", error);
    } finally {
      setIsSharing(false);
    }
  }, [generateImage, profitPercentage, contestAddress, chainName]);

  const handleSaveImage = useCallback(async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "confetti-profit.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to save image:", error);
    }
  }, [generateImage]);

  return { handleShareOnTwitter, handleSaveImage, isSharing };
};

export default useProfitCardShare;
