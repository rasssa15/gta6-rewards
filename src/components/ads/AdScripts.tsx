import Script from "next/script"

export function AdScripts() {
  return (
    <>
      <Script id="ecn-popunder" strategy="afterInteractive" src="https://pl30094851.effectivecpmnetwork.com/10/96/87/1096871c1a5c431a64e392af34979fca.js" />
      <Script id="ecn-push" strategy="afterInteractive" src="https://pl30094859.effectivecpmnetwork.com/ff/b1/57/ffb157e82e676bd4567195e4e8ab3341.js" />
      <Script id="ht-slider" strategy="afterInteractive">
        {`
(function(bimm){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = bimm || {};
s.src = "\\/\\/massivesalad.com\\/b.XFV\\/sudZGslc0JYDWZcu\\/we\\/mG9\\/uPZoUAlek\\/P-TWc\\/xtNGjGYUzqNgzccctYNuzjE\\/2sNrjIM\\/4RMJQu";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
        `}
      </Script>
    </>
  )
}
