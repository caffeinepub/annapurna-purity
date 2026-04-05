import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface IntroAnimationProps {
  onDismiss: () => void;
}

// Particle data generated once
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: i % 2 === 0 ? "#00ff88" : "#00d4ff",
  size: 3 + Math.random() * 5,
  orbitRadius: 80 + Math.random() * 120,
  orbitSpeed: 3 + Math.random() * 4,
  startAngle: (i / 20) * 360,
  delay: Math.random() * 2,
  offsetX: (Math.random() - 0.5) * 200,
  offsetY: (Math.random() - 0.5) * 200,
}));

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const nodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 212, 255, 0.35)";
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// Hinglish cinematic script for the voice greeting
const VOICE_SCRIPT =
  "Namaste! Welcome to Annapurna Purity Plant. Thanks for visiting our website. Kripya Enter button par tap karein... aur shuddhta ka anubhav karein.";

export default function IntroAnimation({ onDismiss }: IntroAnimationProps) {
  const [scene, setScene] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(true);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Welcome voice greeting — 3-second delay, male voice, energetic cinematic tone
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const utter = new SpeechSynthesisUtterance(VOICE_SCRIPT);
    utter.rate = 0.92; // slightly slower for cinematic delivery
    utter.pitch = 1.15; // slightly higher for energetic, cinematic feel
    utter.volume = 1; // full volume — loud and clear

    const selectVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();

      // Prefer a male English voice — try common male voice names first
      const maleVoice =
        voices.find((v) =>
          /\b(male|man|guy|david|daniel|james|ryan|mark|george|diego|samantha.*male)\b/i.test(
            v.name,
          ),
        ) ||
        voices.find((v) => /^en/.test(v.lang) && /google/i.test(v.name)) ||
        voices.find((v) => /^en/.test(v.lang) && !v.localService) ||
        voices.find((v) => /^en/.test(v.lang)) ||
        voices[0];

      if (maleVoice) utter.voice = maleVoice;

      // 3-second autoplay delay after page load
      delayTimerRef.current = setTimeout(() => {
        window.speechSynthesis.speak(utter);
      }, 3000);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      selectVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = selectVoiceAndSpeak;
    }

    speechRef.current = utter;

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setScene(1), 1000));
    timers.push(setTimeout(() => setScene(2), 2000));
    timers.push(setTimeout(() => setScene(3), 3500));
    timers.push(setTimeout(() => setScene(4), 4200));
    timers.push(setTimeout(() => setScene(5), 4700));
    // Auto-dismiss after 7s
    timers.push(
      setTimeout(() => {
        setDismissed(true);
      }, 7000),
    );

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  const handleDismiss = () => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    window.speechSynthesis.cancel();
    setDismissed(true);
  };

  const handleExitComplete = () => {
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes orbitParticle {
          from { transform: rotate(var(--start-angle)) translateX(var(--orbit-radius)) rotate(calc(-1 * var(--start-angle))); }
          to { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--start-angle) + 360deg))); }
        }
        @keyframes scanBeam {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes bottleWobble {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          25% { transform: scaleX(1.06) scaleY(0.97); }
          50% { transform: scaleX(0.95) scaleY(1.04); }
          75% { transform: scaleX(1.04) scaleY(0.98); }
        }
        @keyframes bottleFlicker {
          0%, 100% { opacity: 1; }
          30% { opacity: 0.65; }
          60% { opacity: 0.85; }
          80% { opacity: 0.7; }
        }
        @keyframes plantGrow {
          0% { transform: scaleY(0); transform-origin: bottom center; }
          100% { transform: scaleY(1); transform-origin: bottom center; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes plantGlow {
          0%, 100% { filter: drop-shadow(0 0 8px #00ff88) drop-shadow(0 0 16px #00ff8844); }
          50% { filter: drop-shadow(0 0 16px #00ff88) drop-shadow(0 0 32px #00ff8888); }
        }
        @keyframes ctaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0,255,136,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(0,255,136,0.6); }
        }
        @keyframes textGlow {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoReveal {
          0% { opacity: 0; transform: scale(0.8); filter: drop-shadow(0 0 0px gold); }
          100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 24px gold); }
        }
        @keyframes analyzingText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <AnimatePresence onExitComplete={handleExitComplete}>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background:
                scene >= 4
                  ? "radial-gradient(ellipse at center, #020a06, #010506)"
                  : "radial-gradient(ellipse at center, #050f0a, #020809)",
              transition: "background 1s ease",
              overflow: "hidden",
            }}
          >
            <NeuralCanvas />

            <div
              style={{
                position: "absolute",
                width: 500,
                height: 500,
                borderRadius: "50%",
                background:
                  scene >= 3
                    ? "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
                transition: "background 1s ease",
              }}
            />

            {/* ── Scene 0-2: Bottle ── */}
            {scene <= 2 && (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 220,
                  height: 280,
                }}
              >
                {PARTICLES.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      width: p.size,
                      height: p.size,
                      borderRadius: "50%",
                      backgroundColor: p.color,
                      boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}44`,
                      left: "50%",
                      top: "50%",
                      marginLeft: -p.size / 2,
                      marginTop: -p.size / 2,
                      // @ts-ignore CSS custom properties
                      "--start-angle": `${p.startAngle}deg`,
                      "--orbit-radius": `${p.orbitRadius}px`,
                      animation: `orbitParticle ${p.orbitSpeed}s linear infinite`,
                      animationDelay: `${p.delay}s`,
                      opacity: scene === 0 ? 0 : 1,
                      transition: "opacity 1s ease",
                    }}
                  />
                ))}

                <svg
                  role="img"
                  aria-label="Digital bottle animation"
                  width="110"
                  height="220"
                  viewBox="0 0 110 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    opacity: scene === 0 ? 0 : 1,
                    transition: "opacity 1s ease",
                    filter:
                      scene === 1
                        ? "drop-shadow(0 0 12px #00d4ff) drop-shadow(0 0 24px #00d4ff66)"
                        : scene === 2
                          ? "drop-shadow(0 0 14px #00d4ff) drop-shadow(0 0 4px #00ff8844)"
                          : "drop-shadow(0 0 8px #00d4ff44)",
                    animation:
                      scene === 2
                        ? "bottleWobble 0.4s ease-in-out infinite, bottleFlicker 0.6s ease-in-out infinite"
                        : undefined,
                  }}
                >
                  <rect
                    x="38"
                    y="2"
                    width="34"
                    height="18"
                    rx="5"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    fill="rgba(0,212,255,0.08)"
                  />
                  <rect
                    x="36"
                    y="18"
                    width="38"
                    height="30"
                    rx="3"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    fill="rgba(0,212,255,0.06)"
                  />
                  <path
                    d="M36 46 L18 75 L18 78 L92 78 L92 75 L74 46 Z"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    fill="rgba(0,212,255,0.06)"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="16"
                    y="76"
                    width="78"
                    height="130"
                    rx="8"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    fill="rgba(0,212,255,0.05)"
                  />
                  <rect
                    x="18"
                    y="202"
                    width="74"
                    height="14"
                    rx="7"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    fill="rgba(0,212,255,0.1)"
                  />
                  <line
                    x1="30"
                    y1="90"
                    x2="30"
                    y2="195"
                    stroke="rgba(0,212,255,0.2)"
                    strokeWidth="1"
                  />
                  <line
                    x1="80"
                    y1="90"
                    x2="80"
                    y2="195"
                    stroke="rgba(0,212,255,0.12)"
                    strokeWidth="1"
                  />
                  {scene === 1 && (
                    <rect
                      x="16"
                      y="0"
                      width="78"
                      height="4"
                      rx="2"
                      fill="rgba(0,212,255,0.7)"
                      style={{
                        animation: "scanBeam 1s ease-in-out infinite",
                        position: "relative",
                      }}
                    />
                  )}
                </svg>

                {scene === 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "15%",
                      width: "70%",
                      height: "3px",
                      background:
                        "linear-gradient(90deg, transparent, #00d4ff, rgba(0,212,255,0.8), #00d4ff, transparent)",
                      boxShadow: "0 0 12px #00d4ff, 0 0 24px #00d4ff",
                      animation: "scanBeam 1.2s ease-in-out infinite",
                      zIndex: 2,
                    }}
                  />
                )}

                {scene === 2 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: -30,
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "#00d4ff",
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: "11px",
                      letterSpacing: "4px",
                      animation: "analyzingText 0.6s ease-in-out infinite",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ANALYZING...
                  </div>
                )}
              </div>
            )}

            {/* ── Scene 3-4: Plant emerges ── */}
            {scene >= 3 && scene <= 4 && (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  width: 220,
                  height: 280,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      bottom: "25%",
                      left: "50%",
                      width: 60,
                      height: 60,
                      marginLeft: -30,
                      marginBottom: -30,
                      borderRadius: "50%",
                      border: "2px solid #00ff88",
                      animation: "pulseRing 1.2s ease-out infinite",
                      animationDelay: `${i * 0.4}s`,
                      pointerEvents: "none",
                    }}
                  />
                ))}

                <svg
                  role="img"
                  aria-label="Plant growth animation"
                  width="140"
                  height="240"
                  viewBox="0 0 140 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    animation:
                      scene === 3
                        ? "plantGrow 0.7s ease-out forwards, plantGlow 2s ease-in-out infinite"
                        : "plantGlow 2s ease-in-out infinite",
                    filter:
                      "drop-shadow(0 0 10px #00ff88) drop-shadow(0 0 20px #00ff8866)",
                  }}
                >
                  <path
                    d="M70 230 L70 60"
                    stroke="#00ff88"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M70 190 C50 175, 20 170, 15 155 C30 158, 55 165, 70 180"
                    fill="#00ff88"
                    opacity="0.9"
                  />
                  <path
                    d="M70 175 C90 158, 118 153, 125 138 C110 142, 84 150, 70 165"
                    fill="#00ff88"
                    opacity="0.9"
                  />
                  <path
                    d="M70 145 C44 128, 18 122, 12 104 C30 109, 56 120, 70 135"
                    fill="#00ff88"
                    opacity="0.85"
                  />
                  <path
                    d="M70 130 C96 112, 122 105, 128 86 C108 92, 82 107, 70 118"
                    fill="#00ff88"
                    opacity="0.85"
                  />
                  <path
                    d="M70 98 C50 82, 28 76, 22 60 C38 65, 58 78, 70 90"
                    fill="#00ff88"
                    opacity="0.75"
                  />
                  <ellipse
                    cx="70"
                    cy="52"
                    rx="12"
                    ry="16"
                    fill="#00ff88"
                    opacity="0.9"
                  />
                  <ellipse
                    cx="70"
                    cy="48"
                    rx="7"
                    ry="10"
                    fill="#80ffbb"
                    opacity="0.8"
                  />
                </svg>
              </div>
            )}

            {/* ── Scene 5+: Logo + Text + CTA ── */}
            {scene >= 5 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  position: "relative",
                  zIndex: 2,
                  padding: "0 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    opacity: 0.3,
                    animation: "floatUp 3s ease-in-out infinite",
                  }}
                >
                  <svg
                    role="img"
                    aria-label="Plant icon"
                    width="60"
                    height="80"
                    viewBox="0 0 140 240"
                    fill="none"
                    style={{ filter: "drop-shadow(0 0 6px #00ff88)" }}
                  >
                    <path
                      d="M70 230 L70 60"
                      stroke="#00ff88"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M70 190 C50 175, 20 170, 15 155 C30 158, 55 165, 70 180"
                      fill="#00ff88"
                    />
                    <path
                      d="M70 175 C90 158, 118 153, 125 138 C110 142, 84 150, 70 165"
                      fill="#00ff88"
                    />
                    <path
                      d="M70 145 C44 128, 18 122, 12 104 C30 109, 56 120, 70 135"
                      fill="#00ff88"
                    />
                    <ellipse cx="70" cy="52" rx="12" ry="16" fill="#00ff88" />
                  </svg>
                </div>

                <img
                  src="/logo.png"
                  alt="Annapurna Purity"
                  style={{
                    width: "min(160px, 40vw)",
                    borderRadius: 16,
                    animation: "logoReveal 0.6s ease-out forwards",
                  }}
                />

                <h1
                  style={{
                    color: "#ffffff",
                    fontSize: "clamp(16px, 4vw, 26px)",
                    fontWeight: 700,
                    fontFamily:
                      "'Bricolage Grotesque', 'General Sans', sans-serif",
                    letterSpacing: "0.02em",
                    lineHeight: 1.25,
                    textShadow: "0 0 20px #00ff88, 0 0 40px #00ff8844",
                    animation: "textGlow 0.5s ease-out 0.1s both",
                    maxWidth: 400,
                    margin: 0,
                  }}
                >
                  Welcome to the Future of Sustainability
                </h1>

                <p
                  style={{
                    color: "#00d4ff",
                    fontSize: "clamp(10px, 2.5vw, 13px)",
                    letterSpacing: "5px",
                    textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    animation: "textGlow 0.5s ease-out 0.2s both",
                    margin: 0,
                  }}
                >
                  Powered by AI
                </p>

                <button
                  type="button"
                  data-ocid="intro.primary_button"
                  onClick={handleDismiss}
                  style={{
                    marginTop: 8,
                    padding: "14px 36px",
                    borderRadius: 50,
                    background: "rgba(0,0,0,0.6)",
                    border: "2px solid transparent",
                    backgroundClip: "padding-box",
                    color: "#ffffff",
                    fontSize: "clamp(13px, 3vw, 16px)",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    position: "relative",
                    animation:
                      "textGlow 0.5s ease-out 0.3s both, ctaPulse 1.5s ease-in-out 1s infinite",
                    outline: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: -2,
                      borderRadius: 50,
                      background:
                        "linear-gradient(135deg, #00d4ff, #00ff88, #00d4ff)",
                      zIndex: -1,
                    }}
                  />
                  Tap to Enter
                </button>

                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    animation: "textGlow 0.5s ease-out 0.5s both",
                    margin: 0,
                  }}
                >
                  Click anywhere to skip
                </p>
              </div>
            )}

            {scene >= 5 && (
              <div
                role="button"
                tabIndex={0}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  cursor: "pointer",
                }}
                onClick={handleDismiss}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleDismiss();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
