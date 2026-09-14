// src/saasStorytelling.ts
// 3D Storytelling SaaS Video UI, Gamer Micro-Loans, Virtual Cards, and Dedicated Pages Engine

export interface GameItem {
  id: string;
  title: string;
  category: "adventure" | "action" | "strategy" | "puzzle" | "racing";
  categoryLabel: string;
  image: string;
  about: string;
  rating: number; // out of 10
  hours: number;
  rank: string;
  trailerBg: string;
  tournamentEntryFee: string;
  prizePool: string;
  status: "LIVE QUALIFIERS" | "SEASON FINALS" | "COMMUNITY CUP";
}

export interface CategoryData {
  id: "adventure" | "action" | "strategy" | "puzzle" | "racing";
  label: string;
  tagline: string;
  activePlayers: string;
  gradientClass: string;
  glowColor: string;
  iconSvg: string;
  games: GameItem[];
}

export const SAAS_CATEGORIES: CategoryData[] = [
  {
    id: "adventure",
    label: "Adventure",
    tagline: "Epic Open Worlds & RPG Quests",
    activePlayers: "124,850 Playing",
    gradientClass: "from-[#ff512f] to-[#dd2476]",
    glowColor: "rgba(255, 81, 47, 0.4)",
    iconSvg: `<svg viewBox="0 0 48 48" class="w-8 h-8 text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 34L34 14" />
      <path d="M38 10L30 18" />
      <path d="M20 28L12 36" />
      <path d="M10 38L6 42" />
      <path d="M32 6L42 16" />
      <path d="M8 32L16 40" />
    </svg>`,
    games: [
      {
        id: "horizon-zero-dawn",
        title: "Horizon Zero Dawn",
        category: "adventure",
        categoryLabel: "Adventure RPG",
        image: "/assets/images/cat_rpg_1789111880501.jpg",
        about: "Experience Aloy's legendary quest to unravel the mysteries of a future Earth ruled by Machines. Use tactical agility, crafted weapons, and elemental traps to overcome majestic robotic predators in high-stakes qualifier cups.",
        rating: 8.9,
        hours: 76,
        rank: "Top 4%",
        trailerBg: "/assets/images/peg_hero_montage_1789111768235.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$2,500.00 Escrow",
        status: "LIVE QUALIFIERS",
      },
      {
        id: "ark-survival",
        title: "ARK: Survival Evolved",
        category: "adventure",
        categoryLabel: "Open World Survival",
        image: "/assets/images/cat_sandbox_1789111891956.jpg",
        about: "Stranded on the shores of a mysterious island, you must hunt, harvest resources, craft items, grow crops, research technologies, and build shelters to withstand fierce primeval creatures and rival player alliances.",
        rating: 8.4,
        hours: 112,
        rank: "Top 7%",
        trailerBg: "/assets/images/asteroid_real_front_1789229842701.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$1,800.00 Escrow",
        status: "COMMUNITY CUP",
      },
      {
        id: "destiny-2",
        title: "Destiny 2: Lightfall",
        category: "adventure",
        categoryLabel: "Sci-Fi MMO Shooter",
        image: "/assets/images/peg_portal_orb_1789111796928.jpg",
        about: "Dive into Destiny 2's world of solar guardians to explore the mysteries of the solar system and experience responsive first-person shooter combat. Unlock powerful elemental abilities and collect unique exotic gear.",
        rating: 9.1,
        hours: 145,
        rank: "Top 2%",
        trailerBg: "/assets/images/peg_gamer_challenge_1789111784294.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$5,000.00 Escrow",
        status: "SEASON FINALS",
      },
    ],
  },
  {
    id: "action",
    label: "Action",
    tagline: "High-Octane Battle Royale & FPS",
    activePlayers: "318,400 Playing",
    gradientClass: "from-[#8e2de2] to-[#4a00e0]",
    glowColor: "rgba(142, 45, 226, 0.4)",
    iconSvg: `<svg viewBox="0 0 48 48" class="w-8 h-8 text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 6L28 14L38 18L30 26L32 36L24 30L16 36L18 26L10 18L20 14Z" />
      <path d="M24 30V42" />
      <path d="M18 38L14 42" />
      <path d="M30 38L34 42" />
    </svg>`,
    games: [
      {
        id: "risk-of-rain-2",
        title: "Risk of Rain 2",
        category: "action",
        categoryLabel: "Tactical Roguelike",
        image: "/assets/images/cat_fps_1789111852654.jpg",
        about: "Escape a chaotic alien planet by fighting through hordes of frenzied monsters with your teammates. Combine loot in surprising ways and master each character until you become the havoc you feared on your first crash landing.",
        rating: 9.3,
        hours: 94,
        rank: "Top 3%",
        trailerBg: "/assets/images/cat_battle_royale_1789111816039.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$3,200.00 Escrow",
        status: "LIVE QUALIFIERS",
      },
      {
        id: "pubg-battlegrounds",
        title: "PUBG: Battlegrounds",
        category: "action",
        categoryLabel: "Battle Royale",
        image: "/assets/images/cat_battle_royale_1789111816039.jpg",
        about: "Land on strategic locations, loot weapons and supplies, and survive to become the last team standing across diverse and sprawling battlegrounds. Instant entry credit available via PEG Gamer Loans.",
        rating: 8.8,
        hours: 210,
        rank: "Top 5%",
        trailerBg: "/assets/images/asteroid_real_cockpit_1789229899026.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$7,500.00 Escrow",
        status: "SEASON FINALS",
      },
      {
        id: "cs-go",
        title: "Counter-Strike: Global Offensive",
        category: "action",
        categoryLabel: "Tactical 5v5 FPS",
        image: "/assets/images/cat_sports_1789111869130.jpg",
        about: "The premier competitive tactical shooter. Engage in intense bomb defusal and hostage rescue rounds. Monitored by PEG Sentinel Anti-Cheat engine with verified escrow prize distribution.",
        rating: 9.5,
        hours: 430,
        rank: "Top 1%",
        trailerBg: "/assets/images/peg_hero_montage_1789111768235.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$10,000.00 Escrow",
        status: "SEASON FINALS",
      },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    tagline: "Turn-Based Tactics & Grand Esports",
    activePlayers: "92,410 Playing",
    gradientClass: "from-[#00c6ff] to-[#0072ff]",
    glowColor: "rgba(0, 198, 255, 0.4)",
    iconSvg: `<svg viewBox="0 0 48 48" class="w-8 h-8 text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 40H32V36L28 32C28 32 34 26 34 18C34 12 30 8 24 8C18 8 14 12 14 18C14 26 20 32 20 32L16 36V40Z" />
      <circle cx="24" cy="16" r="2" fill="currentColor" />
    </svg>`,
    games: [
      {
        id: "civ-v",
        title: "Sid Meier's Civilization V",
        category: "strategy",
        categoryLabel: "Grand 4X Strategy",
        image: "/assets/images/cat_moba_1789111839354.jpg",
        about: "Become Ruler of the World by establishing and leading a civilization from the dawn of man into the space age. Wage war, conduct diplomacy, discover new technologies, and compete head-to-head with history's greatest leaders.",
        rating: 9.6,
        hours: 320,
        rank: "Top 2%",
        trailerBg: "/assets/images/asteroid_real_side_1789229880111.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$4,000.00 Escrow",
        status: "LIVE QUALIFIERS",
      },
      {
        id: "warhammer-2",
        title: "Total War: Warhammer II",
        category: "strategy",
        categoryLabel: "Fantasy Grand Strategy",
        image: "/assets/images/cat_rpg_1789111880501.jpg",
        about: "A strategy game of titanic proportions. Choose from four unique races and wage war across a mystical fantasy campaign map, culminating in cinematic real-time tactical clashes with thousands of troops.",
        rating: 9.0,
        hours: 180,
        rank: "Top 6%",
        trailerBg: "/assets/images/cat_moba_1789111839354.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$3,500.00 Escrow",
        status: "COMMUNITY CUP",
      },
    ],
  },
  {
    id: "puzzle",
    label: "Puzzle & Tactics",
    tagline: "Spatial Logic & Precision Problem Solving",
    activePlayers: "68,200 Playing",
    gradientClass: "from-[#f9d423] to-[#ff4e50]",
    glowColor: "rgba(249, 212, 35, 0.4)",
    iconSvg: `<svg viewBox="0 0 48 48" class="w-8 h-8 text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 10H30V16C33 16 36 19 36 22C36 25 33 28 30 28V38H18V32C15 32 12 29 12 26C12 23 15 20 18 20V10Z" />
    </svg>`,
    games: [
      {
        id: "portal-tactics",
        title: "Portal: Quantum Chambers",
        category: "puzzle",
        categoryLabel: "Spatial Physics",
        image: "/assets/images/cat_puzzle_1789111902737.jpg",
        about: "Harness momentum and teleportation portals to overcome increasingly complex physics challenges in competitive speedrun ladders with live prize timing.",
        rating: 9.7,
        hours: 65,
        rank: "Top 1%",
        trailerBg: "/assets/images/peg_portal_orb_1789111796928.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$2,000.00 Escrow",
        status: "LIVE QUALIFIERS",
      },
    ],
  },
  {
    id: "racing",
    label: "Velocity Racing",
    tagline: "Sim Racing & Street Circuit Championships",
    activePlayers: "142,900 Playing",
    gradientClass: "from-[#00f2fe] to-[#4facfe]",
    glowColor: "rgba(0, 242, 254, 0.4)",
    iconSvg: `<svg viewBox="0 0 48 48" class="w-8 h-8 text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="24" r="16" />
      <circle cx="24" cy="24" r="5" />
      <path d="M24 8V19" />
      <path d="M10 30L20 26" />
      <path d="M38 30L28 26" />
    </svg>`,
    games: [
      {
        id: "forza-apex",
        title: "Apex Velocity Gran Turismo",
        category: "racing",
        categoryLabel: "Precision Sim Racing",
        image: "/assets/images/cat_racing_1789111828418.jpg",
        about: "Master hyper-realistic vehicle physics, precision braking, and dynamic weather conditions across global Grand Prix circuits in competitive time-trial brackets.",
        rating: 9.2,
        hours: 110,
        rank: "Top 3%",
        trailerBg: "/assets/images/asteroid_real_rear_1789229863038.jpg",
        tournamentEntryFee: "$1.00 or Virtual Card",
        prizePool: "$6,000.00 Escrow",
        status: "SEASON FINALS",
      },
    ],
  },
];

export const VIRTUAL_CARDS_DATA = [
  {
    id: "black-titanium",
    name: "PEG Black Titanium VIP",
    edition: "Ultra-Luxurious Obsidian Metal",
    badge: "VIP FOUNDER PASS",
    svgPath: "/assets/cards/peg-card-black-titanium.svg",
    number: "4832 •••• •••• 7741",
    fullNumber: "4832 9901 2488 7741",
    cvv: "892",
    expiry: "09/30",
    holder: "SUPER ODDS CHAMPION",
    perks: [
      "Zero foreign exchange markups on Steam, PSN, and Xbox",
      "Instant tournament prize cashout straight to card",
      "Priority 24/7 dedicated VIP concierge hotline",
      "Qualifies for 0% APR Gamer Micro-Loans up to $500",
    ],
  },
  {
    id: "cyber-neon",
    name: "PEG Cyber Neon Tournament Pass",
    edition: "Luminescent Circuit Hologram",
    badge: "ESPORTS TOURNAMENT PASS",
    svgPath: "/assets/cards/peg-card-cyber-neon.svg",
    number: "5241 •••• •••• 6549",
    fullNumber: "5241 8832 1092 6549",
    cvv: "419",
    expiry: "11/29",
    holder: "ALEXANDER VANCE",
    perks: [
      "Hardware-accelerated tokenization & anti-fraud lock",
      "Direct Paystack instant naira/cedi/shilling top-up",
      "Automated entry stake escrow verification",
      "Free entry to 3 monthly championship qualifier cups",
    ],
  },
  {
    id: "aurora-gold",
    name: "PEG Aurora Gold Master",
    edition: "Sunset Gold Championship Edition",
    badge: "GLOBAL CHAMPION MASTER",
    svgPath: "/assets/cards/peg-card-aurora-gold.svg",
    number: "4109 •••• •••• 3320",
    fullNumber: "4109 7723 9051 3320",
    cvv: "703",
    expiry: "04/31",
    holder: "NOVA ESPORTS CLAN",
    perks: [
      "Multi-user clan sub-accounts and entry pool sharing",
      "100% prize pool protection with cold escrow vault",
      "Exclusive early access to Google Play & iOS closed beta",
      "Higher micro-credit ceiling for international majors",
    ],
  },
];

export class SaasStorytellingEngine {
  private activeCategoryIndex: number = 0;
  private activeGame: GameItem;
  private isAutoPlaying: boolean = false;
  private autoPlayTimer: any = null;
  private activeCardIndex: number = 0;
  private isCardDetailsRevealed: boolean = false;
  private isCardFrozen: boolean = false;

  constructor() {
    this.activeGame = SAAS_CATEGORIES[0].games[0];
  }

  public init() {
    this.renderCategoryBar();
    this.renderCategoryGames();
    this.updateSideInspector();
    this.setupCategoryEventListeners();
    this.setupVirtualCardStudio();
    this.setupLoanCalculator();
    this.setupDedicatedPolicyPages();
    this.setupFooterDemonstrators();
  }

  // 1. Render 3D Storytelling Category Bar (Matching the Video)
  private renderCategoryBar() {
    const container = document.getElementById("saasCategoriesContainer");
    if (!container) return;

    container.innerHTML = SAAS_CATEGORIES.map((cat, idx) => {
      const isActive = idx === this.activeCategoryIndex;
      return `
        <div class="category-story-card relative flex-shrink-0 w-44 md:w-52 p-4 rounded-3xl cursor-pointer transition-all duration-500 select-none ${
          isActive
            ? `bg-gradient-to-br ${cat.gradientClass} scale-105 shadow-[0_12px_30px_${cat.glowColor}] text-white ring-2 ring-white/60`
            : "bg-[#0d1424]/80 hover:bg-[#131c33] border border-slate-800/80 text-slate-300 hover:border-slate-700"
        }" data-cat-idx="${idx}">
          <!-- Floating 3D Icon Container -->
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 ${
            isActive ? "bg-white/20 backdrop-blur-md scale-110 shadow-lg" : "bg-[#080d1a] border border-slate-800"
          }">
            ${cat.iconSvg}
          </div>

          <h3 class="font-orbitron font-bold text-sm md:text-base tracking-wide leading-tight mb-1 ${
            isActive ? "text-white" : "text-slate-100"
          }">
            ${cat.label}
          </h3>
          <p class="text-[11px] font-rajdhani font-semibold ${isActive ? "text-white/80" : "text-slate-400"}">
            ${cat.activePlayers}
          </p>

          ${
            isActive
              ? `<div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                   <div class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                 </div>`
              : ""
          }
        </div>
      `;
    }).join("");
  }

  // 2. Render Active Category's Games Grid
  private renderCategoryGames() {
    const container = document.getElementById("saasGamesGrid");
    const currentCat = SAAS_CATEGORIES[this.activeCategoryIndex];
    if (!container || !currentCat) return;

    const catHeading = document.getElementById("saasActiveCatHeading");
    if (catHeading) {
      catHeading.innerHTML = `
        <span class="text-xs font-mono uppercase tracking-widest text-emerald-400">${currentCat.label} Games</span>
        <h2 class="text-xl md:text-2xl font-orbitron font-extrabold text-white tracking-wide">${currentCat.tagline}</h2>
      `;
    }

    container.innerHTML = currentCat.games
      .map((game) => {
        const isSelected = game.id === this.activeGame.id;
        return `
        <div class="game-poster-card group relative rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer bg-[#070d18] ${
          isSelected
            ? "border-emerald-400 ring-2 ring-emerald-500/50 shadow-[0_10px_30px_rgba(0,255,135,0.25)] scale-[1.02]"
            : "border-slate-800/80 hover:border-slate-700 hover:scale-[1.01]"
        }" data-game-id="${game.id}">
          <div class="relative h-44 w-full overflow-hidden bg-slate-900">
            <img src="${game.image}" alt="${game.title}" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-[#070d18] via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40">
                ${game.status}
              </span>
            </div>

            <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-emerald-500 group-hover:text-black transition">
              <span class="text-xs font-bold">▶</span>
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h4 class="font-orbitron font-bold text-sm text-white group-hover:text-emerald-300 transition truncate">${game.title}</h4>
              <span class="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">★ ${game.rating}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-400 font-rajdhani font-semibold">
              <span>Prize: <b class="text-emerald-400">${game.prizePool}</b></span>
              <span>Entry: <b class="text-cyan-300">${game.tournamentEntryFee}</b></span>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // 3. Update the Floating Side-Inspector (Phone/Device Panel from the Video)
  public updateSideInspector() {
    const bannerImg = document.getElementById("inspectorGameBanner") as HTMLImageElement;
    const titleEl = document.getElementById("inspectorGameTitle");
    const catEl = document.getElementById("inspectorGameCategory");
    const aboutEl = document.getElementById("inspectorGameAbout");
    const ratingEl = document.getElementById("inspectorRatingScore");
    const hoursEl = document.getElementById("inspectorHoursScore");
    const rankEl = document.getElementById("inspectorRankScore");
    const prizeEl = document.getElementById("inspectorPrizePool");
    const trailerPoster = document.getElementById("inspectorTrailerPoster") as HTMLImageElement;

    if (bannerImg) bannerImg.src = this.activeGame.image;
    if (titleEl) titleEl.textContent = this.activeGame.title;
    if (catEl) catEl.textContent = this.activeGame.categoryLabel;
    if (aboutEl) aboutEl.textContent = this.activeGame.about;
    if (ratingEl) ratingEl.textContent = `${this.activeGame.rating}`;
    if (hoursEl) hoursEl.textContent = `${this.activeGame.hours}h`;
    if (rankEl) rankEl.textContent = this.activeGame.rank;
    if (prizeEl) prizeEl.textContent = this.activeGame.prizePool;
    if (trailerPoster) trailerPoster.src = this.activeGame.trailerBg;

    // Trigger subtle entrance pulse on side inspector
    const inspectorCard = document.getElementById("saasSideInspectorCard");
    if (inspectorCard) {
      inspectorCard.classList.remove("anim-pulse-glow");
      void inspectorCard.offsetWidth;
      inspectorCard.classList.add("anim-pulse-glow");
      setTimeout(() => inspectorCard.classList.remove("anim-pulse-glow"), 1200);
    }
  }

  // 4. Setup Category & Game Click Event Listeners
  private setupCategoryEventListeners() {
    const catContainer = document.getElementById("saasCategoriesContainer");
    if (catContainer) {
      catContainer.addEventListener("click", (e) => {
        const target = (e.target as HTMLElement).closest("[data-cat-idx]");
        if (target) {
          const idx = parseInt(target.getAttribute("data-cat-idx") || "0");
          this.activeCategoryIndex = idx;
          this.activeGame = SAAS_CATEGORIES[idx].games[0];
          this.renderCategoryBar();
          this.renderCategoryGames();
          this.updateSideInspector();
        }
      });
    }

    const gamesContainer = document.getElementById("saasGamesGrid");
    if (gamesContainer) {
      gamesContainer.addEventListener("click", (e) => {
        const card = (e.target as HTMLElement).closest("[data-game-id]");
        if (card) {
          const gameId = card.getAttribute("data-game-id");
          const currentCat = SAAS_CATEGORIES[this.activeCategoryIndex];
          const found = currentCat.games.find((g) => g.id === gameId);
          if (found) {
            this.activeGame = found;
            this.renderCategoryGames();
            this.updateSideInspector();
          }
        }
      });
    }

    // Auto Storytelling Video Tour Toggle
    const tourBtn = document.getElementById("saasAutoTourBtn");
    if (tourBtn) {
      tourBtn.addEventListener("click", () => {
        this.isAutoPlaying = !this.isAutoPlaying;
        if (this.isAutoPlaying) {
          tourBtn.classList.add("bg-emerald-500", "text-black");
          tourBtn.innerHTML = `<span>⏸</span><span>Pause 3D Tour</span>`;
          this.startAutoTour();
        } else {
          tourBtn.classList.remove("bg-emerald-500", "text-black");
          tourBtn.innerHTML = `<span>▶</span><span>Start 3D Tour</span>`;
          this.stopAutoTour();
        }
      });
    }

    // Trailer Play Button Simulation
    const trailerBtn = document.getElementById("inspectorPlayTrailerBtn");
    const trailerNotice = document.getElementById("inspectorTrailerNotice");
    if (trailerBtn && trailerNotice) {
      trailerBtn.addEventListener("click", () => {
        trailerNotice.classList.remove("hidden");
        trailerNotice.textContent = `Streaming 4K 120FPS live tournament highlight for ${this.activeGame.title}...`;
        setTimeout(() => {
          trailerNotice.textContent = `✓ High-definition telemetry verified. Ready to enter tournament cup.`;
        }, 2200);
      });
    }

    // Last Played Quick Chips
    document.querySelectorAll("[data-last-played]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const gameName = chip.getAttribute("data-last-played");
        // Find in all categories
        for (let c = 0; c < SAAS_CATEGORIES.length; c++) {
          const g = SAAS_CATEGORIES[c].games.find((item) => item.title.toLowerCase().includes(gameName?.toLowerCase() || ""));
          if (g) {
            this.activeCategoryIndex = c;
            this.activeGame = g;
            this.renderCategoryBar();
            this.renderCategoryGames();
            this.updateSideInspector();
            break;
          }
        }
      });
    });
  }

  private startAutoTour() {
    this.autoPlayTimer = setInterval(() => {
      const currentCat = SAAS_CATEGORIES[this.activeCategoryIndex];
      const currentGameIdx = currentCat.games.findIndex((g) => g.id === this.activeGame.id);

      if (currentGameIdx + 1 < currentCat.games.length) {
        this.activeGame = currentCat.games[currentGameIdx + 1];
      } else {
        this.activeCategoryIndex = (this.activeCategoryIndex + 1) % SAAS_CATEGORIES.length;
        this.activeGame = SAAS_CATEGORIES[this.activeCategoryIndex].games[0];
        this.renderCategoryBar();
      }

      this.renderCategoryGames();
      this.updateSideInspector();
    }, 4500);
  }

  private stopAutoTour() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  // 5. Virtual Cards Studio (Switching between 3 distinct virtual cards)
  private setupVirtualCardStudio() {
    const cardImg = document.getElementById("virtualCardDisplayImg") as HTMLImageElement;
    const cardTitle = document.getElementById("virtualCardTitle");
    const cardBadge = document.getElementById("virtualCardBadge");
    const cardEdition = document.getElementById("virtualCardEdition");
    const cardPanDisplay = document.getElementById("virtualCardPanDisplay");
    const cardCvvDisplay = document.getElementById("virtualCardCvvDisplay");
    const cardExpiryDisplay = document.getElementById("virtualCardExpiryDisplay");
    const cardHolderDisplay = document.getElementById("virtualCardHolderDisplay");
    const perksContainer = document.getElementById("virtualCardPerksList");
    const revealBtn = document.getElementById("revealCardDetailsBtn");
    const freezeBtn = document.getElementById("freezeCardToggleBtn");
    const limitSlider = document.getElementById("cardLimitSlider") as HTMLInputElement;
    const limitDisplay = document.getElementById("cardLimitValueDisplay");
    const topupBtn = document.getElementById("topupVirtualCardBtn");

    const updateCardView = () => {
      const card = VIRTUAL_CARDS_DATA[this.activeCardIndex];
      if (!card) return;

      if (cardImg) cardImg.src = card.svgPath;
      if (cardTitle) cardTitle.textContent = card.name;
      if (cardBadge) cardBadge.textContent = card.badge;
      if (cardEdition) cardEdition.textContent = card.edition;
      if (cardExpiryDisplay) cardExpiryDisplay.textContent = card.expiry;
      if (cardHolderDisplay) cardHolderDisplay.textContent = card.holder;

      if (cardPanDisplay) {
        cardPanDisplay.textContent = this.isCardDetailsRevealed ? card.fullNumber : card.number;
      }
      if (cardCvvDisplay) {
        cardCvvDisplay.textContent = this.isCardDetailsRevealed ? card.cvv : "•••";
      }

      if (perksContainer) {
        perksContainer.innerHTML = card.perks
          .map(
            (p) => `
          <li class="flex items-start gap-2 text-xs text-slate-300">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>${p}</span>
          </li>
        `
          )
          .join("");
      }

      // Update selector buttons
      document.querySelectorAll("[data-card-switch]").forEach((btn) => {
        const idx = parseInt(btn.getAttribute("data-card-switch") || "0");
        if (idx === this.activeCardIndex) {
          btn.className = "px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] transition cursor-pointer";
        } else {
          btn.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer";
        }
      });

      // Update Footer Demonstrator Sync
      this.syncFooterCardDemonstrator(card);
    };

    // Card Switcher buttons
    document.querySelectorAll("[data-card-switch]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-card-switch") || "0");
        this.activeCardIndex = idx;
        updateCardView();
      });
    });

    // Reveal Details toggle
    if (revealBtn) {
      revealBtn.addEventListener("click", () => {
        this.isCardDetailsRevealed = !this.isCardDetailsRevealed;
        revealBtn.textContent = this.isCardDetailsRevealed ? "Hide CVV & Number" : "Reveal Full Details";
        updateCardView();
      });
    }

    // Freeze toggle
    if (freezeBtn) {
      freezeBtn.addEventListener("click", async () => {
        this.isCardFrozen = !this.isCardFrozen;
        const cardFrame = document.getElementById("virtualCardDisplayFrame");
        if (cardFrame) {
          if (this.isCardFrozen) {
            cardFrame.classList.add("opacity-50", "grayscale");
            freezeBtn.textContent = "Unfreeze Card";
            freezeBtn.classList.add("bg-red-500", "text-white");
          } else {
            cardFrame.classList.remove("opacity-50", "grayscale");
            freezeBtn.textContent = "Freeze Card";
            freezeBtn.classList.remove("bg-red-500", "text-white");
          }
        }

        try {
          await fetch("/api/card/freeze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ freeze: this.isCardFrozen }),
          });
        } catch (_) {}
      });
    }

    // Limit Slider
    if (limitSlider && limitDisplay) {
      limitSlider.addEventListener("input", () => {
        limitDisplay.textContent = `$${parseFloat(limitSlider.value).toFixed(2)}`;
      });
      limitSlider.addEventListener("change", async () => {
        try {
          await fetch("/api/card/limit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ limit: limitSlider.value }),
          });
        } catch (_) {}
      });
    }

    // Top up action
    if (topupBtn) {
      topupBtn.addEventListener("click", async () => {
        const amountStr = prompt("Enter amount in USD to load into your Virtual Card (e.g. 50):", "50");
        if (amountStr) {
          const amt = parseFloat(amountStr);
          if (!isNaN(amt) && amt > 0) {
            try {
              const res = await fetch("/api/card/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amt }),
              });
              const data = await res.json();
              alert(`✓ ${data.message} New Card Balance: $${data.newBalance.toFixed(2)} USD`);
              const balDisplay = document.getElementById("virtualCardBalanceDisplay");
              if (balDisplay) balDisplay.textContent = `$${data.newBalance.toFixed(2)} USD`;
            } catch (err) {
              alert("Top-up simulated successfully!");
            }
          }
        }
      });
    }

    updateCardView();
  }

  // 6. Gamer Micro-Loan Calculator & Credit Facility
  private setupLoanCalculator() {
    const loanAmountSlider = document.getElementById("loanAmountSlider") as HTMLInputElement;
    const loanDurationSelect = document.getElementById("loanDurationSelect") as HTMLSelectElement;
    const loanAmountDisplay = document.getElementById("loanAmountDisplay");
    const loanInterestDisplay = document.getElementById("loanInterestDisplay");
    const loanRepaymentDisplay = document.getElementById("loanRepaymentDisplay");
    const loanDueDateDisplay = document.getElementById("loanDueDateDisplay");
    const applyLoanBtn = document.getElementById("applyLoanSubmitBtn");
    const loanFeedback = document.getElementById("loanFeedbackMessage");

    const recalculateLoan = () => {
      const amount = parseFloat(loanAmountSlider ? loanAmountSlider.value : "150") || 150;
      const days = parseInt(loanDurationSelect ? loanDurationSelect.value : "14") || 14;

      if (loanAmountDisplay) loanAmountDisplay.textContent = `$${amount.toFixed(2)} USD`;
      if (loanInterestDisplay) loanInterestDisplay.textContent = "0.00% ($0.00 APR Promo)";
      if (loanRepaymentDisplay) loanRepaymentDisplay.textContent = `$${amount.toFixed(2)} USD`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);
      if (loanDueDateDisplay) loanDueDateDisplay.textContent = dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

      // Sync footer demonstrator
      this.syncFooterLoanDemonstrator(amount, days);
    };

    if (loanAmountSlider) {
      loanAmountSlider.addEventListener("input", recalculateLoan);
    }
    if (loanDurationSelect) {
      loanDurationSelect.addEventListener("change", recalculateLoan);
    }

    if (applyLoanBtn) {
      applyLoanBtn.addEventListener("click", async () => {
        const amount = parseFloat(loanAmountSlider.value) || 150;
        const days = parseInt(loanDurationSelect.value) || 14;

        applyLoanBtn.setAttribute("disabled", "true");
        applyLoanBtn.textContent = "Verifying Tournament Escrow & Disbursing...";

        try {
          const res = await fetch("/api/loan/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gamerTag: "SuperOddsChampion",
              amount,
              days,
              currency: "USD",
            }),
          });
          const data = await res.json();
          if (loanFeedback) {
            loanFeedback.className = "p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs block leading-relaxed";
            loanFeedback.innerHTML = `<b>✓ Loan ${data.loan.id} Disbursed:</b> $${data.loan.amount.toFixed(2)} USD is now available on your PEG Virtual Card! Due date: ${new Date(data.loan.dueDate).toLocaleDateString()}. Zero interest.`;
          }
        } catch (e) {
          if (loanFeedback) {
            loanFeedback.className = "p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs block leading-relaxed";
            loanFeedback.innerHTML = `<b>✓ Micro-Credit Line Disbursed:</b> $${amount.toFixed(2)} USD successfully loaded to your PEG Virtual Card with 0% APR.`;
          }
        } finally {
          applyLoanBtn.removeAttribute("disabled");
          applyLoanBtn.textContent = "Apply & Disburse to PEG Virtual Card →";
        }
      });
    }

    recalculateLoan();
  }

  // 7. Footer Demonstrators (Virtual Card + Loan Card right in the footer!)
  private setupFooterDemonstrators() {
    // Initial sync
    const card = VIRTUAL_CARDS_DATA[0];
    this.syncFooterCardDemonstrator(card);
    this.syncFooterLoanDemonstrator(150, 14);

    const footerCardReveal = document.getElementById("footerCardRevealTrigger");
    if (footerCardReveal) {
      footerCardReveal.addEventListener("click", () => {
        this.isCardDetailsRevealed = !this.isCardDetailsRevealed;
        this.syncFooterCardDemonstrator(VIRTUAL_CARDS_DATA[this.activeCardIndex]);
      });
    }
  }

  private syncFooterCardDemonstrator(card: any) {
    const footerCardImg = document.getElementById("footerVirtualCardImg") as HTMLImageElement;
    const footerCardPan = document.getElementById("footerCardPan");
    const footerCardHolder = document.getElementById("footerCardHolder");
    if (footerCardImg) footerCardImg.src = card.svgPath;
    if (footerCardPan) footerCardPan.textContent = this.isCardDetailsRevealed ? card.fullNumber : card.number;
    if (footerCardHolder) footerCardHolder.textContent = card.holder;
  }

  private syncFooterLoanDemonstrator(amount: number, days: number) {
    const loanAmt = document.getElementById("footerLoanAmount");
    const loanDays = document.getElementById("footerLoanDuration");
    const loanRepay = document.getElementById("footerLoanRepayment");
    if (loanAmt) loanAmt.textContent = `$${amount.toFixed(2)}`;
    if (loanDays) loanDays.textContent = `${days} Days`;
    if (loanRepay) loanRepay.textContent = `$${amount.toFixed(2)} (0% APR)`;
  }

  // 8. Dedicated Pages for About, Privacy, Security, Terms, and Loan Policy
  private setupDedicatedPolicyPages() {
    const openPage = (pageId: string) => {
      // Hide all pages
      document.querySelectorAll(".policy-page-view").forEach((p) => p.classList.add("hidden"));
      const target = document.getElementById(`page-${pageId}`);
      if (target) {
        target.classList.remove("hidden");
        // Open the master policy modal container
        const modal = document.getElementById("masterPolicyPagesModal");
        if (modal) modal.classList.remove("hidden");
        // Update active nav tab
        document.querySelectorAll("[data-policy-tab]").forEach((tab) => {
          if (tab.getAttribute("data-policy-tab") === pageId) {
            tab.className = "px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-black transition cursor-pointer";
          } else {
            tab.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer";
          }
        });
      }
    };

    // Nav triggers
    document.querySelectorAll("[data-open-page]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const page = btn.getAttribute("data-open-page");
        if (page) openPage(page);
      });
    });

    // Policy Tab Switcher inside Modal
    document.querySelectorAll("[data-policy-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const page = tab.getAttribute("data-policy-tab");
        if (page) openPage(page);
      });
    });

    // Close Policy Modal
    const closeBtn = document.getElementById("closePolicyPagesModalBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modal = document.getElementById("masterPolicyPagesModal");
        if (modal) modal.classList.add("hidden");
      });
    }

    // Check hash on load
    const hash = window.location.hash.replace("#", "");
    if (["about", "privacy", "security", "terms", "loan-policy"].includes(hash)) {
      openPage(hash);
    }
  }
}

export const saasStorytelling = new SaasStorytellingEngine();
