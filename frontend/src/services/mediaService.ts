
const MEDIA_BASE = "/media";

export const optimizeImage = async (file: File, signal?: AbortSignal): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    
    const response = await fetch(`${MEDIA_BASE}/image/optimize`, {
      method: "POST",
      headers: {
        "X-Internal-Key": import.meta.env.VITE_INTERNAL_API_KEY, 
      },
      body: formData,
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.message || error.error || "Image optimization failed");
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error("Image optimization failed");
    }

    
    return data.url;

  } catch (error) {
    console.error("[Media Service] Image upload failed:", error);
    throw error;
  }
};