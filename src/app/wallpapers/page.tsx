"use client"
import { useState, useMemo } from "react"
import { Download, Image, Check, Loader2, X } from "lucide-react"
import toast from "react-hot-toast"

const WALLPAPER_GROUPS = [
  { name: "Jason & Lucia 1", folder: "Jason_and_Lucia_01", count: 6 },
  { name: "Jason & Lucia 1 (Logos)", folder: "Jason_and_Lucia_01_With_Logos", count: 3 },
  { name: "Jason & Lucia 2", folder: "Jason_and_Lucia_02", count: 7 },
  { name: "Jason & Lucia 2 (Logos)", folder: "Jason_and_Lucia_02_With_Logos", count: 3 },
  { name: "Jason & Lucia 3", folder: "Jason_and_Lucia_03", count: 6 },
  { name: "Jason & Lucia 3 (Logos)", folder: "Jason_and_Lucia_03_With_Logos", count: 3 },
  { name: "Jason & Lucia Motel", folder: "Jason_Lucia_Motel", count: 6 },
  { name: "Official Cover Art", folder: "Official_Cover_Art", count: 6 },
  { name: "Boobie Ike", folder: "Boobie_Ike", count: 6 },
  { name: "Brian Heder", folder: "Brian_Heder", count: 6 },
  { name: "Cal Hampton", folder: "Cal_Hampton", count: 6 },
  { name: "DreQuan Priest", folder: "DreQuan_Priest", count: 6 },
  { name: "Raul Bautista", folder: "Raul_Bautista", count: 6 },
  { name: "Real Dimez", folder: "Real_Dimez", count: 6 },
  { name: "Ambrosia Postcard", folder: "Postcards-Ambrosia", count: 6 },
  { name: "Grassrivers Postcard", folder: "Postcards-Grassrivers", count: 6 },
  { name: "Leonida Keys Postcard", folder: "Postcards-Leonida_Keys", count: 6 },
  { name: "Mount Kalaga Postcard", folder: "Postcards-Mount_Kalaga_National_Park", count: 6 },
  { name: "Port Gellhorn Postcard", folder: "Postcards-Port_Gellhorn", count: 6 },
  { name: "Vice City Postcard", folder: "Postcards-Vice_City", count: 6 },
]

const ASPECTS = ["landscape", "phone", "portrait", "square", "tablet", "ultrawide"]

function getVariants(folder: string): { label: string; src: string }[] {
  const base = `/images/wallpapers-art/${folder}-${folder}`
  if (folder === "Jason_and_Lucia_02") {
    return [
      { label: "Landscape", src: `${base}_landscape.jpg` },
      { label: "Phone A", src: `${base}_phone_A.jpg` },
      { label: "Phone B", src: `${base}_phone_B.jpg` },
      { label: "Portrait", src: `${base}_portrait.jpg` },
      { label: "Square", src: `${base}_square.jpg` },
      { label: "Tablet", src: `${base}_tablet.jpg` },
      { label: "Ultrawide", src: `${base}_ultrawide.jpg` },
    ]
  }
  return ASPECTS.map(a => ({ label: a.charAt(0).toUpperCase() + a.slice(1), src: `${base}_${a}.jpg` }))
}

function downloadImage(src: string, name: string) {
  const a = document.createElement("a")
  a.href = src
  a.download = name
  a.click()
  toast.success(`Downloading ${name}`)
}

export default function WallpapersPage() {
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<{ folder: string; variants: { label: string; src: string }[] } | null>(null)

  const allWallpapers = useMemo(() =>
    WALLPAPER_GROUPS.map(g => ({
      ...g,
      thumbnail: `/images/wallpapers-art/${g.folder}-${g.folder}_landscape.jpg`,
      variants: getVariants(g.folder),
    })),
  [])

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="page-container">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neon-pink/20">
            <Image className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2">
            GTA VI <span className="bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">Artwork Wallpapers</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Official GTA VI artwork — characters, scenes, and postcards from Vice City
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Image className="w-4 h-4 text-neon-pink" />
              {allWallpapers.length} sets
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Check className="w-4 h-4 text-neon-green" />
              {Object.keys(loaded).length} loaded
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allWallpapers.map((wp) => (
            <div
              key={wp.folder}
              className="group relative glass-card overflow-hidden cursor-pointer"
              onClick={() => setSelected(wp)}
            >
              <div className="aspect-video">
                <img
                  src={wp.thumbnail}
                  alt={wp.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setLoaded(prev => new Set(prev).add(wp.folder))}
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="text-sm text-white font-semibold truncate">{wp.name}</p>
                <p className="text-xs text-gray-500">{wp.count} variants</p>
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-[#0a0a14] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-heading font-bold text-white">{selected.folder.replace(/_/g, " ")}</h3>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {selected.variants.map((v) => (
                  <div key={v.src} className="glass-card overflow-hidden">
                    <div className="aspect-video bg-black/20">
                      <img src={v.src} alt={v.label} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span className="text-sm text-gray-300 font-medium">{v.label}</span>
                      <button
                        onClick={() => downloadImage(v.src, `${selected.folder}-${v.label}.jpg`)}
                        className="flex items-center gap-1 text-xs text-neon-blue hover:text-neon-blue/80 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
