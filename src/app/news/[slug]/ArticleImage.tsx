"use client"

export default function ArticleImage({ src, alt, slug }: { src: string; alt: string; slug: string }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-8">
      <img
        src={src || `https://picsum.photos/seed/${slug}/1200/675`}
        alt={alt}
        className="w-full h-auto"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${slug}/1200/675`
        }}
      />
    </div>
  )
}