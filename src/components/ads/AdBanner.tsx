interface AdBannerProps {
  adKey: string
  height: number
  width: number
  format?: string
  className?: string
}

export function AdBanner({ adKey, height, width, className }: AdBannerProps) {
  const snippet = `atOptions = {'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};`

  return (
    <div className={className}>
      <script dangerouslySetInnerHTML={{ __html: snippet }} />
      <script src={`https://evidentbummerhike.com/${adKey}/invoke.js`} />
    </div>
  )
}
