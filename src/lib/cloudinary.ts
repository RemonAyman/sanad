/**
 * Cloudinary & Simulated Upload Helper
 * Handles uploading file objects to Cloudinary.
 * If credentials are not set, it simulates a successful upload with highly realistic mock data URLs.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export interface UploadResult {
  url: string;
  publicId: string;
  isSimulated: boolean;
}

export async function uploadFile(
  file: File | Blob,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<UploadResult> {
  // If keys are missing, trigger simulated upload
  if (!CLOUD_NAME || !UPLOAD_PRESET || CLOUD_NAME === "placeholder" || UPLOAD_PRESET === "placeholder") {
    return simulateUpload(file, resourceType);
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType === "raw" ? "auto" : resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      isSimulated: false,
    };
  } catch (error) {
    console.warn("Cloudinary upload failed, falling back to simulation:", error);
    return simulateUpload(file, resourceType);
  }
}

/**
 * Generates beautiful simulated assets in base64 to ensure the platform works 100% offline or unconfigured.
 */
async function simulateUpload(
  file: File | Blob,
  resourceType: "image" | "video" | "raw"
): Promise<UploadResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network latency

  const publicId = `simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 1. Voice Notes / Audio uploads
  if (resourceType === "raw" || (file instanceof File && file.name.endsWith(".wav")) || file.type.includes("audio")) {
    // Generate a tiny valid silent/beep WAV data URL (1 second) so player doesn't fail
    const mockAudioBase64 = 
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    return {
      url: mockAudioBase64,
      publicId,
      isSimulated: true,
    };
  }

  // 2. Video uploads
  if (resourceType === "video" || file.type.includes("video")) {
    // Return a beautiful public sample child-safe cartoon video
    return {
      url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
      publicId,
      isSimulated: true,
    };
  }

  // 3. Images & Drawings
  // When Cloudinary is unreachable, return a small placeholder URL instead of a huge data URL.
  if (file instanceof File || file instanceof Blob) {
    return {
      url: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg",
      publicId,
      isSimulated: true,
    };
  }

  return {
    url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&auto=format&fit=crop&q=60",
    publicId,
    isSimulated: true,
  };
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
