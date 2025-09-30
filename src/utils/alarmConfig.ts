export const isValidUri = (uri: string): boolean => {
  try {
    return (
      uri.startsWith('content://') ||
      uri.startsWith('file://') ||
      uri.includes('android_asset')
    );
  } catch {
    return false;
  }
};
