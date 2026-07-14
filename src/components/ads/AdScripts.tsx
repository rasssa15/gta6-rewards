import Script from "next/script"

export function AdScripts() {
  return (
    <>
      <Script id="ecn-popunder" strategy="afterInteractive" src="https://evidentbummerhike.com/10/96/87/1096871c1a5c431a64e392af34979fca.js" />
      <Script id="ecn-push" strategy="afterInteractive" src="https://evidentbummerhike.com/ff/b1/57/ffb157e82e676bd4567195e4e8ab3341.js" />
      <Script id="adsterra-responsive" strategy="afterInteractive">
        {`
          var adsterra_protocol = "https:";
          var adsterra_domain = "evidentbummerhike.com";
        `}
      </Script>
      <Script id="adsterra-468x60" strategy="afterInteractive">
        {`
          atOptions = {
            'key' : 'ab7ca47a4d4e9c1d01cb3978051a9800',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        `}
      </Script>
      <Script id="adsterra-468x60-invoke" strategy="afterInteractive" src="https://evidentbummerhike.com/ab7ca47a4d4e9c1d01cb3978051a9800/invoke.js" />
    </>
  )
}
