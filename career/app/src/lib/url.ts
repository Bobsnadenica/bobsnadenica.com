const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;
const ASSET_OVERRIDES: Record<string, string> = {
  "/assets/consultant-1.jpg":
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
  "/assets/consultant-2.jpg":
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
  "/assets/map-static.jpg":
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
};

export function resolvePublicUrl(path: string) {
  const resolvedPath = ASSET_OVERRIDES[path] || path;

  if (!resolvedPath || ABSOLUTE_URL_PATTERN.test(resolvedPath) || resolvedPath.startsWith("data:")) {
    return resolvedPath;
  }

  if (resolvedPath.startsWith("/")) {
    return `${import.meta.env.BASE_URL}${resolvedPath.slice(1)}`;
  }

  return resolvedPath;
}
