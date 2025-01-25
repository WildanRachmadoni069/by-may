export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generateExcerpt = (content: string): string => {
  const textWithSpaces = content.replace(/<\//g, " </");
  const plainText = textWithSpaces
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
  return plainText.length > 150
    ? `${plainText.substring(0, 150)}...`
    : plainText;
};
