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
    ignoreSelector?: string;
    removeSelector?: string;
    tweaks?: (clone: HTMLElement) => void;
  },
): Promise<string> => {
  const { width, height } = element.getBoundingClientRect();
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;

  if (options?.removeSelector) {
    clone.querySelectorAll<HTMLElement>(options.removeSelector).forEach(el => el.remove());
  }

  options?.tweaks?.(clone);

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
      logging: false,
      ignoreElements: node =>
        node instanceof HTMLElement && node.getAttribute("data-headlessui-state") !== null,
    });
    return canvas.toDataURL("image/png");
  } finally {
    document.body.removeChild(clone);
  }
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
