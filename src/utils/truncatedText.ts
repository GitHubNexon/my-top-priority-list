export const truncatedText = (text: string, maxIndex: number ): string => {
  if (text.length <= maxIndex) return text;

  let cutIndex = maxIndex;

  // Move backward until we find a space
  while (cutIndex > 0 && text[cutIndex] !== ' ') {
    cutIndex--;
  }

  // If no space found, fallback to hard cut
  if (cutIndex === 0) {
    cutIndex = maxIndex;
  }

  return text.slice(0, cutIndex) + '...';
};

export const isTruncated = (text: string): boolean => {
  return text.endsWith('...');
};