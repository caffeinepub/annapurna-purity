import { Canvas, useFrame } from "@react-three/fiber";
import {
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  LayoutDashboard,
  MapPin,
  Menu,
  Phone,
  QrCode,
  Shield,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
// QR generation via canvas API (no dependency needed)
import { useEffect, useMemo, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import * as THREE from "three";
import IntroAnimation from "./components/IntroAnimation";
import PaymentHistorySection from "./components/PaymentHistorySection";

type Section =
  | "home"
  | "about"
  | "contact"
  | "order"
  | "profile"
  | "upi-pay"
  | "payment-history";

const NAV_LINKS: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "order", label: "Order" },
  { id: "profile", label: "Profile" },
  { id: "upi-pay", label: "UPI Pay" },
  { id: "payment-history", label: "Payment History" },
];

function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50 ${className}`}
    />
  );
}

function GoldAccentLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-0.5 w-16 rounded-full ${className}`}
      style={{ background: "oklch(var(--gold))" }}
    />
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2
        className="text-3xl md:text-4xl font-bold font-display"
        style={{ color: "oklch(var(--gold))" }}
      >
        {children}
      </h2>
      <GoldAccentLine className="mt-3" />
    </div>
  );
}

const inputStyles = {
  background: "#000000",
  border: "1px solid oklch(var(--gold) / 60%)",
  color: "oklch(var(--gold))",
  borderRadius: "8px",
  padding: "12px 16px",
  width: "100%",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

interface GoldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  inputId: string;
}

function GoldInput({ label, inputId, ...props }: GoldInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        style={{
          color: "oklch(var(--gold-muted))",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        style={inputStyles}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "oklch(var(--gold))";
          e.currentTarget.style.boxShadow =
            "0 0 0 2px oklch(var(--gold) / 15%)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "oklch(var(--gold) / 60%)";
          e.currentTarget.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
      />
    </div>
  );
}

function GoldButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  "data-ocid": dataOcid,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  "data-ocid"?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-ocid={dataOcid}
      style={{
        background: disabled
          ? "oklch(var(--gold) / 50%)"
          : "oklch(var(--gold))",
        color: "#0B0B0B",
        border: "none",
        borderRadius: "10px",
        padding: "12px 28px",
        fontSize: "15px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "oklch(var(--gold-hover))";
          e.currentTarget.style.boxShadow = "0 0 16px oklch(var(--gold) / 30%)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "oklch(var(--gold))";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </button>
  );
}

// ── WATER DROPLETS (InstancedMesh) ────────────────────────────────────────────
const DROPLET_COUNT = 16;

function WaterDroplets() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const initialPositions = useMemo(() => {
    return Array.from({ length: DROPLET_COUNT }, () => ({
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 3,
      speed: 0.003 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
      radius: 0.04 + Math.random() * 0.04,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < DROPLET_COUNT; i++) {
      const p = initialPositions[i];
      let currentY = p.y + ((t * p.speed * 50) % 6) - 3;
      if (currentY > 3.5) currentY = -2.5;
      const oscX = p.x + Math.sin(t * 0.8 + p.phase) * 0.08;
      dummy.position.set(oscX, currentY, p.z);
      dummy.scale.setScalar(p.radius * 20);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DROPLET_COUNT]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshPhysicalMaterial
        color="#66bbff"
        transparent
        opacity={0.7}
        roughness={0.05}
        metalness={0.1}
        transmission={0.3}
      />
    </instancedMesh>
  );
}

// ── BOTTLE 3D SCENE — GLASS WATER BOTTLE ─────────────────────────────────────
function BottleScene() {
  const groupRef = useRef<THREE.Group>(null);
  const clockRef = useRef(0);
  const fillRef = useRef(0.05);
  const waterRef = useRef<THREE.Mesh>(null);
  const waterSurfaceRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    clockRef.current += delta;

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
      groupRef.current.position.y = Math.sin(clockRef.current * 1.2) * 0.18;
    }

    // Water fill loop: 0 → 3.2 over ~8s
    fillRef.current += delta * 0.4;
    if (fillRef.current > 3.2) fillRef.current = 0.05;

    const fill = fillRef.current;

    if (waterRef.current) {
      waterRef.current.scale.y = fill;
      waterRef.current.position.y = -1.75 + fill / 2;
    }

    // Water surface sloshing
    if (waterSurfaceRef.current) {
      const topY = -1.75 + fill;
      waterSurfaceRef.current.position.y =
        topY + Math.sin(clockRef.current * 4) * 0.03;
      waterSurfaceRef.current.visible = fill > 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glass bottle body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1.2, 3.5, 64]} />
        <meshPhysicalMaterial
          color="#cceeff"
          transmission={0.95}
          roughness={0.05}
          thickness={0.6}
          ior={1.5}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water inside bottle */}
      <mesh ref={waterRef} position={[0, -1.75, 0]}>
        <cylinderGeometry args={[0.88, 1.08, 1, 64]} />
        <meshPhysicalMaterial
          color="#0077cc"
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.1}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Water surface disc — slosh effect */}
      <mesh
        ref={waterSurfaceRef}
        position={[0, -1.6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.9, 48]} />
        <meshPhysicalMaterial
          color="#33aaff"
          transparent
          opacity={0.5}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Bottle neck */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
        <meshPhysicalMaterial
          color="#cceeff"
          transmission={0.92}
          roughness={0.05}
          thickness={0.3}
          ior={1.5}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Cap — gold */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.4, 64]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </mesh>

      {/* Floating water droplets */}
      <WaterDroplets />
    </group>
  );
}

// ── BOTTLE 3D COMPONENT — WATER THEMED ───────────────────────────────────────
function Bottle3D() {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #001a33 60%, #000a1a)",
      }}
    >
      {/* Soft blue/teal glow orb */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(0,120,255,0.3), transparent)",
          filter: "blur(100px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Brand tagline top */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          width: "100%",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "18px",
            letterSpacing: "6px",
            color: "#cceeff",
            textShadow: "0 0 20px rgba(0,170,255,0.6)",
            fontWeight: 400,
          }}
        >
          Annapurna Purity
        </div>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            color: "rgba(180,220,255,0.7)",
            marginTop: "4px",
            textTransform: "uppercase",
            fontFamily: "'Georgia', serif",
          }}
        >
          PURE • FRESH • NATURAL
        </div>
      </div>

      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 6], fov: 70 }}
        style={{
          background: "transparent",
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Studio lighting setup */}
        <ambientLight intensity={0.4} color="#b3d9ff" />
        {/* Key light */}
        <pointLight position={[4, 6, 5]} intensity={2.0} color="#ffffff" />
        {/* Cyan fill */}
        <pointLight position={[-4, 2, 3]} intensity={1.2} color="#66ccff" />
        {/* Gold rim */}
        <pointLight position={[0, -3, -4]} intensity={0.8} color="#ffd700" />
        {/* Top directional */}
        <directionalLight
          position={[0, 8, 2]}
          intensity={0.6}
          color="#ffffff"
        />
        <BottleScene />
      </Canvas>
    </div>
  );
}

// ── HOME SECTION ──────────────────────────────────────────────────────────────
function HomeSection() {
  return (
    <section
      id="home"
      data-ocid="home.section"
      className="relative min-h-screen flex flex-col justify-center scroll-mt-24"
      style={{ scrollMarginTop: "96px" }}
    >
      {/* Dark radial gradient background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle, #000000, #1a1a1a)",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column: Logo card + text content */}
          <motion.div
            className="flex-1 order-1 flex flex-col items-center lg:items-start"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Glowing logo card */}
            <motion.div
              className="mb-10 text-center"
              style={{
                padding: "30px",
                borderRadius: "20px",
                background: "rgba(0,0,0,0.8)",
                animation: "logoGlow 3s infinite alternate",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img
                src="/assets/generated/annapurna-purity-logo.dim_1000x1000.png"
                alt="Annapurna Purity Logo"
                style={{
                  width: "200px",
                  borderRadius: "16px",
                  boxShadow: "0 0 30px gold",
                  display: "block",
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "26px",
                  color: "gold",
                  letterSpacing: "3px",
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                ANNA PURITY
              </div>
              <div
                style={{
                  color: "#ddd",
                  fontSize: "13px",
                  letterSpacing: "2px",
                  marginTop: "4px",
                }}
              >
                PURITY IN EVERY DROP
              </div>
            </motion.div>

            <p
              className="text-sm font-semibold tracking-[0.25em] uppercase mb-4 text-center lg:text-left"
              style={{ color: "oklch(var(--gold-muted))" }}
            >
              Established in Odisha, India
            </p>

            <p
              className="text-lg md:text-xl leading-relaxed max-w-2xl text-center lg:text-left"
              style={{ color: "oklch(var(--gold-muted))" }}
            >
              We provide high quality plastic bottles with premium design.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <GoldButton
                onClick={() => {
                  document
                    .getElementById("order")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                data-ocid="home.primary_button"
              >
                Place an Order <ChevronRight className="w-4 h-4" />
              </GoldButton>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                data-ocid="home.secondary_button"
                style={{
                  background: "transparent",
                  color: "oklch(var(--gold))",
                  border: "1px solid oklch(var(--gold) / 50%)",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "oklch(var(--gold))";
                  e.currentTarget.style.background = "oklch(var(--gold) / 8%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "oklch(var(--gold) / 50%)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right column: 3D bottle — water glow panel */}
          <motion.div
            className="order-2 w-full lg:w-auto lg:flex-shrink-0"
            style={{
              height: "400px",
              width: "100%",
              maxWidth: "440px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(0,170,255,0.25)",
              boxShadow: "0 0 40px rgba(0,120,255,0.15)",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-full h-full" style={{ height: "400px" }}>
              <Bottle3D />
            </div>
          </motion.div>
        </div>

        {/* Glassmorphism CTA Card */}
        <motion.div
          className="mt-12 w-full flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        >
          <div
            style={{
              backdropFilter: "blur(12px)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "24px 40px",
              textAlign: "center",
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "18px",
                marginBottom: "16px",
                letterSpacing: "0.03em",
              }}
            >
              Stay hydrated in style.
            </p>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document
                  .getElementById("order")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              data-ocid="home.shop_now.button"
              style={{
                background: "white",
                color: "#0B0B0B",
                border: "none",
                borderRadius: "10px",
                padding: "12px 32px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              Shop Now
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Keyframe for logo card glow */}
      <style>{`
        @keyframes logoGlow {
          0% { box-shadow: 0 0 20px rgba(255,215,0,0.3); }
          100% { box-shadow: 0 0 60px rgba(255,215,0,0.8); }
        }
      `}</style>
    </section>
  );
}

// ── ABOUT SECTION ─────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section
      id="about"
      data-ocid="about.section"
      className="py-20 md:py-28 scroll-mt-24"
      style={{ scrollMarginTop: "96px" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeading>About Us</SectionHeading>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p
                className="text-base md:text-lg leading-relaxed mb-6"
                style={{ color: "oklch(var(--gold-muted))" }}
              >
                Annapurna Purity is a trusted bottle manufacturing company
                located in Odisha. We specialize in high-quality plastic bottles
                with modern technology, ensuring strength, safety and purity in
                every product.
              </p>
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: "oklch(var(--gold-muted))" }}
              >
                Our manufacturing facility uses state-of-the-art equipment to
                produce bottles of varying sizes and specifications, serving
                businesses across Odisha and beyond.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100%", label: "Pure Materials" },
                { value: "10+", label: "Years of Experience" },
                { value: "500+", label: "Happy Clients" },
                { value: "ISO", label: "Certified Quality" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg p-5 text-center"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--gold) / 25%)",
                  }}
                >
                  <div
                    className="text-3xl font-bold font-display mb-1"
                    style={{ color: "oklch(var(--gold))" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs tracking-wider uppercase"
                    style={{ color: "oklch(var(--gold-muted))" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── CONTACT SECTION ───────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section
      id="contact"
      data-ocid="contact.section"
      className="py-20 md:py-28 scroll-mt-24"
      style={{ scrollMarginTop: "96px" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeading>Contact Us</SectionHeading>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact details */}
            <div className="space-y-6">
              <div>
                <h3
                  className="text-xs tracking-[0.2em] uppercase font-semibold mb-3"
                  style={{ color: "oklch(var(--gold-muted))" }}
                >
                  Phone Numbers
                </h3>
                <div className="space-y-3">
                  {["7504816753", "7008918847"].map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone}`}
                      data-ocid="contact.link"
                      className="flex items-center gap-3 group"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "oklch(var(--gold) / 10%)",
                          border: "1px solid oklch(var(--gold) / 30%)",
                        }}
                      >
                        <Phone
                          className="w-4 h-4"
                          style={{ color: "oklch(var(--gold))" }}
                        />
                      </div>
                      <span
                        className="text-xl font-semibold transition-colors duration-200 group-hover:opacity-80"
                        style={{ color: "oklch(var(--gold))" }}
                      >
                        {phone}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3
                  className="text-xs tracking-[0.2em] uppercase font-semibold mb-3"
                  style={{ color: "oklch(var(--gold-muted))" }}
                >
                  Factory Address
                </h3>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: "oklch(var(--gold) / 10%)",
                      border: "1px solid oklch(var(--gold) / 30%)",
                    }}
                  >
                    <MapPin
                      className="w-4 h-4"
                      style={{ color: "oklch(var(--gold))" }}
                    />
                  </div>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "oklch(var(--gold-muted))" }}
                  >
                    Annapurna Purity Bottle Factory,
                    <br />
                    Industrial Area, Odisha,
                    <br />
                    India - 756001
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  background: "oklch(var(--gold) / 5%)",
                  border: "1px solid oklch(var(--gold) / 20%)",
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(var(--gold-muted))" }}
                >
                  For bulk orders or factory visits, please call us during
                  business hours:{" "}
                  <strong style={{ color: "oklch(var(--gold))" }}>
                    Mon–Sat, 9AM–6PM
                  </strong>
                </p>
              </div>
            </div>

            {/* Map embed */}
            <div>
              <h3
                className="text-xs tracking-[0.2em] uppercase font-semibold mb-3"
                style={{ color: "oklch(var(--gold-muted))" }}
              >
                Our Location
              </h3>
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid oklch(var(--gold) / 40%)" }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742067.5756089235!2d82.19038!3d20.940920!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909d2d5170aa5%3A0xfc580e2b68b33fa8!2sOdisha!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="380"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Odisha Map"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── ORDER SECTION ─────────────────────────────────────────────────────────────
function OrderSection() {
  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    productName?: string;
    quantity?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!productName.trim()) newErrors.productName = "Product name is required";
    if (!quantity.trim()) newErrors.quantity = "Quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const message = `Hello Annapurna Purity,%0AName: ${encodeURIComponent(name)}%0AProduct: ${encodeURIComponent(productName)}%0AQuantity: ${encodeURIComponent(quantity)}%0APlease confirm my order.`;
    const url = `https://wa.me/917504816753?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="order"
      data-ocid="order.section"
      className="py-20 md:py-28 scroll-mt-24"
      style={{ scrollMarginTop: "96px", background: "oklch(0.07 0 0)" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeading>Place an Order</SectionHeading>

          <div className="max-w-xl">
            <p
              className="text-base mb-8"
              style={{ color: "oklch(var(--gold-muted))" }}
            >
              Fill in the details below and send us your order directly via
              WhatsApp. We respond within hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <GoldInput
                  label="Your Name"
                  inputId="order-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Enter your full name"
                  data-ocid="order.input"
                  autoComplete="name"
                />
                {errors.name && (
                  <p
                    data-ocid="order.error_state"
                    className="text-sm mt-1"
                    style={{ color: "#e05a5a" }}
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <GoldInput
                  label="Product Name"
                  inputId="order-product"
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setErrors((p) => ({ ...p, productName: undefined }));
                  }}
                  placeholder="e.g. 500ml PET bottle, 1L HDPE bottle"
                  data-ocid="order.input"
                  autoComplete="off"
                />
                {errors.productName && (
                  <p
                    data-ocid="order.error_state"
                    className="text-sm mt-1"
                    style={{ color: "#e05a5a" }}
                  >
                    {errors.productName}
                  </p>
                )}
              </div>

              <div>
                <GoldInput
                  label="Quantity"
                  inputId="order-quantity"
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setErrors((p) => ({ ...p, quantity: undefined }));
                  }}
                  placeholder="e.g. 500 units, 1000 pieces"
                  data-ocid="order.input"
                  autoComplete="off"
                />
                {errors.quantity && (
                  <p
                    data-ocid="order.error_state"
                    className="text-sm mt-1"
                    style={{ color: "#e05a5a" }}
                  >
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <GoldButton type="submit" data-ocid="order.submit_button">
                  <SiWhatsapp className="w-4 h-4" />
                  Send Order via WhatsApp
                </GoldButton>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── PROFILE SECTION ───────────────────────────────────────────────────────────
function ProfileSection() {
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setProfileName(localStorage.getItem("profile_name") ?? "");
    setProfilePhone(localStorage.getItem("profile_phone") ?? "");
    setProfileAddress(localStorage.getItem("profile_address") ?? "");
  }, []);

  const handleSave = () => {
    localStorage.setItem("profile_name", profileName);
    localStorage.setItem("profile_phone", profilePhone);
    localStorage.setItem("profile_address", profileAddress);
    setSaved(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section
      id="profile"
      data-ocid="profile.section"
      className="py-20 md:py-28 scroll-mt-24"
      style={{ scrollMarginTop: "96px" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeading>My Profile</SectionHeading>

          <div className="max-w-xl">
            <p
              className="text-base mb-8"
              style={{ color: "oklch(var(--gold-muted))" }}
            >
              Save your details for faster ordering. Your information stays on
              your device.
            </p>

            <div className="space-y-5">
              <GoldInput
                label="Full Name"
                inputId="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your full name"
                data-ocid="profile.input"
                autoComplete="name"
              />

              <GoldInput
                label="Phone Number"
                inputId="profile-phone"
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="Your phone number"
                data-ocid="profile.input"
                autoComplete="tel"
              />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="profile-address"
                  style={{
                    color: "oklch(var(--gold-muted))",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Address
                </label>
                <textarea
                  id="profile-address"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Your delivery address"
                  rows={3}
                  data-ocid="profile.textarea"
                  style={{
                    ...inputStyles,
                    resize: "vertical",
                    minHeight: "90px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "oklch(var(--gold))";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px oklch(var(--gold) / 15%)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "oklch(var(--gold) / 60%)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div className="pt-2">
                <GoldButton
                  onClick={handleSave}
                  data-ocid="profile.save_button"
                >
                  Save Profile
                </GoldButton>
              </div>

              <AnimatePresence>
                {saved && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    data-ocid="profile.success_state"
                    className="text-sm font-semibold"
                    style={{ color: "oklch(var(--gold))" }}
                  >
                    ✓ Profile saved successfully!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── UPI QR CODE SECTION ───────────────────────────────────────────────────────
function UPIQRSection() {
  const [upiId, setUpiId] = useState("");
  const [holderName, setHolderName] = useState("");
  const [txnNote, setTxnNote] = useState("");
  const [amount, setAmount] = useState("");
  const [upiUri, setUpiUri] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ upiId?: string; holderName?: string }>(
    {},
  );
  const qrRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    } else if (!upiId.includes("@")) {
      newErrors.upiId = "UPI ID must contain @ (e.g. yourname@upi)";
    }
    if (!holderName.trim()) {
      newErrors.holderName = "Account holder name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;

    let uri = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(holderName.trim())}&cu=INR`;
    if (amount.trim()) {
      uri += `&am=${encodeURIComponent(amount.trim())}`;
    }
    if (txnNote.trim()) {
      uri += `&tn=${encodeURIComponent(txnNote.trim())}`;
    }
    setUpiUri(uri);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiUri).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownload = () => {
    if (!upiUri) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUri)}&bgcolor=ffffff&color=1a1a1a&margin=10`;
    const link = document.createElement("a");
    link.download = "annapurna-purity-upi-qr.png";
    link.href = url;
    link.target = "_blank";
    link.click();
  };

  const securityTips = [
    "Never share your OTP or UPI PIN with anyone",
    "Use only verified UPI apps — GPay, PhonePe, Paytm, or BHIM",
    "Enable SMS and email alerts for every transaction",
  ];

  return (
    <section
      id="upi-pay"
      data-ocid="upi-pay.section"
      className="py-20 md:py-28 scroll-mt-24"
      style={{ scrollMarginTop: "96px", background: "oklch(0.07 0 0)" }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeading>UPI Payment QR Code</SectionHeading>

          <p
            className="text-base mb-8 max-w-xl"
            style={{ color: "oklch(var(--gold-muted))" }}
          >
            Generate a scannable UPI QR code so buyers can pay you instantly via
            PhonePe, Google Pay, Paytm, or BHIM.
          </p>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* ── Left: Form ── */}
            <div className="space-y-5">
              <div>
                <GoldInput
                  label="UPI ID *"
                  inputId="upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setErrors((p) => ({ ...p, upiId: undefined }));
                  }}
                  placeholder="yourname@upi"
                  data-ocid="upi-pay.input"
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.upiId && (
                  <p
                    data-ocid="upi-pay.error_state"
                    className="text-sm mt-1"
                    style={{ color: "#e05a5a" }}
                  >
                    {errors.upiId}
                  </p>
                )}
              </div>

              <div>
                <GoldInput
                  label="Account Holder Name *"
                  inputId="upi-holder-name"
                  type="text"
                  value={holderName}
                  onChange={(e) => {
                    setHolderName(e.target.value);
                    setErrors((p) => ({ ...p, holderName: undefined }));
                  }}
                  placeholder="Full name as registered"
                  data-ocid="upi-pay.input"
                  autoComplete="name"
                />
                {errors.holderName && (
                  <p
                    data-ocid="upi-pay.error_state"
                    className="text-sm mt-1"
                    style={{ color: "#e05a5a" }}
                  >
                    {errors.holderName}
                  </p>
                )}
              </div>

              <GoldInput
                label="Transaction Note (optional)"
                inputId="upi-txn-note"
                type="text"
                value={txnNote}
                onChange={(e) => setTxnNote(e.target.value)}
                placeholder="e.g. Payment for Order"
                data-ocid="upi-pay.input"
                autoComplete="off"
              />

              <GoldInput
                label="Amount in INR (optional — leave blank for flexible)"
                inputId="upi-amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                data-ocid="upi-pay.input"
                autoComplete="off"
              />

              <div className="pt-2">
                <GoldButton
                  onClick={handleGenerate}
                  data-ocid="upi-pay.primary_button"
                >
                  <QrCode className="w-4 h-4" />
                  Generate QR Code
                </GoldButton>
              </div>
            </div>

            {/* ── Right: QR Output ── */}
            <div className="flex flex-col items-center gap-6">
              {upiUri ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={upiUri}
                    className="flex flex-col items-center gap-6 w-full"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {/* QR Canvas */}
                    <div
                      ref={qrRef}
                      className="rounded-2xl p-4"
                      style={{
                        background: "#ffffff",
                        boxShadow: "0 0 32px oklch(var(--gold) / 25%)",
                        border: "2px solid oklch(var(--gold) / 50%)",
                      }}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}&bgcolor=ffffff&color=1a1a1a&margin=8`}
                        alt="UPI Payment QR Code"
                        width={240}
                        height={240}
                        style={{ display: "block" }}
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Payee info badge */}
                    <div
                      className="text-center rounded-lg px-5 py-3 w-full"
                      style={{
                        background: "oklch(var(--gold) / 6%)",
                        border: "1px solid oklch(var(--gold) / 25%)",
                      }}
                    >
                      <p
                        className="text-xs tracking-[0.15em] uppercase mb-1"
                        style={{ color: "oklch(var(--gold-muted))" }}
                      >
                        Pay to
                      </p>
                      <p
                        className="text-lg font-bold tracking-wide"
                        style={{ color: "oklch(var(--gold))" }}
                      >
                        {holderName}
                      </p>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: "oklch(var(--gold-muted))" }}
                      >
                        {upiId}
                      </p>
                      {amount && (
                        <p
                          className="text-base font-semibold mt-1"
                          style={{ color: "oklch(var(--gold))" }}
                        >
                          ₹{amount}
                        </p>
                      )}
                    </div>

                    {/* UPI URI code block */}
                    <div
                      className="w-full rounded-lg p-4"
                      style={{
                        background: "#0d0d0d",
                        border: "1px solid oklch(var(--gold) / 20%)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs uppercase tracking-widest font-semibold"
                          style={{ color: "oklch(var(--gold-muted))" }}
                        >
                          UPI URI
                        </span>
                        <button
                          type="button"
                          onClick={handleCopy}
                          data-ocid="upi-pay.secondary_button"
                          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all duration-200"
                          style={{
                            background: copied
                              ? "oklch(var(--gold) / 20%)"
                              : "oklch(var(--gold) / 8%)",
                            border: "1px solid oklch(var(--gold) / 30%)",
                            color: "oklch(var(--gold))",
                            cursor: "pointer",
                          }}
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <code
                        className="block text-xs leading-relaxed break-all"
                        style={{ color: "oklch(var(--gold) / 80%)" }}
                      >
                        {upiUri}
                      </code>
                    </div>

                    {/* Download button */}
                    <GoldButton
                      onClick={handleDownload}
                      data-ocid="upi-pay.download_button"
                    >
                      <Download className="w-4 h-4" />
                      Download QR as PNG
                    </GoldButton>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div
                  data-ocid="upi-pay.empty_state"
                  className="flex flex-col items-center justify-center gap-4 rounded-2xl w-full"
                  style={{
                    minHeight: "300px",
                    border: "1px dashed oklch(var(--gold) / 25%)",
                    background: "oklch(var(--gold) / 3%)",
                  }}
                >
                  <QrCode
                    className="w-16 h-16 opacity-25"
                    style={{ color: "oklch(var(--gold))" }}
                  />
                  <p
                    className="text-sm text-center px-6"
                    style={{ color: "oklch(var(--gold-muted))" }}
                  >
                    Fill in your UPI details on the left and click{" "}
                    <span style={{ color: "oklch(var(--gold))" }}>
                      Generate QR Code
                    </span>{" "}
                    to create your payment QR.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Security Tips ── */}
          <div
            className="mt-10 rounded-xl p-6"
            style={{
              background: "oklch(var(--gold) / 4%)",
              border: "1px solid oklch(var(--gold) / 18%)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "oklch(var(--gold))" }}
              />
              <h3
                className="text-xs tracking-[0.2em] uppercase font-bold"
                style={{ color: "oklch(var(--gold))" }}
              >
                Security Tips
              </h3>
            </div>
            <ul className="space-y-2">
              {securityTips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2.5 text-sm"
                  style={{ color: "oklch(var(--gold-muted))" }}
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "oklch(var(--gold))" }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({
  isOpen,
  onClose,
  activeSection,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeSection: Section;
}) {
  const scrollTo = (id: Section) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const sectionIcons: Record<Section, string> = {
    home: "🏠",
    about: "ℹ️",
    contact: "📞",
    order: "🛒",
    profile: "👤",
    "upi-pay": "📱",
    "payment-history": "💳",
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            data-ocid="nav.modal"
            className="fixed inset-0 z-[60]"
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Slide-in panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 z-[70] flex flex-col"
            data-ocid="nav.sheet"
            style={{
              width: "280px",
              background: "#0a0a0a",
              borderRight: "1px solid oklch(var(--gold) / 25%)",
              boxShadow: "8px 0 40px rgba(0,0,0,0.7)",
            }}
            aria-label="Navigation sidebar"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid oklch(var(--gold) / 15%)" }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/assets/generated/annapurna-purity-logo.dim_1000x1000.png"
                  alt="Logo"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "7px",
                    boxShadow: "0 0 8px rgba(255,215,0,0.45)",
                  }}
                />
                <div>
                  <div
                    className="text-sm font-bold tracking-widest uppercase leading-tight"
                    style={{ color: "oklch(var(--gold))" }}
                  >
                    ANNA PURITY
                  </div>
                  <div
                    className="text-xs tracking-wider uppercase"
                    style={{ color: "oklch(var(--gold-muted))" }}
                  >
                    Navigation
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-ocid="nav.close_button"
                aria-label="Close sidebar"
                className="p-1.5 rounded transition-all duration-200"
                style={{
                  background: "none",
                  border: "1px solid oklch(var(--gold) / 25%)",
                  color: "oklch(var(--gold))",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "oklch(var(--gold) / 10%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav
              className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
              aria-label="Sidebar navigation"
            >
              {NAV_LINKS.map((link, idx) => {
                const isActive = activeSection === link.id;
                const isPaymentHistory = link.id === "payment-history";
                return (
                  <motion.button
                    key={link.id}
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    data-ocid={`nav.sidebar.${link.id}.link`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 + 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-200"
                    style={{
                      background: isActive
                        ? "oklch(var(--gold) / 12%)"
                        : "transparent",
                      border: isActive
                        ? "1px solid oklch(var(--gold) / 30%)"
                        : "1px solid transparent",
                      color: isActive
                        ? "oklch(var(--gold-bright))"
                        : "oklch(var(--gold))",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background =
                          "oklch(var(--gold) / 6%)";
                        e.currentTarget.style.borderColor =
                          "oklch(var(--gold) / 20%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                  >
                    <span
                      className="text-base flex-shrink-0"
                      aria-hidden="true"
                    >
                      {sectionIcons[link.id]}
                    </span>
                    <span className="text-sm font-semibold tracking-wide flex-1">
                      {link.label}
                    </span>
                    {isPaymentHistory && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold tracking-wider flex-shrink-0"
                        style={{
                          background: "oklch(0.48 0.14 148 / 20%)",
                          color: "oklch(0.75 0.14 148)",
                          border: "1px solid oklch(0.6 0.14 148 / 30%)",
                          fontSize: "10px",
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-dot"
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "oklch(var(--gold))" }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              className="px-5 py-4 flex-shrink-0"
              style={{ borderTop: "1px solid oklch(var(--gold) / 15%)" }}
            >
              <div className="flex items-center gap-2">
                <CreditCard
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "oklch(var(--gold) / 50%)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "oklch(var(--gold) / 40%)" }}
                >
                  Payment History is admin-protected
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ── HEADER / NAV ──────────────────────────────────────────────────────────────
function Header({
  activeSection,
  onSidebarOpen,
}: { activeSection: Section; onSidebarOpen: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: Section) => {
    setMobileOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(11,11,11,0.97)" : "rgba(11,11,11,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid oklch(var(--gold) / 20%)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Title row */}
        <div className="flex items-center justify-between py-4">
          <button
            type="button"
            onClick={() => scrollTo("home")}
            data-ocid="nav.link"
            className="flex items-center gap-3 text-left group"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <img
              src="/assets/generated/annapurna-purity-logo.dim_1000x1000.png"
              alt="Logo"
              className="object-contain"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(255,215,0,0.5)",
              }}
            />
            <div>
              <div
                className="text-base md:text-xl font-bold tracking-widest uppercase leading-tight"
                style={{ color: "oklch(var(--gold))" }}
              >
                ANNA PURITY
              </div>
              <div
                className="text-xs tracking-[0.2em] uppercase"
                style={{ color: "oklch(var(--gold-muted))" }}
              >
                Bottle Factory
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                data-ocid={`nav.${link.id}.link`}
                className="relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-200 rounded"
                style={{
                  color:
                    activeSection === link.id
                      ? "oklch(var(--gold-bright))"
                      : "oklch(var(--gold))",
                  background:
                    activeSection === link.id
                      ? "oklch(var(--gold) / 10%)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== link.id) {
                    e.currentTarget.style.color = "oklch(var(--gold-bright))";
                    e.currentTarget.style.background =
                      "oklch(var(--gold) / 6%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== link.id) {
                    e.currentTarget.style.color = "oklch(var(--gold))";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                    style={{ background: "oklch(var(--gold))" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar toggle — always visible */}
          <button
            type="button"
            onClick={onSidebarOpen}
            data-ocid="nav.open_modal_button"
            aria-label="Open navigation sidebar"
            className="p-2 rounded transition-all duration-200"
            style={{
              color: "oklch(var(--gold))",
              background: "none",
              border: "1px solid oklch(var(--gold) / 25%)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "oklch(var(--gold) / 8%)";
              e.currentTarget.style.borderColor = "oklch(var(--gold) / 60%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "oklch(var(--gold) / 25%)";
            }}
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded ml-1"
            onClick={() => setMobileOpen((p) => !p)}
            data-ocid="nav.toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            style={{
              color: "oklch(var(--gold))",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            style={{
              background: "rgba(11,11,11,0.98)",
              borderTop: "1px solid oklch(var(--gold) / 15%)",
            }}
            data-ocid="nav.panel"
          >
            <nav
              className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollTo(link.id)}
                  data-ocid={`nav.mobile.${link.id}.link`}
                  className="flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold uppercase tracking-widest w-full text-left"
                  style={{
                    color:
                      activeSection === link.id
                        ? "oklch(var(--gold-bright))"
                        : "oklch(var(--gold))",
                    background:
                      activeSection === link.id
                        ? "oklch(var(--gold) / 10%)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRight
                    className="w-3 h-3 flex-shrink-0"
                    style={{
                      color:
                        activeSection === link.id
                          ? "oklch(var(--gold))"
                          : "oklch(var(--gold-muted))",
                    }}
                  />
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [showIntro, setShowIntro] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const sectionIds: Section[] = [
      "home",
      "about",
      "contact",
      "order",
      "profile",
      "upi-pay",
      "payment-history",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id as Section);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "#0B0B0B", color: "oklch(var(--gold))" }}
    >
      {showIntro && <IntroAnimation onDismiss={() => setShowIntro(false)} />}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
      />
      <Header
        activeSection={activeSection}
        onSidebarOpen={() => setSidebarOpen(true)}
      />

      <main>
        <HomeSection />
        <GoldDivider />
        <AboutSection />
        <GoldDivider />
        <ContactSection />
        <GoldDivider />
        <OrderSection />
        <GoldDivider />
        <ProfileSection />
        <GoldDivider />
        <UPIQRSection />
        <GoldDivider />
        <PaymentHistorySection />
      </main>

      <footer
        style={{
          borderTop: "1px solid oklch(var(--gold) / 20%)",
          background: "#000",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-sm text-center md:text-left"
            style={{ color: "oklch(var(--gold-muted))" }}
          >
            © {new Date().getFullYear()} Annapurna Purity. All Rights Reserved.
          </p>
          <p className="text-sm" style={{ color: "oklch(var(--gold) / 50%)" }}>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              style={{ color: "oklch(var(--gold-muted))" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
