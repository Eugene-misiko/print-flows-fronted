import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Layers, Menu, X, ChevronDown, User,
  ShoppingCart, Star, CheckCircle2, TrendingUp, Users,
  Printer
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";


const steps = [
  {
    num: "01",
    title: "Choose Your Product",
    desc: "Browse our full catalog — business cards, banners, flyers, packaging and more. Every format, every size.",
    icon: Layers,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200/60 dark:border-blue-800/40",
  },
  {
    num: "02",
    title: "Customize & Upload",
    desc: "Upload your design or work with our in-house team. Preview exactly what you'll get before paying.",
    icon: Printer,
    color: "from-[#c2410c] to-[#ea580c]",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200/60 dark:border-orange-800/40",
  },
  {
    num: "03",
    title: "Fast Delivery",
    desc: "Your prints are produced with care and shipped straight to your door — on time, every time.",
    icon: ShoppingCart,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
  },
];

const features = [
  {
    icon: Printer,
    title: "Professional Printing",
    desc: "State-of-the-art equipment ensures sharp, vibrant prints on every material.",
    highlight: "Premium quality",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    desc: "From startups to enterprises — our printing solutions scale with your needs.",
    highlight: "Scale effortlessly",
  },
  {
    icon: Users,
    title: "Built for Teams",
    desc: "Collaborate on designs, manage approvals, and consolidate ordering for your whole org.",
    highlight: "Team workflows",
  },
  {
    icon: CheckCircle2,
    title: "Satisfaction Guaranteed",
    desc: "Every order is backed by our quality promise. Not happy? We'll reprint it free.",
    highlight: "Zero risk",
  },
];

const navLinks = [
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "Business Cards", href: "/products/business-cards" },
      { label: "Banners & Signage", href: "/products/banners" },
      { label: "Flyers & Brochures", href: "/products/flyers" },
      { label: "Packaging", href: "/products/packaging" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});

  const dropdownTimeout = useRef(null);
  const sectionRefs = useRef({});

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver for section reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleDropdownEnter = (label) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const handleNavClick = (href) => {
    setMobileOpen(false);
    setActiveDropdown(null);
    navigate(href);
  };

  const setSectionRef = (id) => (el) => { sectionRefs.current[id] = el; };
  const isVisible = (id) => !!visibleSections[id];

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col relative overflow-x-hidden transition-colors duration-300">

      {/* ─── NAV ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#faf9f6]/85 dark:bg-stone-950/85 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[68px]">

            {/* Logo */}
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-md shadow-orange-600/20 group-hover:shadow-lg group-hover:shadow-orange-600/30 transition-shadow duration-300">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-[#1c1917] dark:text-stone-100 tracking-tight">
                Print<span className="text-[#c2410c]">Flow</span>
              </span>
            </button>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative" onMouseEnter={() => handleDropdownEnter(link.label)} onMouseLeave={handleDropdownLeave}>
                    <button className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold text-stone-600 dark:text-stone-300 hover:text-[#1c1917] dark:hover:text-stone-100 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-800/70 transition-all duration-200">
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-1.5 w-52 py-1.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/70 dark:border-stone-700/70 shadow-xl shadow-stone-200/30 dark:shadow-stone-900/40">
                        {link.children.map((child) => (
                          <button key={child.label} onClick={() => handleNavClick(child.href)} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-stone-600 dark:text-stone-300 hover:text-[#c2410c] dark:hover:text-[#ea580c] hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/5 transition-colors duration-150">
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button key={link.label} onClick={() => handleNavClick(link.href)} className="px-3.5 py-2 text-[13.5px] font-semibold text-stone-600 dark:text-stone-300 hover:text-[#1c1917] dark:hover:text-stone-100 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-800/70 transition-all duration-200">
                    {link.label}
                  </button>
                )
              )}
            </div>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <div className="w-px h-5 bg-stone-200/60 dark:bg-stone-700/50" />
              <button onClick={() => handleNavClick("/login")} className="flex items-center gap-2 px-4 py-2 text-[13.5px] font-semibold text-stone-600 dark:text-stone-300 hover:text-[#1c1917] dark:hover:text-stone-100 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-800/70 transition-all duration-200">
                <User className="w-4 h-4" />
                Sign In
              </button>
              <button onClick={() => handleNavClick("/register")} className="flex items-center gap-1.5 px-5 py-2.5 text-[13.5px] font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-xl hover:from-[#a3360a] hover:to-[#c2410c] shadow-md shadow-orange-600/20 hover:shadow-lg hover:shadow-orange-600/30 active:scale-[0.97] transition-all duration-200">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 rounded-lg transition-colors duration-200">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full inset-x-0 bg-[#faf9f6] dark:bg-stone-950 border-b border-stone-200/50 dark:border-stone-800/50 shadow-xl">
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 rounded-xl transition-colors">
                      {link.label}
                      <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${activeDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="pl-4 pb-1 space-y-0.5">
                        {link.children.map((child) => (
                          <button key={child.label} onClick={() => handleNavClick(child.href)} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-stone-500 dark:text-stone-400 hover:text-[#c2410c] hover:bg-[#fff7ed] dark:hover:bg-[#c2410c]/5 rounded-lg transition-colors">
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button key={link.label} onClick={() => handleNavClick(link.href)} className="w-full text-left px-4 py-3 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 rounded-xl transition-colors">
                    {link.label}
                  </button>
                )
              )}
              <div className="pt-3 mt-2 border-t border-stone-200/60 dark:border-stone-800/60 space-y-2">
                <button onClick={() => handleNavClick("/login")} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl hover:bg-stone-200/80 transition-colors">
                  <User className="w-4 h-4" /> Sign In
                </button>
                <button onClick={() => handleNavClick("/register")} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-xl shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-[15%] -left-[10%] w-[700px] h-[700px] rounded-full bg-[#c2410c]/10 dark:bg-[#c2410c]/5 blur-[140px] lp-fl-a" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#92400e]/8 dark:bg-[#92400e]/4 blur-[120px] lp-fl-b" />
          <div className="absolute top-[30%] left-[60%] w-[400px] h-[400px] rounded-full bg-[#fbbf24]/5 dark:bg-[#fbbf24]/[0.02] blur-[90px] lp-fl-c" />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(28,25,23,.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        {/* Floating decorative shapes */}
        <div className="lp-float absolute top-32 right-[10%] opacity-30 dark:opacity-15 pointer-events-none hidden lg:block">
          <div className="w-16 h-16 rounded-2xl border-2 border-[#c2410c]/20 rotate-12" />
        </div>
        <div className="lp-float-d absolute top-48 left-[8%] opacity-20 dark:opacity-10 pointer-events-none hidden lg:block">
          <div className="w-10 h-10 rounded-full border-2 border-[#f97316]/20" />
        </div>
        <div className="lp-float absolute bottom-20 right-[15%] opacity-25 dark:opacity-12 pointer-events-none hidden lg:block">
          <div className="w-8 h-8 rounded-lg bg-[#c2410c]/10 rotate-45" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="lp-su inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-stone-200/60 dark:border-stone-700/60 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="lp-pulse absolute inline-flex h-full w-full rounded-full bg-[#c2410c] opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c2410c]" />
            </span>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Professional printing, delivered fast</span>
          </div>

          {/* Headline */}
          <h1 className="lp-su text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#1c1917] dark:text-stone-100 leading-[1.06] tracking-tight" style={{ animationDelay: ".08s" }}>
            Your prints,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316] lp-shimmer">
              done right.
            </span>
          </h1>

          <p className="lp-su mt-6 text-stone-500 dark:text-stone-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ animationDelay: ".16s" }}>
            The all-in-one platform to customize designs and get premium printed products delivered straight to your door.
          </p>

          {/* CTA buttons */}
          <div className="lp-su mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5" style={{ animationDelay: ".24s" }}>
            <button onClick={() => handleNavClick("/register")} className="group relative flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] rounded-2xl shadow-xl shadow-orange-600/25 hover:shadow-2xl hover:shadow-orange-600/35 active:scale-[0.97] transition-all duration-300">
              Start Ordering Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
            <button onClick={() => handleNavClick("/products")} className="flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-stone-200/70 dark:border-stone-700/60 rounded-2xl hover:bg-white dark:hover:bg-stone-800 hover:border-stone-300/70 shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-300">
              View Products
            </button>
          </div>

          <p className="lp-su mt-5 text-xs text-stone-400 dark:text-stone-500" style={{ animationDelay: ".32s" }}>
            No credit card required · Free to browse · Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section ref={setSectionRef("how")} id="how" className="relative z-10 px-4 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible("how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block text-[11px] font-bold tracking-widest text-[#c2410c] uppercase mb-3">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1c1917] dark:text-stone-100 tracking-tight">
              Three steps to<br className="sm:hidden" /> perfect prints
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <div key={step.num}
                className={`group relative rounded-2xl p-6 sm:p-7 border transition-all duration-700 ${step.bg} ${step.border} hover:shadow-xl hover:shadow-stone-200/20 dark:hover:shadow-stone-900/30 hover:scale-[1.02] cursor-default`}
                style={{
                  transitionDelay: isVisible("how") ? `${i * 120}ms` : "0ms",
                  opacity: isVisible("how") ? 1 : 0,
                  transform: isVisible("how") ? "translateY(0)" : "translateY(24px)",
                }}
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-2.5 w-5 z-10 pointer-events-none">
                    <div className="w-full h-px border-t border-dashed border-stone-300/50 dark:border-stone-600/40" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-4xl font-black text-stone-200/70 dark:text-stone-700/50">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1c1917] dark:text-stone-100 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section ref={setSectionRef("features")} id="features" className="relative z-10 px-4 pb-16 sm:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#c2410c]/5 dark:bg-[#c2410c]/[0.02] blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block text-[11px] font-bold tracking-widest text-[#c2410c] uppercase mb-3">Why PrintFlow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1c1917] dark:text-stone-100 tracking-tight">
              Everything you need,<br className="sm:hidden" /> nothing you don't
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div key={f.title}
                className="group relative bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/40 rounded-2xl p-6 sm:p-7 hover:bg-white dark:hover:bg-stone-900 hover:border-[#c2410c]/15 dark:hover:border-[#c2410c]/30 hover:shadow-xl hover:shadow-orange-100/30 dark:hover:shadow-orange-900/20 transition-all duration-500 cursor-default"
                style={{
                  transitionDelay: isVisible("features") ? `${i * 100}ms` : "0ms",
                  opacity: isVisible("features") ? 1 : 0,
                  transform: isVisible("features") ? "translateY(0)" : "translateY(24px)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center group-hover:bg-[#fff7ed] dark:group-hover:bg-[#c2410c]/10 group-hover:border-[#c2410c]/15 transition-all duration-300">
                    <f.icon className="w-5 h-5 text-stone-400 dark:text-stone-500 group-hover:text-[#c2410c] transition-colors duration-300" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-[#c2410c] bg-[#fff7ed] dark:bg-[#c2410c]/10 px-2.5 py-1 rounded-full border border-[#c2410c]/10 dark:border-[#c2410c]/20">
                    {f.highlight}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1.5">{f.title}</h3>
                <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section ref={setSectionRef("cta")} id="cta" className="relative z-10 px-4 pb-16 sm:pb-24">
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${isVisible("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1917] to-[#292524] dark:from-stone-800 dark:to-stone-900 p-8 sm:p-12 text-center">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#c2410c]/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#ea580c]/15 blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Ready to get started?
              </h2>
              <p className="text-stone-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                Join thousands of businesses and creators who trust PrintFlow for their printing needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => handleNavClick("/register")} className="group flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold text-[#1c1917] bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:bg-stone-50 active:scale-[0.97] transition-all duration-300">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-stone-200/50 dark:border-stone-800/50 bg-white/30 dark:bg-stone-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c2410c] to-[#ea580c] flex items-center justify-center">
                  <Printer className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-extrabold text-[#1c1917] dark:text-stone-100 tracking-tight">
                  Print<span className="text-[#c2410c]">Flow</span>
                </span>
              </button>
              <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed max-w-[200px]">
                The modern platform for print commerce. Built for quality, speed, and simplicity.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Features", "Pricing", "Integrations", "Changelog"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase mb-3">{col.heading}</h4>
                <div className="space-y-2">
                  {col.links.map((l) => (
                    <button key={l} onClick={() => handleNavClick("/")} className="block text-sm text-stone-500 dark:text-stone-400 hover:text-[#c2410c] dark:hover:text-[#ea580c] transition-colors duration-200">
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-200/50 dark:border-stone-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="lp-pulse absolute inline-flex h-full w-full rounded-full bg-[#c2410c] opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c2410c]" />
              </span>
              &copy; {new Date().getFullYear()} PrintFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ─── STYLES ─── */}
      <style>{`
        @keyframes lp-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50%       { transform: translateY(-12px) rotate(12deg); }
        }
        @keyframes lp-float-d {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes lp-pulse {
          0%, 100% { transform: scale(1); opacity: .5; }
          50%       { transform: scale(2); opacity: 0; }
        }
        @keyframes lp-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes lp-blob-drift {
          0%, 100% { transform: scale(1) translate(0,0); }
          33%       { transform: scale(1.05) translate(2%,2%); }
          66%       { transform: scale(0.97) translate(-2%,1%); }
        }

        .lp-su {
          opacity: 0;
          animation: lp-slide-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .lp-float  { animation: lp-float   6s ease-in-out infinite; }
        .lp-float-d{ animation: lp-float-d 8s ease-in-out infinite; }
        .lp-pulse  { animation: lp-pulse   2s ease-in-out infinite; }
        .lp-shimmer{
          background-size: 200% 200%;
          animation: lp-shimmer 4s ease infinite;
        }
        .lp-fl-a { animation: lp-blob-drift 18s ease-in-out infinite; }
        .lp-fl-b { animation: lp-blob-drift 22s ease-in-out infinite reverse; }
        .lp-fl-c { animation: lp-blob-drift 15s ease-in-out infinite 3s; }
      `}</style>
    </div>
  );
};

export default LandingPage;