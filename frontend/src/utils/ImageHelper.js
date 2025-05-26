/**
 * Utility function to handle image paths across the application
 * This ensures consistent image handling for all components
 */

/**
 * Get image source URL from different possible image data formats
 * @param {*} imageData - The image data from the API
 * @param {string} productName - The name of the product (for finding image by name)
 * @returns {string} - The appropriate image URL
 */
export const getImageSrc = (imageData, productName) => {
  // If we have a product name, try to use image from assets/images with same name
  if (productName) {
    // Convert product name to a filename-friendly format (lowercase, replace spaces with hyphens)
    const formattedName = productName.toLowerCase().replace(/\s+/g, '-');
    
    // Try common image extensions
    const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    // Create an image element to test if the file exists
    const img = new Image();
    
    for (let ext of extensions) {
      const potentialPath = `${process.env.PUBLIC_URL}/assets/images/${formattedName}.${ext}`;
      img.src = potentialPath;
      
      // If this resolves to a valid image, return it
      if (img.complete) {
        return potentialPath;
      }
    }
    
    // Also try with the exact product name (no formatting)
    for (let ext of extensions) {
      const potentialPath = `${process.env.PUBLIC_URL}/assets/images/${productName}.${ext}`;
      img.src = potentialPath;
      
      if (img.complete) {
        return potentialPath;
      }
    }
  }

  // If no image is provided
  if (!imageData) return process.env.PUBLIC_URL + "/assets/images/default-product.png";

  // If imageData is a string (path)
  if (typeof imageData === "string") {
    // Check if it's already a complete URL
    if (imageData.startsWith("http") || imageData.startsWith("data:")) {
      return imageData;
    }
    // Handle Laravel storage path
    return `http://localhost:8000/storage/${imageData}`;
  }

  // If Laravel returns an object with path or url
  if (imageData && (imageData.path || imageData.url)) {
    return imageData.path || imageData.url;
  }

  // If Laravel returns an object with data property (possibly base64)
  if (imageData && imageData.data) {
    // If it's already a data URL string
    if (typeof imageData.data === "string") {
      if (imageData.data.includes("data:image")) {
        return imageData.data;
      }
      // Handle Laravel storage path
      if (imageData.data.startsWith("products/")) {
        return `http://localhost:8000/storage/${imageData.data}`;
      }
      // Otherwise treat it as base64
      return `data:image/png;base64,${imageData.data}`;
    }
  }

  // Default fallback image
  return process.env.PUBLIC_URL + "/assets/images/default-product.png";
};

/**
 * Error handler for images
 * @param {Event} e - The error event
 * @param {string} productName - The name of the product (for logging)
 */
export const handleImageError = (e, productName) => {
  console.error("Image failed to load for:", productName);
  e.target.src = process.env.PUBLIC_URL + "/assets/images/default-product.png";
  e.target.onerror = null; // Prevent infinite error loop
};
