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
  // If the file is a drawing blob, we try to convert to dataURL, else generate a cute SVG representation
  if (file instanceof File || file instanceof Blob) {
    try {
      const dataUrl = await blobToDataURL(file);
      return {
        url: dataUrl,
        publicId,
        isSimulated: true,
      };
    } catch {
      // Fallback SVG image
      const colors = ["#63B3ED", "#9F7AEA", "#68D391", "#F6E05E", "#FBB6CE"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
          <rect width="100%" height="100%" fill="#F7FAFC"/>
          <circle cx="200" cy="200" r="120" fill="${randomColor}" opacity="0.3"/>
          <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="24" font-weight="bold" fill="#4A5568">سند مساحة أمان 🌟</text>
          <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="16" fill="#718096">لوحة رسمة / ملف مرفوع بنجاح</text>
          <path d="M150,280 Q200,320 250,280" stroke="#4A5568" stroke-width="5" fill="none" stroke-linecap="round"/>
        </svg>
      `;
      const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
      return {
        url: `data:image/svg+xml;base64,${encodedSvg}`,
        publicId,
        isSimulated: true,
      };
    }
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
