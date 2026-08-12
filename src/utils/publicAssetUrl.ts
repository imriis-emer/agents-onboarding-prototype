/** Resolve a file from `/public` for both dev (`/`) and production (`./`) bases. */
export function publicAssetUrl(path: string): string {
  const normalized = path.replace(/^\//, "");

  if (import.meta.env.DEV) {
    return `/${normalized}`;
  }

  const base = import.meta.env.BASE_URL;
  if (base === "./") {
    return `./${normalized}`;
  }

  return `${base.replace(/\/?$/, "/")}${normalized}`;
}
