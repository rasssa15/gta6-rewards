import { AD_CONFIG, type AdType } from "./adConfig"

interface LazyAdProps {
  type: AdType
  minHeight?: number
  className?: string
}

// Renders Adsterra's exact embed snippet as real <script> tags in the
// server-rendered HTML so they execute in document order:
//  - "responsive" zones use the container method (div#container-KEY + invoke.js)
//  - all banner zones use atOptions + invoke.js (render-blocking, in order)
// Dynamic client-side injection breaks these (document.write / atOptions race),
// so we output them statically instead of via useEffect.
export function LazyAd({ type, minHeight, className }: LazyAdProps) {
  const cfg = AD_CONFIG[type]
  const h = minHeight || cfg.height

  if (type === "responsive") {
    return (
      <div className={className} style={{ minHeight: h }}>
        <div id={cfg.containerId} />
        <script async data-cfasync="false" src={cfg.script} />
      </div>
    )
  }

  const snippet = `atOptions = {'key':'${cfg.key}','format':'iframe','height':${cfg.height},'width':${cfg.width},'params':{}};`

  return (
    <div className={className} style={{ minHeight: h }}>
      <script dangerouslySetInnerHTML={{ __html: snippet }} />
      <script src={cfg.script} />
    </div>
  )
}
