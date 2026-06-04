import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://skills-for-change-one-view.vercel.app"
  return [
    { url: base, lastModified: "2026-06-04", changeFrequency: "daily", priority: 1 },
    { url: `${base}/intake`, lastModified: "2026-06-04", changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/export`, lastModified: "2026-06-04", changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ai`, lastModified: "2026-06-04", changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/help`, lastModified: "2026-06-04", changeFrequency: "monthly", priority: 0.7 },
  ]
}
