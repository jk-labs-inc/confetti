import { PutObjectCommand } from "@aws-sdk/client-s3";
import { toastError, toastLoading, toastSuccess } from "@components/UI/Toast";
import { s3 } from "@config/s3";

const IMAGE_UPLOAD_BUCKET = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_BUCKET as string;

const IMAGE_PUBLIC_URL = IMAGE_UPLOAD_BUCKET.includes("dev")
  ? "https://dev.images.confetti.win"
  : "https://images.confetti.win";

interface SaveImageOptions {
  fileId: string;
  type: string;
  file: File;
}

export const saveImageToBucket = async ({ fileId, type, file }: SaveImageOptions): Promise<string> => {
  toastLoading({
    message: "Uploading image...",
  });
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const input = {
      Bucket: IMAGE_UPLOAD_BUCKET,
      Key: fileId,
      Body: buffer,
      ContentType: type,
    };

    const command = new PutObjectCommand(input);
    await s3.send(command);

    const originalUrl = `${IMAGE_PUBLIC_URL}/${fileId}`;
    toastSuccess({
      message: "Image uploaded successfully!",
    });
    return originalUrl;
  } catch (error: any) {
    toastError({
      message: "Failed to upload an image, please try again.",
      messageToCopy: error.message,
    });
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image with ID ${fileId} to bucket ${IMAGE_UPLOAD_BUCKET}`);
  }
};
