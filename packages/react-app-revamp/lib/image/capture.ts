import html2canvas from "html2canvas";

export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);

  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mime });
};

export const captureElementAsDataUrl = async (
  element: HTMLElement,
  options?: {
    removeSelector?: string;
    tweaks?: (clone: HTMLElement) => void;
  },
): Promise<string> => {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    windowWidth: 1024,
    onclone: (_doc, clonedEl) => {
      if (options?.removeSelector) {
        clonedEl.querySelectorAll<HTMLElement>(options.removeSelector).forEach(el => el.remove());
      }
      options?.tweaks?.(clonedEl);
    },
    ignoreElements: node =>
      node instanceof HTMLElement && node.getAttribute("data-headlessui-state") !== null,
  });
  return canvas.toDataURL("image/png");
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
