import Script from "next/script"

export function AdScripts() {
  return (
    <>
      <Script id="hta-ad-1" strategy="afterInteractive">
        {`(function(fwl){var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=fwl||{};s.src="\\/\\/massivesalad.com\\/bRXKVssxd.GplR0RY\\/W\\/cA\\/uenmb9zucZXUMldk\\/P_T\\/cAxZN\\/j\\/Ywz\\/OiTiMOt\\/NazAEJ2FNCjFMF5gN\\/wH";s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({})`}
      </Script>
      <Script id="hta-ad-2" strategy="afterInteractive">
        {`(function(fwl){var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=fwl||{};s.src="\\/\\/massivesalad.com\\/bxX.Vds\\/dgG\\/lv0\\/YCW\\/ck\\/XeRmD9SuRZEUClmkbPpT\\/c\\/xQN\\/j-YGzuNdzGcXtaNRz\\/Eg2\\/N-jxMG4\\/MdQA";s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({})`}
      </Script>
      <Script src="/scripts/hta-popunder.js" strategy="afterInteractive" />
    </>
  )
}
