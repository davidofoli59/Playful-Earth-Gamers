/**
 * Playful Earth Gamers (PEG) - Master Animation & Transition Engine
 * 
 * Provides:
 * 1. Slide Transition Effects: Fade, Wipe, Push, Split
 * 2. Object Animation Effects: Fly In, Zoom, Bounce
 * 3. Scroll Entrance Effects: Triggered on scroll up & down via IntersectionObserver
 * 4. Emphasis Effects: Spin, Pulse
 * 5. Exit Effects: Disappear with graceful motion
 * 6. Motion Path Controller: Objects gliding smoothly along curved SVG bezier paths
 */

export type TransitionEffect = "fade" | "wipe" | "push" | "split";
export type AnimationEffect = "fly-in" | "zoom" | "bounce";
export type EmphasisEffect = "spin" | "pulse";
export type ExitEffect = "fade-out" | "shrink-out" | "fly-out-up";

export interface CommercialSlide {
  id: string;
  badge: string;
  badgeColor: string;
  headline: string;
  highlightText: string;
  description: string;
  ctaText: string;
  ctaAction: string;
  imageUrl: string;
  quote: string;
  speaker: string;
  metrics: { label: string; value: string }[];
}

export const COMMERCIAL_SLIDES: CommercialSlide[] = [
  {
    id: "slide-1",
    badge: "GLOBAL ESPORTS TOURNAMENT",
    badgeColor: "emerald",
    headline: "Unleash Your Skills in the",
    highlightText: "Apex Predator Invitational",
    description: "Compete with the top 1% esports squads worldwide for an audited 50,000 PEG escrow prize pool. Real-time telemetry, zero latency, and certified fair play.",
    ctaText: "Join Tournament Arena",
    ctaAction: "games",
    imageUrl: "/assets/images/cat_battle_royale_1789111816039.jpg",
    quote: "“The smoothest cross-platform competitive experience I've ever streamed.”",
    speaker: "Valkyrie_Pro — Champion Rank",
    metrics: [
      { label: "Prize Pool", value: "$50,000" },
      { label: "Registered Squads", value: "1,240" },
      { label: "Server Tick Rate", value: "128 Hz" },
    ],
  },
  {
    id: "slide-2",
    badge: "NEXT-GEN CROSS-PLAY",
    badgeColor: "cyan",
    headline: "Unified Matchmaking Across",
    highlightText: "Every Console & Mobile",
    description: "Seamless synchronization between PC, PlayStation 5, Xbox Series X, Nintendo Switch, Android, and iOS. Jump into lobbies with your friends in under 10 seconds.",
    ctaText: "Explore Platforms",
    ctaAction: "platforms",
    imageUrl: "/assets/images/cat_racing_1789111828418.jpg",
    quote: "“Play on my phone on the bus, continue on my PC at home without losing a beat.”",
    speaker: "ApexDrifter — Top Tier Racer",
    metrics: [
      { label: "Platforms", value: "7 Major" },
      { label: "Match Latency", value: "< 35ms" },
      { label: "Cross-Saves", value: "Instant" },
    ],
  },
  {
    id: "slide-3",
    badge: "CREATOR MONETIZATION GUILD",
    badgeColor: "amber",
    headline: "Turn Your Highlights Into",
    highlightText: "Instant Creator Rewards",
    description: "Streamers, shoutcasters, and highlight editors earn verified payouts directly to their accounts. Community upvotes convert to cash backed by our Creator Escrow Reserve.",
    ctaText: "Join Creator Guild",
    ctaAction: "membership",
    imageUrl: "/assets/images/peg_portal_orb_1789111796928.jpg",
    quote: "“PEG actually rewards grassroots creators instead of just top celebrity streamers.”",
    speaker: "KiraShout — Lead Caster",
    metrics: [
      { label: "Creator Pool", value: "$120,000" },
      { label: "Verified Creators", value: "3,800+" },
      { label: "Payout Cadence", value: "Weekly" },
    ],
  },
  {
    id: "slide-4",
    badge: "ZERO-TRUST INTEGRITY",
    badgeColor: "purple",
    headline: "Hardware-Backed Protection with",
    highlightText: "PEG Sentinel Anti-Cheat",
    description: "Every keystroke, cursor coordinate, and packet is audited by server-side anomaly detection. Zero tolerance for cheats, scripts, or unauthorized modifications.",
    ctaText: "Read Security Whitepaper",
    ctaAction: "security",
    imageUrl: "/assets/images/cat_fps_1789111852654.jpg",
    quote: "“For the first time in 5 years, every match feels genuine and fair.”",
    speaker: "GhostSniper — Tactical Vet",
    metrics: [
      { label: "Ban Accuracy", value: "99.98%" },
      { label: "Audit Latency", value: "Real-time" },
      { label: "Tamper Proof", value: "SHA-512" },
    ],
  },
  {
    id: "slide-5",
    badge: "REVOLUTIONARY $1 ACCESS",
    badgeColor: "lime",
    headline: "Elite Gaming Within Everyone's Reach:",
    highlightText: "$1 USD All-Access Membership",
    description: "Activate your account using real Paystack checkout with local African and global currencies (₦1,500 NGN, GH₵15.50 GHS, KSh 130 KES, R18.50 ZAR). No predatory pay-to-win.",
    ctaText: "Activate for $1",
    ctaAction: "membership",
    imageUrl: "/assets/images/peg_hero_montage_1789111768235.jpg",
    quote: "“The fairest pricing model in esports history. One dollar unlocks the entire ecosystem.”",
    speaker: "NeoGamer — Community Lead",
    metrics: [
      { label: "Base Price", value: "$1.00 USD" },
      { label: "Local Currencies", value: "5+ Live" },
      { label: "Paywall Free", value: "100%" },
    ],
  },
];

export class AnimationManager {
  private currentSlideIndex = 0;
  private currentTransition: TransitionEffect = "fade";
  private currentAnimation: AnimationEffect = "fly-in";
  private autoPlayTimer: number | null = null;
  private isAutoPlaying = true;
  private lastScrollY = 0;
  private scrollDirection: "up" | "down" = "down";

  constructor() {
    this.initScrollObserver();
    this.initScrollDirectionTracker();
  }

  // Track scroll direction (up vs down) to customize entrance & motion
  private initScrollDirectionTracker() {
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > this.lastScrollY) {
        this.scrollDirection = "down";
        document.body.setAttribute("data-scroll-dir", "down");
      } else {
        this.scrollDirection = "up";
        document.body.setAttribute("data-scroll-dir", "up");
      }
      this.lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Scroll Entrance Observer using IntersectionObserver
  private initScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -60px 0px",
      threshold: 0.12,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        const entranceType = target.getAttribute("data-entrance") || "fade";

        if (entry.isIntersecting) {
          target.classList.remove(
            "opacity-0",
            "translate-y-12",
            "-translate-y-12",
            "scale-90",
            "scale-95",
            "rotate-2",
            "-rotate-2"
          );
          target.classList.add("entrance-visible");

          // Apply specific entrance animation class
          switch (entranceType) {
            case "fly-in":
              target.classList.add("anim-fly-in-up");
              break;
            case "zoom":
              target.classList.add("anim-zoom-in");
              break;
            case "bounce":
              target.classList.add("anim-bounce");
              break;
            case "wipe":
              target.classList.add("anim-wipe-in");
              break;
            case "split":
              target.classList.add("anim-split-in");
              break;
            case "fade":
            default:
              target.classList.add("anim-fade-in");
              break;
          }
        } else {
          // Re-arm animation if user scrolls far away for dynamic scroll experience
          if (target.hasAttribute("data-repeat-entrance")) {
            target.classList.remove("entrance-visible", "anim-fly-in-up", "anim-zoom-in", "anim-bounce", "anim-fade-in", "anim-wipe-in", "anim-split-in");
            target.classList.add("opacity-0", "translate-y-12");
          }
        }
      });
    }, observerOptions);

    // Observe elements with [data-entrance]
    document.querySelectorAll("[data-entrance]").forEach((el) => {
      observer.observe(el);
    });
  }

  // Setup Commercial Slide Showcase
  public setupCommercialShowcase(
    sliderContainerId: string,
    onSlideChange?: (index: number, slide: CommercialSlide) => void
  ) {
    const container = document.getElementById(sliderContainerId);
    if (!container) return;

    this.renderSlide(container);

    // Auto-advance every 6 seconds
    this.startAutoPlay(container, onSlideChange);

    return {
      setTransition: (type: TransitionEffect) => {
        this.currentTransition = type;
        this.renderSlide(container);
      },
      setAnimation: (type: AnimationEffect) => {
        this.currentAnimation = type;
        this.renderSlide(container);
      },
      nextSlide: () => {
        this.currentSlideIndex = (this.currentSlideIndex + 1) % COMMERCIAL_SLIDES.length;
        this.renderSlide(container);
        if (onSlideChange) onSlideChange(this.currentSlideIndex, COMMERCIAL_SLIDES[this.currentSlideIndex]);
      },
      prevSlide: () => {
        this.currentSlideIndex = (this.currentSlideIndex - 1 + COMMERCIAL_SLIDES.length) % COMMERCIAL_SLIDES.length;
        this.renderSlide(container);
        if (onSlideChange) onSlideChange(this.currentSlideIndex, COMMERCIAL_SLIDES[this.currentSlideIndex]);
      },
      goToSlide: (index: number) => {
        this.currentSlideIndex = index % COMMERCIAL_SLIDES.length;
        this.renderSlide(container);
        if (onSlideChange) onSlideChange(this.currentSlideIndex, COMMERCIAL_SLIDES[this.currentSlideIndex]);
      },
      toggleAutoPlay: () => {
        this.isAutoPlaying = !this.isAutoPlaying;
        if (this.isAutoPlaying) {
          this.startAutoPlay(container, onSlideChange);
        } else if (this.autoPlayTimer) {
          clearInterval(this.autoPlayTimer);
          this.autoPlayTimer = null;
        }
        return this.isAutoPlaying;
      },
      triggerEmphasis: (effect: EmphasisEffect) => {
        this.applyEmphasisToCurrentSlide(container, effect);
      },
      triggerExit: () => {
        this.applyExitToCurrentSlide(container);
      },
    };
  }

  private startAutoPlay(container: HTMLElement, onSlideChange?: (index: number, slide: CommercialSlide) => void) {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = window.setInterval(() => {
      if (!this.isAutoPlaying) return;
      this.currentSlideIndex = (this.currentSlideIndex + 1) % COMMERCIAL_SLIDES.length;
      this.renderSlide(container);
      if (onSlideChange) onSlideChange(this.currentSlideIndex, COMMERCIAL_SLIDES[this.currentSlideIndex]);
    }, 6500);
  }

  // Render current slide with selected Transition and Animation effect
  private renderSlide(container: HTMLElement) {
    const slide = COMMERCIAL_SLIDES[this.currentSlideIndex];
    const transClass = `trans-${this.currentTransition}`;
    const animClass = `anim-${this.currentAnimation}`;

    container.innerHTML = `
      <div class="commercial-slide-wrap relative w-full h-full min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-[#030d17] flex flex-col justify-between ${transClass}">
        <!-- Slide Background & Media -->
        <div class="absolute inset-0 z-0 overflow-hidden">
          <img src="${slide.imageUrl}" alt="${slide.headline}" class="w-full h-full object-cover object-center filter brightness-[0.45] contrast-125 transition-transform duration-1000 transform hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-r from-[#02070f] via-[#02070f]/80 to-transparent"></div>
          <div class="absolute inset-0 bg-radial-vignette opacity-70"></div>
        </div>

        <!-- Floating Slide Header & Badges -->
        <div class="relative z-10 p-6 sm:p-10 flex flex-wrap items-center justify-between gap-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md ${animClass}">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-rajdhani font-bold tracking-widest text-emerald-300 uppercase">${slide.badge}</span>
          </div>

          <div class="flex items-center gap-2 text-xs font-rajdhani font-semibold text-slate-400 bg-black/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>Commercial Reel</span>
            <span class="text-emerald-400 font-bold font-mono">${this.currentSlideIndex + 1} / ${COMMERCIAL_SLIDES.length}</span>
          </div>
        </div>

        <!-- Central Commercial Pitch Content -->
        <div class="relative z-10 px-6 sm:px-10 py-4 max-w-2xl space-y-4">
          <h3 class="text-2xl sm:text-4xl lg:text-5xl font-orbitron font-black text-white leading-tight ${animClass}">
            ${slide.headline} <br>
            <span class="neon-text-lime">${slide.highlightText}</span>
          </h3>

          <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal ${animClass}">
            ${slide.description}
          </p>

          <div class="p-3.5 rounded-2xl bg-black/50 border border-slate-800/80 backdrop-blur-md max-w-lg ${animClass}">
            <p class="text-xs sm:text-sm text-cyan-200 italic">${slide.quote}</p>
            <span class="text-[11px] font-rajdhani font-bold text-slate-400 block mt-1">— ${slide.speaker}</span>
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-2 ${animClass}">
            <a href="#${slide.ctaAction}" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-orbitron font-extrabold text-xs tracking-wider uppercase hover:brightness-110 shadow-[0_0_20px_rgba(0,255,135,0.4)] transition">
              ${slide.ctaText} →
            </a>
            <button data-trigger-slide-emphasis class="px-4 py-3 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 text-xs font-rajdhani font-bold tracking-wider uppercase transition">
              ⚡ Highlight Spotlight
            </button>
          </div>
        </div>

        <!-- Slide Metrics Footer -->
        <div class="relative z-10 p-6 sm:px-10 sm:py-6 bg-[#01060c]/85 border-t border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div class="grid grid-cols-3 gap-6 sm:gap-10">
            ${slide.metrics
              .map(
                (m) => `
              <div>
                <div class="text-lg sm:text-xl font-orbitron font-black text-emerald-400">${m.value}</div>
                <div class="text-[11px] text-slate-400 font-rajdhani uppercase tracking-wider">${m.label}</div>
              </div>
            `
              )
              .join("")}
          </div>

          <!-- Slide Navigation Dots -->
          <div class="flex items-center gap-2">
            ${COMMERCIAL_SLIDES.map(
              (_, i) => `
              <button data-slide-dot="${i}" class="w-3 h-3 rounded-full transition-all duration-300 ${
                i === this.currentSlideIndex
                  ? "w-8 bg-emerald-400 shadow-[0_0_10px_rgba(0,255,135,0.8)]"
                  : "bg-slate-700 hover:bg-slate-500"
              }"></button>
            `
            ).join("")}
          </div>
        </div>
      </div>
    `;

    // Bind dots
    container.querySelectorAll("[data-slide-dot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-slide-dot") || "0", 10);
        this.currentSlideIndex = idx;
        this.renderSlide(container);
      });
    });

    // Bind slide emphasis button
    container.querySelector("[data-trigger-slide-emphasis]")?.addEventListener("click", () => {
      this.applyEmphasisToCurrentSlide(container, "pulse");
    });
  }

  // Apply Emphasis effects: Spin or Pulse
  public applyEmphasisToCurrentSlide(container: HTMLElement, effect: EmphasisEffect = "pulse") {
    const slideWrap = container.querySelector(".commercial-slide-wrap");
    if (!slideWrap) return;

    if (effect === "spin") {
      slideWrap.classList.remove("anim-spin-3d", "anim-pulse-glow");
      void (slideWrap as HTMLElement).offsetWidth; // Trigger reflow
      slideWrap.classList.add("anim-spin-3d");
      setTimeout(() => slideWrap.classList.remove("anim-spin-3d"), 1200);
    } else {
      slideWrap.classList.remove("anim-spin-3d", "anim-pulse-glow");
      void (slideWrap as HTMLElement).offsetWidth;
      slideWrap.classList.add("anim-pulse-glow");
      setTimeout(() => slideWrap.classList.remove("anim-pulse-glow"), 1600);
    }
  }

  // Apply Exit effect: Make an object disappear from the slide
  public applyExitToCurrentSlide(container: HTMLElement, exitEffect: ExitEffect = "shrink-out") {
    const slideWrap = container.querySelector(".commercial-slide-wrap");
    if (!slideWrap) return;

    slideWrap.classList.add(exitEffect === "fly-out-up" ? "anim-exit-fly-up" : "anim-exit-shrink");

    setTimeout(() => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % COMMERCIAL_SLIDES.length;
      this.renderSlide(container);
    }, 600);
  }

  // Apply Emphasis effect to any arbitrary element selector
  public emphasizeElement(selector: string, effect: EmphasisEffect = "pulse") {
    const el = document.querySelector(selector);
    if (!el) return;
    const cls = effect === "spin" ? "anim-spin-once" : "anim-pulse-glow";
    el.classList.remove("anim-spin-once", "anim-pulse-glow", "anim-spin-3d");
    void (el as HTMLElement).offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 1500);
  }

  // Make an element exit with animation
  public exitElement(element: HTMLElement, onDone?: () => void) {
    element.classList.add("anim-exit-shrink");
    setTimeout(() => {
      element.classList.add("hidden");
      if (onDone) onDone();
    }, 500);
  }

  // Animate an object along a specific SVG Motion Path
  public launchMotionPathDrone(droneId = "motionPathDrone") {
    const drone = document.getElementById(droneId);
    if (!drone) return;
    drone.classList.remove("motion-path-drone");
    void drone.offsetWidth; // force reflow
    drone.classList.add("motion-path-drone");
  }

  // Initialize Scroll-Driven Motion Path & Scroll HUD
  public initScrollMotionPath() {
    // Setup scroll progress listener to move the floating cyber-drone along motion path
    window.addEventListener("scroll", () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTotal > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollTotal) * 100)) : 0;
      
      const scrollIndicator = document.getElementById("scrollProgressPercent");
      if (scrollIndicator) {
        scrollIndicator.textContent = `${Math.round(scrollPercent)}%`;
      }

      const scrollBar = document.getElementById("scrollProgressBar");
      if (scrollBar) {
        scrollBar.style.width = `${scrollPercent}%`;
      }

      const scrollDirLabel = document.getElementById("scrollDirectionLabel");
      if (scrollDirLabel) {
        scrollDirLabel.textContent = this.scrollDirection === "down" ? "▼ SCROLLING DOWN" : "▲ SCROLLING UP";
        scrollDirLabel.className = this.scrollDirection === "down" 
          ? "text-[10px] font-mono text-emerald-400 font-bold" 
          : "text-[10px] font-mono text-cyan-400 font-bold";
      }

      // Sync floating motion path orb with scroll progress
      const pathOrb = document.getElementById("scrollMotionPathOrb");
      if (pathOrb) {
        pathOrb.style.offsetDistance = `${scrollPercent}%`;
      }
    }, { passive: true });
  }
}

// Global animation manager instance
export const animationEngine = new AnimationManager();
