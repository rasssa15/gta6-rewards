"use client"
import { useEffect, useRef } from "react"

const PLAY_ONLY_ON_HOMEPAGE = true
const PLAY_ONCE_PER_SESSION = true

export default function ChestIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const pointsRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (PLAY_ONLY_ON_HOMEPAGE && window.location.pathname !== "/") return
    if (PLAY_ONCE_PER_SESSION && sessionStorage.getItem("g6r_intro_played")) return

    const root = rootRef.current
    if (!root) return

    const particlesC = particlesRef.current
    const pointsEl = pointsRef.current
    const fillEl = fillRef.current
    let timers: ReturnType<typeof setTimeout>[] = []
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    document.documentElement.style.overflow = "hidden"

    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

    function countPoints(target: number, duration: number) {
      const start = performance.now()
      function step(now: number) {
        const p = Math.min(1, (now - start) / duration)
        if (pointsEl) pointsEl.textContent = `+${Math.floor(p * target)} PTS`
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    function spawnParticles(count: number) {
      if (!particlesC) return
      const colors = ["#ffcf3f", "#20e3ff", "#ff1f7a"]
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span")
        s.className = "g6r-particle"
        const angle = ((Math.random() * 160 - 80) * Math.PI) / 180
        const dist = 60 + Math.random() * 90
        const dx = Math.sin(angle) * dist
        const dy = -Math.cos(angle) * dist - 30
        const size = 6 + Math.random() * 6
        s.style.setProperty("--dx", dx.toFixed(1) + "px")
        s.style.setProperty("--dy", dy.toFixed(1) + "px")
        s.style.width = size + "px"
        s.style.height = size + "px"
        s.style.background = colors[i % colors.length]
        s.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`
        s.style.animationDelay = Math.random() * 0.12 + "s"
        particlesC.appendChild(s)
      }
      at(1300, () => { if (particlesC) particlesC.innerHTML = "" })
    }

    function finishHide() {
      if (!root) return
      timers.forEach(clearTimeout)
      timers = []
      root.classList.add("g6r-done")
      document.documentElement.style.overflow = ""
      if (PLAY_ONCE_PER_SESSION) sessionStorage.setItem("g6r_intro_played", "1")
      setTimeout(() => { if (root) root.style.display = "none" }, 650)
    }

    const skipBtn = root.querySelector("[data-g6r-skip]")
    if (skipBtn) (skipBtn as HTMLButtonElement).onclick = finishHide

    if (reduced) {
      root.classList.add("g6r-open", "g6r-reveal")
      if (fillEl) { fillEl.style.transition = "width .4s linear"; fillEl.style.width = "100%" }
      at(900, finishHide)
      return () => timers.forEach(clearTimeout)
    }

    at(60, () => root.classList.add("g6r-charge"))
    at(950, () => {
      root.classList.remove("g6r-charge")
      root.classList.add("g6r-open", "g6r-flash")
      spawnParticles(22)
      countPoints(500, 650)
    })
    at(1950, () => {
      root.classList.add("g6r-reveal")
      if (fillEl) { fillEl.style.transition = "width 1.2s linear"; fillEl.style.width = "100%" }
    })
    at(3300, finishHide)

    return () => { timers.forEach(clearTimeout); document.documentElement.style.overflow = "" }
  }, [])

  return (
    <div id="g6r-intro" className="g6r-intro" ref={rootRef}>
      <div className="g6r-intro__rays" />
      <div className="g6r-intro__vignette" />

      <div className="g6r-intro__scene">
        <div className="g6r-intro__chest-glow" />
        <div className="g6r-intro__chest">
          <div className="g6r-intro__lock" />
          <div className="g6r-intro__lid" />
          <div className="g6r-intro__base" />
        </div>
        <div className="g6r-intro__particles" ref={particlesRef} />
        <div className="g6r-intro__points" ref={pointsRef}>+0 PTS</div>
      </div>

      <div className="g6r-intro__title">
        <h1 className="g6r-intro__h1">GTA<span className="g6r-intro__six">6</span>REWARDS</h1>
        <p className="g6r-intro__tag">Loot crate detected — unlocking your rewards</p>
      </div>

      <div className="g6r-intro__bar"><div className="g6r-intro__bar-fill" ref={fillRef} /></div>
      <button className="g6r-intro__skip" data-g6r-skip aria-label="Skip intro">Skip ▸</button>

      <style jsx>{`
        .g6r-intro, .g6r-intro * { box-sizing: border-box; }
        .g6r-intro {
          --g6r-pink: #ff1f7a;
          --g6r-cyan: #20e3ff;
          --g6r-purple: #9b2eff;
          --g6r-gold: #ffcf3f;
          --g6r-white: #f5f5fb;
          position: fixed; inset: 0; z-index: 999999;
          background: #07060d;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          transition: opacity .6s ease, filter .6s ease, transform .6s ease;
        }
        .g6r-intro.g6r-done { opacity: 0; filter: blur(10px); transform: scale(1.05); pointer-events: none; }

        .g6r-intro__rays{
          position:absolute; inset:-20%;
          background: conic-gradient(from 0deg,
            rgba(255,31,122,.18) 0deg, transparent 35deg,
            rgba(32,227,255,.16) 70deg, transparent 110deg,
            rgba(155,46,255,.18) 150deg, transparent 190deg,
            rgba(255,31,122,.18) 230deg, transparent 270deg,
            rgba(32,227,255,.16) 300deg, transparent 340deg);
          animation: g6r-spin 18s linear infinite;
          opacity:.55;
        }
        .g6r-intro.g6r-flash .g6r-intro__rays{ animation: g6r-spin 18s linear infinite, g6r-flash .7s ease-out; }
        @keyframes g6r-spin{ to{ transform: rotate(360deg); } }
        @keyframes g6r-flash{ 0%{opacity:.55;} 12%{opacity:1; filter:brightness(1.8);} 100%{opacity:.55; filter:brightness(1);} }

        .g6r-intro__vignette{
          position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,.75) 100%);
        }

        .g6r-intro__scene{ position:relative; width:100%; display:flex; flex-direction:column; align-items:center; }

        .g6r-intro__chest-glow{
          position:absolute; top:50%; left:50%; width:260px; height:260px; margin:-130px 0 0 -130px;
          background: radial-gradient(circle, rgba(255,207,63,.35), transparent 70%);
          filter: blur(6px);
          animation: g6r-pulse 2.2s ease-in-out infinite;
        }
        @keyframes g6r-pulse{ 0%,100%{ opacity:.5; transform:scale(.92);} 50%{ opacity:1; transform:scale(1.05);} }

        .g6r-intro__chest{
          position:relative;
          width: clamp(140px, 20vw, 200px);
          height: clamp(112px, 16vw, 160px);
          perspective: 700px;
          animation: g6r-pop-in .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes g6r-pop-in{ 0%{ transform:scale(.4) translateY(20px); opacity:0;} 100%{ transform:scale(1) translateY(0); opacity:1;} }

        .g6r-intro.g6r-charge .g6r-intro__chest{ animation: g6r-pop-in .5s cubic-bezier(.34,1.56,.64,1) both, g6r-shake .12s linear infinite; }
        @keyframes g6r-shake{ 0%,100%{ transform: translateX(0) rotate(0); } 25%{ transform: translateX(-2px) rotate(-.6deg); } 75%{ transform: translateX(2px) rotate(.6deg); } }

        .g6r-intro__base{
          position:absolute; left:0; right:0; bottom:0; height:60%;
          background: linear-gradient(160deg,#2c2734,#15121c 75%);
          border: 3px solid var(--g6r-gold);
          border-radius: 10px 10px 18px 18px;
          box-shadow: 0 0 26px rgba(255,207,63,.25) inset, 0 14px 36px rgba(0,0,0,.55);
        }
        .g6r-intro__base::before{
          content:""; position:absolute; inset:8px 14px; border-radius:6px;
          background-image: repeating-linear-gradient(90deg, rgba(255,207,63,.08) 0 2px, transparent 2px 22px);
        }

        .g6r-intro__lid{
          position:absolute; left:0; right:0; top:0; height:48%;
          background: linear-gradient(160deg,#3a3243,#1b1722 75%);
          border: 3px solid var(--g6r-gold);
          border-radius: 16px 16px 8px 8px;
          transform-origin: bottom center;
          transform: rotateX(0deg);
          transition: transform .55s cubic-bezier(.4,1.7,.6,1);
          box-shadow: 0 0 26px rgba(255,207,63,.3) inset;
        }
        .g6r-intro.g6r-open .g6r-intro__lid{ transform: rotateX(-126deg) translateY(-4px); }

        .g6r-intro__lock{
          position:absolute; top:42%; left:50%; width:22px; height:22px; margin:-11px 0 0 -11px;
          background: linear-gradient(135deg, var(--g6r-cyan), var(--g6r-pink));
          transform: rotate(45deg);
          box-shadow: 0 0 14px var(--g6r-cyan), 0 0 26px var(--g6r-pink);
          z-index: 2;
          transition: transform .35s ease, opacity .35s ease;
          animation: g6r-lock-pulse 1s ease-in-out infinite;
        }
        @keyframes g6r-lock-pulse{ 0%,100%{ filter:brightness(1);} 50%{ filter:brightness(1.6);} }
        .g6r-intro.g6r-charge .g6r-intro__lock{ animation: g6r-lock-pulse .25s ease-in-out infinite; }
        .g6r-intro.g6r-open .g6r-intro__lock{ transform: rotate(45deg) scale(0); opacity:0; }

        .g6r-intro.g6r-reveal .g6r-intro__chest,
        .g6r-intro.g6r-reveal .g6r-intro__chest-glow{ opacity:0; transform: translateY(14px) scale(.85); transition: opacity .5s ease, transform .5s ease; }

        .g6r-intro__particles{ position:absolute; top:50%; left:50%; width:0; height:0; }
        .g6r-intro__particles :global(.g6r-particle){
          position:absolute; top:0; left:0; border-radius:50%;
          animation: g6r-fly 1.1s ease-out forwards;
        }
        @keyframes g6r-fly{
          0%{ transform: translate(0,0) scale(0) rotate(0deg); opacity:1; }
          15%{ transform: translate(calc(var(--dx) * .3), calc(var(--dy) * .5)) scale(1) rotate(140deg); opacity:1; }
          60%{ transform: translate(var(--dx), var(--dy)) scale(1) rotate(300deg); opacity:1; }
          100%{ transform: translate(calc(var(--dx) * 1.15), calc(var(--dy) + 200px)) scale(.5) rotate(460deg); opacity:0; }
        }

        .g6r-intro__points{
          position:absolute; top:42%; left:50%; transform:translate(-50%,-50%);
          font: 800 28px/1 system-ui, sans-serif; color: var(--g6r-gold);
          text-shadow: 0 0 12px rgba(255,207,63,.7);
          opacity:0; transition: opacity .3s ease;
          pointer-events:none; white-space:nowrap;
        }
        .g6r-intro.g6r-open .g6r-intro__points{ opacity:1; }
        .g6r-intro.g6r-reveal .g6r-intro__points{ opacity:0; transition: opacity .4s ease; }

        .g6r-intro__title{ margin-top: 38px; text-align:center; opacity:0; transform: translateY(10px);
          transition: opacity .5s ease, transform .5s ease; }
        .g6r-intro.g6r-reveal .g6r-intro__title{ opacity:1; transform: translateY(0); }

        .g6r-intro__h1{
          margin:0; font: 800 clamp(28px,6vw,44px)/1 'Arial Black', system-ui, sans-serif;
          letter-spacing: .03em; color: var(--g6r-white);
          text-shadow: 0 0 10px var(--g6r-pink), 0 0 26px var(--g6r-purple);
        }
        .g6r-intro.g6r-reveal .g6r-intro__h1{ animation: g6r-flicker 1.1s steps(1) 1; }
        @keyframes g6r-flicker{
          0%{ opacity:.2; } 8%{ opacity:1; } 16%{ opacity:.3; } 24%{ opacity:1; }
          70%{ opacity:1; } 78%{ opacity:.4; } 86%{ opacity:1; } 100%{ opacity:1; }
        }
        .g6r-intro__six{ color: var(--g6r-cyan); margin: 0 6px; text-shadow: 0 0 10px var(--g6r-cyan), 0 0 24px var(--g6r-cyan); }

        .g6r-intro__tag{ margin: 10px 0 0; font: 500 13px/1.4 system-ui, sans-serif; letter-spacing:.06em;
          text-transform: uppercase; color: rgba(245,245,251,.65); }

        .g6r-intro__bar{ position:absolute; bottom: 48px; width: min(260px, 60vw); height: 4px; border-radius: 2px;
          background: rgba(255,255,255,.12); overflow:hidden; }
        .g6r-intro__bar-fill{ width:0%; height:100%; border-radius:2px;
          background: linear-gradient(90deg, var(--g6r-pink), var(--g6r-cyan));
          box-shadow: 0 0 10px var(--g6r-cyan); }

        .g6r-intro__skip{ position:absolute; top: 22px; right: 22px; background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.18); color: var(--g6r-white); font: 600 12px/1 system-ui, sans-serif;
          letter-spacing:.05em; padding: 8px 14px; border-radius: 999px; cursor:pointer; backdrop-filter: blur(4px);
          transition: background .2s ease, opacity .2s ease; }
        .g6r-intro__skip:hover{ background: rgba(255,255,255,.14); }

        @media (max-width: 480px){
          .g6r-intro__bar{ bottom: 30px; }
          .g6r-intro__skip{ top: 14px; right: 14px; }
        }

        @media (prefers-reduced-motion: reduce){
          .g6r-intro, .g6r-intro *{ animation-duration: .01ms !important; transition-duration: .2s !important; }
        }
      `}</style>
    </div>
  )
}
