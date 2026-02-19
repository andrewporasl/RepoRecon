function deriveConvexSiteUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.hostname.endsWith(".convex.cloud")) {
      parsed.hostname = parsed.hostname.replace(/\.convex\.cloud$/, ".convex.site");
      return parsed.toString().replace(/\/$/, "");
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

const convexSiteUrl =
  deriveConvexSiteUrl(process.env.CONVEX_SITE_URL) ??
  deriveConvexSiteUrl(process.env.NEXT_PUBLIC_CONVEX_SITE_URL) ??
  deriveConvexSiteUrl(process.env.NEXT_PUBLIC_CONVEX_URL) ??
  "";

const authConfig = {
  providers: [
    {
      domain: convexSiteUrl,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
