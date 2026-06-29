export const getProductImages = (imageField) => {
  if (!imageField) return [];
  if (typeof imageField !== 'string') return [];
  const trimmed = imageField.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return [imageField];
    }
  }
  return [imageField];
};

export const getFirstProductImage = (imageField) => {
  const images = getProductImages(imageField);
  return images.length > 0 ? images[0] : '';
};
