import { ChevronRight, MapPin, Menu, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

type Section = "home" | "about" | "contact" | "order" | "profile";

const NAV_LINKS: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "order", label: "Order" },
  { id: "profile", label: "Profile" },
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

// ── HOME SECTION ──────────────────────────────────────────────────────────────
function HomeSection() {
  return (
    <section
      id="home"
      data-ocid="home.section"
      className="relative min-h-screen flex flex-col justify-center scroll-mt-24"
      style={{ scrollMarginTop: "96px" }}
    >
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/assets/generated/hero-annapurna-bg.dim_1200x600.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,11,11,0.55) 0%, rgba(11,11,11,0.75) 60%, rgba(11,11,11,1) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Logo icon */}
          <div className="mb-8">
            <img
              src="/assets/generated/annapurna-logo-icon-transparent.dim_120x120.png"
              alt="Annapurna Purity Logo"
              className="w-20 h-20 object-contain"
            />
          </div>

          <p
            className="text-sm font-semibold tracking-[0.25em] uppercase mb-4"
            style={{ color: "oklch(var(--gold-muted))" }}
          >
            Established in Odisha, India
          </p>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-4"
            style={{ color: "oklch(var(--gold))" }}
          >
            Welcome to
            <br />
            <span style={{ color: "oklch(var(--gold-bright))" }}>
              Annapurna Purity
            </span>
          </h1>

          <p
            className="text-2xl md:text-3xl font-display italic mb-6"
            style={{ color: "oklch(var(--gold-muted))" }}
          >
            Purity in Every Drop
          </p>

          <GoldDivider className="mb-6 max-w-xs" />

          <p
            className="text-lg md:text-xl leading-relaxed max-w-2xl"
            style={{ color: "oklch(var(--gold-muted))" }}
          >
            We provide high quality plastic bottles with premium design.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
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
                e.currentTarget.style.borderColor = "oklch(var(--gold) / 50%)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
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

// ── HEADER / NAV ──────────────────────────────────────────────────────────────
function Header({ activeSection }: { activeSection: Section }) {
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
              src="/assets/generated/annapurna-logo-icon-transparent.dim_120x120.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
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

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded"
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

  useEffect(() => {
    const sectionIds: Section[] = [
      "home",
      "about",
      "contact",
      "order",
      "profile",
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
      <Header activeSection={activeSection} />

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
