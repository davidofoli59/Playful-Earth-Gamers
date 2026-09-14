export interface AssetFolderItem {
  name: string;
  folder: string;
  path: string;
  type: "image" | "video" | "logo" | "card" | "result";
  size?: string;
  badge?: string;
  description: string;
}

export const PLATFORM_ASSETS: AssetFolderItem[] = [
  // Videos Folder
  {
    name: "Official 4K Cinematic Trailer",
    folder: "/assets/videos",
    path: "/assets/videos/peg-trailer.mp4",
    type: "video",
    size: "212 KB",
    badge: "4K 60FPS",
    description: "Flagship esports tournament trailer with escrow arena visuals and cinematic audio track.",
  },
  {
    name: "Fluid 120 FPS Match Highlight",
    folder: "/assets/videos",
    path: "/assets/videos/gameplay-highlight.mp4",
    type: "video",
    size: "91 KB",
    badge: "120 FPS",
    description: "High-octane tournament gameplay capture with telemetry statistics and audio broadcast.",
  },
  {
    name: "Official Match Result VOD Proof",
    folder: "/assets/videos",
    path: "/assets/videos/results-proof-sample.mp4",
    type: "video",
    size: "99 KB",
    badge: "VOD PROOF",
    description: "Apex tournament semifinals video evidence recorded for instant opponent confirmation.",
  },
  {
    name: "Esports Arena Tournament Opener",
    folder: "/assets/videos",
    path: "/assets/videos/esports-intro.mp4",
    type: "video",
    size: "1.9 MB",
    badge: "BROADCAST",
    description: "Master arena competition entrance video sequence for major championship broadcasts.",
  },

  // Logos Folder
  {
    name: "PEG Master Emblem Logo",
    folder: "/assets/logos",
    path: "/assets/logos/peg-logo.svg",
    type: "logo",
    size: "1.4 KB",
    badge: "VECTOR SVG",
    description: "Official Playful Earth Gamers primary brand emblem with cyan-lime cyber glow.",
  },
  {
    name: "PEG Shield Crest",
    folder: "/assets/logos",
    path: "/assets/logos/peg-symbol.svg",
    type: "logo",
    size: "650 B",
    badge: "VECTOR SHIELD",
    description: "Cryptographic escrow shield icon for security seals and tournament badges.",
  },

  // Match Results Proof Folder
  {
    name: "Apex Predator Match Proof",
    folder: "/assets/results",
    path: "/assets/results/match_proof_apex.svg",
    type: "result",
    size: "4.5 KB",
    badge: "VERIFIED",
    description: "18-kill championship proof with cryptographic hash and $1,200 escrow verification.",
  },
  {
    name: "Velocity GP Telemetry Certificate",
    folder: "/assets/results",
    path: "/assets/results/match_proof_racing.svg",
    type: "result",
    size: "3.6 KB",
    badge: "TELEMETRY",
    description: "Sim racing split-second lap telemetry and mutual opponent sign-off verification.",
  },
  {
    name: "Valorant Swiss Bracket Evidence",
    folder: "/assets/results",
    path: "/assets/results/match_proof_valorant.svg",
    type: "result",
    size: "3.7 KB",
    badge: "DISPUTE LOG",
    description: "Round 22 dispute log and arbiter tick analysis certificate.",
  },
  {
    name: "Certified Arbiter Anti-Cheat Seal",
    folder: "/assets/results",
    path: "/assets/results/referee_anti_cheat_seal.svg",
    type: "result",
    size: "965 B",
    badge: "ARBITER SEAL",
    description: "Gold and emerald referee stamp for certified esports tournament bracket closures.",
  },

  // Virtual Cards Folder
  {
    name: "Black Titanium VIP Card",
    folder: "/assets/cards",
    path: "/assets/cards/peg-card-black-titanium.svg",
    type: "card",
    size: "6.5 KB",
    badge: "VIP CARD",
    description: "Ultra-premium brushed titanium virtual card with biometric and escrow settlement channels.",
  },
  {
    name: "Cyber Neon Gamer Pass",
    folder: "/assets/cards",
    path: "/assets/cards/peg-card-cyber-neon.svg",
    type: "card",
    size: "6.4 KB",
    badge: "ESPORTS PASS",
    description: "High-contrast luminescent cyber pass designed for instant tournament buy-ins.",
  },
  {
    name: "Aurora Gold Master Card",
    folder: "/assets/cards",
    path: "/assets/cards/peg-card-aurora-gold.svg",
    type: "card",
    size: "5.7 KB",
    badge: "FOUNDER",
    description: "Exclusive golden edition card minted for initial early bird members.",
  },

  // Images Folder
  {
    name: "Hero Montage Showcase",
    folder: "/assets/images",
    path: "/assets/images/peg_hero_montage_1789111768235.jpg",
    type: "image",
    size: "990 KB",
    badge: "HERO KEYART",
    description: "High-octane hero composition showcasing multigenre esports battles.",
  },
  {
    name: "Gamer Challenge Arena",
    folder: "/assets/images",
    path: "/assets/images/peg_gamer_challenge_1789111784294.jpg",
    type: "image",
    size: "881 KB",
    badge: "CHALLENGE",
    description: "Live competitive gaming arena with spectator HUD and synchronized telemetry.",
  },
  {
    name: "Portal Orb Cyber Nexus",
    folder: "/assets/images",
    path: "/assets/images/peg_portal_orb_1789111796928.jpg",
    type: "image",
    size: "1.1 MB",
    badge: "NEXUS",
    description: "Esports portal core channeling live game odds and micro-credit liquidity.",
  },
  {
    name: "Battle Royale Cover",
    folder: "/assets/images",
    path: "/assets/images/cat_battle_royale_1789111816039.jpg",
    type: "image",
    size: "1.0 MB",
    badge: "CATEGORY",
    description: "Tactical drop zones and squad showdowns.",
  },
  {
    name: "Sim Racing Horizon",
    folder: "/assets/images",
    path: "/assets/images/cat_racing_1789111828418.jpg",
    type: "image",
    size: "1.0 MB",
    badge: "CATEGORY",
    description: "Precision track telemetry and hyper-realistic physics racing.",
  },
  {
    name: "Tactical FPS Warfront",
    folder: "/assets/images",
    path: "/assets/images/cat_fps_1789111852654.jpg",
    type: "image",
    size: "851 KB",
    badge: "CATEGORY",
    description: "5v5 defuse and clutch-play competitive FPS arena.",
  },
  {
    name: "Asteroid 3D Track OEM",
    folder: "/assets/images",
    path: "/assets/images/asteroid_oem_track_1789230186421.jpg",
    type: "image",
    size: "762 KB",
    badge: "OEM 3D",
    description: "Photorealistic OEM track telemetry rendering of Asteroid esports racer.",
  },
];

// Setup Video Player Launcher helper
export function playPlatformVideo(videoPath: string, title?: string) {
  const modal = document.getElementById("pegVideoModal");
  const videoPlayer = (document.getElementById("pegActiveVideo") || document.getElementById("pegModalVideoPlayer")) as HTMLVideoElement | null;
  const titleEl = document.getElementById("videoModalTitle") || document.getElementById("pegModalVideoTitle");
  const pathEl = document.getElementById("videoModalPath");

  if (!modal || !videoPlayer) return;

  if (titleEl) {
    titleEl.textContent = title || "Official PEG 4K Stream";
  }
  if (pathEl) {
    pathEl.textContent = videoPath;
  }

  videoPlayer.src = videoPath;
  videoPlayer.load();
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  videoPlayer.play().catch((err) => {
    console.warn("Autoplay notice (audio requires user interaction):", err);
  });
}

// Close Video Player
export function closePlatformVideo() {
  const modal = document.getElementById("pegVideoModal");
  const videoPlayer = (document.getElementById("pegActiveVideo") || document.getElementById("pegModalVideoPlayer")) as HTMLVideoElement | null;

  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  }
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
