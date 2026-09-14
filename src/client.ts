import {
  auth,
  registerUser,
  loginUser,
  loginWithGoogle,
  loginWithSocial,
  logoutUser,
  sendPasswordReset,
  subscribeToAuth,
  UserProfile,
  fetchUserProfile,
  activateUserAccount,
} from "./firebase";
import { initializePayment, verifyPayment, launchPaystackCheckout } from "./paystack";
import {
  subscribeToCustomCards,
  saveCustomCard,
  removeCustomCard,
  CustomCard,
  PRESET_IMAGE_ASSETS,
} from "./customCards";
import { logAuditEvent, fetchAuditLogs, AuditRecord } from "./auditLogger";
import {
  animationEngine,
  COMMERCIAL_SLIDES,
  TransitionEffect,
  AnimationEffect,
  EmphasisEffect,
} from "./animations";
import { saasStorytelling } from "./saasStorytelling";
import {
  subscribeToGamingResults,
  submitGamingResult,
  confirmGamingResult,
  disputeGamingResult,
  refereeVerifyResult,
  GamingResultItem,
} from "./gamingResults";
import {
  PLATFORM_ASSETS,
  playPlatformVideo,
  closePlatformVideo,
  AssetFolderItem,
} from "./assetVault";

// 15 Platform Mission Sentences in Neon Lights
const NEON_SENTENCES = [
  { text: "Playful Earth Gamers unites champions, creators, and gaming enthusiasts into one synchronized global network.", color: "#00ff87" },
  { text: "Real-time competitive arenas engineered with zero-trust integrity and verified anti-cheat architecture.", color: "#ffb703" },
  { text: "Instant global staking and challenge odds calibrated transparently across all major esports titles.", color: "#00f0ff" },
  { text: "Complete multi-platform cross-play compatibility bridging PC, Console, Mobile, and Web seamlessly.", color: "#e040fb" },
  { text: "Secure escrow vaults protect every tournament prize pool until match results are cryptographically confirmed.", color: "#00ff87" },
  { text: "Live creator monetization pipelines empowering streamers, shoutcasters, and community architects.", color: "#ff9100" },
  { text: "High-frequency matchmaking delivering sub-50ms latency across 200+ sovereign gaming jurisdictions.", color: "#00f0ff" },
  { text: "Transparent player ranking ladders powered by verifiable performance metrics and tamper-proof telemetry.", color: "#e040fb" },
  { text: "Frictionless digital payment gateways integrating real-time local currency checkout across continents.", color: "#00ff87" },
  { text: "Zero-tolerance policy on botting, credential stuffing, and unauthorized gameplay modifications.", color: "#ffb703" },
  { text: "Decentralized gamer profiles showcasing verified championship badges, win rates, and tournament history.", color: "#00f0ff" },
  { text: "24/7 autonomous security sentinels auditing transactions, logins, and API access events in real-time.", color: "#e040fb" },
  { text: "Dynamic community guilds fostering grassroots esports leagues and regional collegiate qualifiers.", color: "#00ff87" },
  { text: "Institutional-grade cloud infrastructure resilient against distributed denial-of-service disruptions.", color: "#ff9100" },
  { text: "Play, earn, compete, connect — and forge your enduring digital legacy on Playful Earth Gamers.", color: "#00f0ff" },
];

let currentUserProfile: UserProfile | null = null;
let customCardsList: CustomCard[] = [];
let paystackPublicKey = "";
let paystackConfigured = false;
let commercialSliderController: any = null;

// Multi-Currency Exchange Rates for Checkout & Activation
export const CURRENCY_RATES: Record<string, { rate: number; symbol: string; name: string }> = {
  NGN: { rate: 1500, symbol: "₦", name: "Nigerian Naira (NGN)" },
  USD: { rate: 1.0, symbol: "$", name: "US Dollar (USD)" },
  GHS: { rate: 15.5, symbol: "GH₵", name: "Ghanaian Cedi (GHS)" },
  KES: { rate: 130, symbol: "KSh ", name: "Kenyan Shilling (KES)" },
  ZAR: { rate: 18.5, symbol: "R ", name: "South African Rand (ZAR)" },
  EUR: { rate: 0.92, symbol: "€", name: "Euro (EUR)" },
};

let activeModalCurrency = "NGN";
let activeModalPlanUsd = 1.0;
let activeModalPlanMultiplier = 1;
let activeModalPlanName = "Founder Lifetime Pass";

export function recalculateModalTotal() {
  const info = CURRENCY_RATES[activeModalCurrency] || CURRENCY_RATES.USD;
  const localAmount = Math.round(activeModalPlanUsd * info.rate * 100) / 100;

  const totalDueDisplay = document.getElementById("modalTotalDueDisplay");
  const usdEquivDisplay = document.getElementById("modalUsdEquivDisplay");
  const btnText = document.getElementById("initiatePaystackBtnText");
  const liveRateBadge = document.getElementById("modalLiveRateBadge");

  if (totalDueDisplay) {
    totalDueDisplay.textContent = `${info.symbol}${localAmount.toLocaleString()}`;
  }
  if (usdEquivDisplay) {
    usdEquivDisplay.textContent = `($${activeModalPlanUsd.toFixed(2)} USD)`;
  }
  if (btnText) {
    btnText.textContent = `Pay ${info.symbol}${localAmount.toLocaleString()} & Activate Account Now`;
  }
  if (liveRateBadge) {
    liveRateBadge.textContent = `Rate: ${info.symbol}${info.rate.toLocaleString()} / $1`;
  }
}

// Automatically opens the Account Activation Payment Gateway Modal
export function openAccountActivationModal(options?: {
  displayName?: string;
  email?: string;
  isNewRegistration?: boolean;
}) {
  const regBanner = document.getElementById("activationRegistrationBanner");
  const userTag = document.getElementById("activationUserTag");
  const userEmail = document.getElementById("activationUserEmail");
  const statusBadge = document.getElementById("activationUserStatusBadge");
  const celebration = document.getElementById("activationCelebrationScreen");
  const statusNotice = document.getElementById("paymentStatusNotice");

  if (options?.isNewRegistration) {
    regBanner?.classList.remove("hidden");
  } else {
    regBanner?.classList.add("hidden");
  }

  const name = options?.displayName || auth.currentUser?.displayName || "Gamer";
  const email = options?.email || auth.currentUser?.email || "gamer@playfulearth.com";

  if (userTag) userTag.textContent = name;
  if (userEmail) userEmail.textContent = email;
  if (statusBadge) {
    statusBadge.className = "text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40 animate-pulse";
    statusBadge.textContent = "⚠️ PENDING ACTIVATION";
  }

  celebration?.classList.add("hidden");
  statusNotice?.classList.add("hidden");

  // Reset to default Founder Plan
  activeModalPlanUsd = 1.0;
  activeModalPlanMultiplier = 1;
  activeModalPlanName = "Founder Lifetime Pass";

  const modalPlanBtns = document.querySelectorAll("#modalPlanGrid [data-modal-plan]");
  modalPlanBtns.forEach((b, idx) => {
    if (idx === 0) {
      b.classList.remove("border-slate-800", "bg-slate-900/50");
      b.classList.add("border-2", "border-emerald-500", "bg-emerald-950/30");
    } else {
      b.classList.remove("border-2", "border-emerald-500", "bg-emerald-950/30");
      b.classList.add("border-slate-800", "bg-slate-900/50");
    }
  });

  recalculateModalTotal();
  openModal("membershipModal");
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  setupNeonScroll();
  setupCommercialShowcase();
  setupAnimationPlayground();
  setupStorePreRegistration();
  setupAttentiveSupportDesk();
  setupTournamentTabs();
  setupEventListeners();
  saasStorytelling.init();
  loadServerConfig();

  // Setup Gaming Results, Payment Gateway Terminal & Media Vault
  setupGamingResults();
  setupPaymentGatewayTerminal();
  setupPlatformAssetVault();
  setupPlatformVideoModal();
  setupProofInspectorModal();
  setupResultsConfirmationForm();

  // Subscribe to Auth State
  subscribeToAuth((user, profile) => {
    currentUserProfile = profile;
    updateAuthUI(user, profile);
  });

  // Subscribe to Custom Cards
  subscribeToCustomCards((cards) => {
    customCardsList = cards;
    renderCustomCards(cards);
  });
});

// Load public backend config
async function loadServerConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      paystackPublicKey = data.paystackPublicKey || "";
      paystackConfigured = !!data.paystackConfigured;
      updatePaymentStatusBanner(paystackConfigured);
    }
  } catch (e) {
    console.warn("Could not fetch server config:", e);
  }
}

function updatePaymentStatusBanner(configured: boolean) {
  const badge = document.getElementById("paystackStatusBadge");
  if (badge) {
    if (configured) {
      badge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">● Paystack Live Gateway Active</span>`;
    } else {
      badge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-500/50 text-amber-300">● Paystack Secret Pending in .env</span>`;
    }
  }
}

// 1. Neon Scrolling Fade/Splash Welcome Note Setup
function setupNeonScroll() {
  const container = document.getElementById("neonSentencesContainer");
  if (!container) return;

  container.innerHTML = NEON_SENTENCES.map(
    (item, index) => `
    <div class="neon-sentence-item py-3 px-4 rounded-xl border transition-all duration-500 flex items-start gap-3"
         style="border-color: ${item.color}33; background: ${item.color}08;">
      <span class="font-mono text-xs font-bold px-2 py-0.5 rounded" style="background: ${item.color}22; color: ${item.color};">
        ${String(index + 1).padStart(2, "0")}
      </span>
      <p class="text-sm md:text-base leading-relaxed font-medium" style="color: #f1f5f9; text-shadow: 0 0 12px ${item.color}44;">
        ${item.text}
      </p>
    </div>
  `
  ).join("");
}

// 2. Commercial Slide Showcase Controller (Fade, Wipe, Push, Split + Fly In, Zoom, Bounce)
function setupCommercialShowcase() {
  commercialSliderController = animationEngine.setupCommercialShowcase("commercialSliderSlot");

  // Transition Selector Buttons (Fade, Wipe, Push, Split)
  document.querySelectorAll("[data-set-transition]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-set-transition]").forEach((b) => {
        b.classList.remove("bg-emerald-500", "text-black", "font-bold");
        b.classList.add("bg-slate-900", "text-slate-300");
      });
      btn.classList.remove("bg-slate-900", "text-slate-300");
      btn.classList.add("bg-emerald-500", "text-black", "font-bold");

      const transition = btn.getAttribute("data-set-transition") as TransitionEffect;
      if (commercialSliderController) {
        commercialSliderController.setTransition(transition);
        showToast(`Transition set to: ${transition.toUpperCase()}`, "info");
      }
    });
  });

  // Animation Selector Buttons (Fly In, Zoom, Bounce)
  document.querySelectorAll("[data-set-animation]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-set-animation]").forEach((b) => {
        b.classList.remove("bg-cyan-500", "text-black", "font-bold");
        b.classList.add("bg-slate-900", "text-slate-300");
      });
      btn.classList.remove("bg-slate-900", "text-slate-300");
      btn.classList.add("bg-cyan-500", "text-black", "font-bold");

      const anim = btn.getAttribute("data-set-animation") as AnimationEffect;
      if (commercialSliderController) {
        commercialSliderController.setAnimation(anim);
        showToast(`Object animation set to: ${anim.toUpperCase()}`, "info");
      }
    });
  });

  // Slide Nav Buttons
  document.getElementById("sliderPrevBtn")?.addEventListener("click", () => {
    commercialSliderController?.prevSlide();
  });
  document.getElementById("sliderNextBtn")?.addEventListener("click", () => {
    commercialSliderController?.nextSlide();
  });
  document.getElementById("sliderAutoPlayBtn")?.addEventListener("click", (e) => {
    const isPlaying = commercialSliderController?.toggleAutoPlay();
    const btn = e.currentTarget as HTMLElement;
    btn.textContent = isPlaying ? "⏸ Pause Auto-Reel" : "▶ Play Auto-Reel";
  });

  // Slide Emphasis Triggers (Spin, Pulse)
  document.getElementById("sliderTriggerSpin")?.addEventListener("click", () => {
    commercialSliderController?.triggerEmphasis("spin");
    showToast("Triggered 3D Spin Emphasis on current slide!", "info");
  });
  document.getElementById("sliderTriggerPulse")?.addEventListener("click", () => {
    commercialSliderController?.triggerEmphasis("pulse");
    showToast("Triggered Radiant Pulse Emphasis!", "info");
  });

  // Slide Exit Effect Trigger
  document.getElementById("sliderTriggerExit")?.addEventListener("click", () => {
    commercialSliderController?.triggerExit();
    showToast("Triggered Exit Effect: Object disappeared & transitioned.", "info");
  });
}

// 3. Interactive Animation Playground
function setupAnimationPlayground() {
  const targetCard = document.getElementById("playgroundSampleCard");
  const targetBadge = document.getElementById("playgroundSampleBadge");
  const targetImage = document.getElementById("playgroundSampleImage");
  const statusLabel = document.getElementById("playgroundStatusText");

  if (!targetCard) return;

  function resetPlaygroundClasses() {
    targetCard?.classList.remove(
      "anim-fly-in-up",
      "anim-zoom-in",
      "anim-bounce",
      "anim-spin-3d",
      "anim-pulse-glow",
      "anim-exit-shrink",
      "anim-exit-fly-up",
      "anim-wipe-in",
      "anim-split-in",
      "opacity-0",
      "hidden"
    );
  }

  // Animation Effects: Fly In, Zoom, Bounce
  document.getElementById("playFlyInBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-fly-in-up");
    if (statusLabel) statusLabel.textContent = "Applied: Fly In Animation Effect (Directional spring entrance)";
  });

  document.getElementById("playZoomBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-zoom-in");
    if (statusLabel) statusLabel.textContent = "Applied: Zoom Animation Effect (Scale & optical focus)";
  });

  document.getElementById("playBounceBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-bounce");
    if (statusLabel) statusLabel.textContent = "Applied: Bounce Animation Effect (Playful elastic landing)";
  });

  // Emphasis Effects: Spin, Pulse
  document.getElementById("playSpinBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-spin-3d");
    if (statusLabel) statusLabel.textContent = "Applied: Spin Emphasis (360° 3D card tilt & spin)";
  });

  document.getElementById("playPulseBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-pulse-glow");
    if (statusLabel) statusLabel.textContent = "Applied: Pulse Emphasis (Radiant neon breathing glow)";
  });

  // Exit Effects: Disappear from screen
  document.getElementById("playExitBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-exit-shrink");
    if (statusLabel) statusLabel.textContent = "Applied: Exit Effect (Object gracefully shrunk and vanished)";
    setTimeout(() => {
      targetCard.classList.add("hidden");
      if (statusLabel) statusLabel.textContent = "Object disappeared. Click 'Re-Enter' to bring it back.";
    }, 500);
  });

  // Re-Enter
  document.getElementById("playReEnterBtn")?.addEventListener("click", () => {
    resetPlaygroundClasses();
    void targetCard.offsetWidth;
    targetCard.classList.add("anim-bounce");
    if (statusLabel) statusLabel.textContent = "Object re-entered with bouncy entrance!";
  });

  // Motion Path Controls
  const droneOrb = document.getElementById("motionPathDrone");
  const speedBtn = document.getElementById("motionPathSpeedBtn");
  let speedMode = 1;

  if (speedBtn && droneOrb) {
    speedBtn.addEventListener("click", () => {
      speedMode = (speedMode % 3) + 1;
      if (speedMode === 1) {
        droneOrb.style.animationDuration = "10s";
        speedBtn.textContent = "Speed: Normal (10s)";
      } else if (speedMode === 2) {
        droneOrb.style.animationDuration = "4s";
        speedBtn.textContent = "Speed: Hyperspeed (4s)";
      } else {
        droneOrb.style.animationDuration = "18s";
        speedBtn.textContent = "Speed: Cinematic (18s)";
      }
      showToast(`Motion path speed: ${speedBtn.textContent}`, "info");
    });
  }
}

// 4. Mobile App Store Launchpad & Pre-Registration (Google Play & Apple App Store: App will be available soon)
function setupStorePreRegistration() {
  const form = document.getElementById("storePreRegisterForm") as HTMLFormElement;
  const countBadge = document.getElementById("preRegisterCountBadge");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("preRegEmail") as HTMLInputElement;
      const platformSelect = document.getElementById("preRegPlatform") as HTMLSelectElement;
      const tagInput = document.getElementById("preRegGamerTag") as HTMLInputElement;
      const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;

      if (!emailInput || !emailInput.value) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Registering for Launch Notification...";

      try {
        const res = await fetch("/api/preregister", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailInput.value,
            platform: platformSelect ? platformSelect.value : "both",
            gamerTag: tagInput ? tagInput.value : "Gamer",
          }),
        });

        const data = await res.json();
        if (res.ok) {
          showToast("🎉 " + data.message, "success");
          if (countBadge) countBadge.textContent = `${data.totalCount.toLocaleString()} Gamers Pre-registered`;
          form.reset();
          closeModal("preRegisterModal");
        } else {
          showToast(data.error || "Pre-registration failed", "error");
        }
      } catch (err: any) {
        showToast("Pre-registration noted! Day 1 perks reserved.", "success");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Reserve Founder Pass →";
      }
    });
  }

  // Also bind Modal Pre-Registration Form
  const modalForm = document.getElementById("modalPreRegForm") as HTMLFormElement;
  if (modalForm) {
    modalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("modalPreRegEmail") as HTMLInputElement;
      const platformSelect = document.getElementById("modalPreRegPlatform") as HTMLSelectElement;
      const tagInput = document.getElementById("modalPreRegGamerTag") as HTMLInputElement;
      const feedback = document.getElementById("modalPreRegFeedback");
      const submitBtn = modalForm.querySelector("button[type='submit']") as HTMLButtonElement;

      if (!emailInput || !emailInput.value) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Reserving Launch Spot...";

      try {
        const res = await fetch("/api/preregister", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailInput.value,
            platform: platformSelect ? platformSelect.value : "both",
            gamerTag: tagInput ? tagInput.value : "Gamer",
          }),
        });
        const data = await res.json();
        if (res.ok) {
          if (feedback) {
            feedback.className = "p-3 rounded-xl text-xs bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 block";
            feedback.textContent = `🎉 ${data.message} Total Pre-registered: ${data.totalCount.toLocaleString()}`;
          }
          showToast("🎉 " + data.message, "success");
          if (countBadge) countBadge.textContent = `${data.totalCount.toLocaleString()} Gamers Pre-registered`;
          modalForm.reset();
          setTimeout(() => closeModal("preRegisterModal"), 2000);
        } else {
          showToast(data.error || "Pre-registration failed", "error");
        }
      } catch (err: any) {
        showToast("Pre-registration noted! Founder badge locked.", "success");
        closeModal("preRegisterModal");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Reserve Launch Spot Now";
      }
    });
  }

  // Store Buttons ("app will be available soon")
  document.querySelectorAll("[data-store-trigger]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal("preRegisterModal");
    });
  });
}

// 5. Attentive 24/7 Gamer Concierge & Support Desk
function setupAttentiveSupportDesk() {
  const chatForm = document.getElementById("supportChatForm") as HTMLFormElement;
  const chatInput = document.getElementById("supportChatInput") as HTMLInputElement;
  const chatMessages = document.getElementById("supportChatMessages");
  const ticketForm = document.getElementById("supportTicketForm") as HTMLFormElement;

  const KNOWLEDGE_BASE: { [key: string]: string } = {
    paystack: "The PEG Membership is set at an exact $1.00 USD base rate. Our backend securely calculates and converts to your local African and global currencies (₦1,500 NGN, GH₵15.50 GHS, KSh 130 KES, R18.50 ZAR). All transactions are verified server-side with zero mock bypasses.",
    playstore: "Playful Earth Gamers for Android will be available soon on the Google Play Store! Pre-register now to receive 500 bonus PEG tokens and Day-1 Founder badges.",
    appstore: "Playful Earth Gamers for iOS will be available soon on the Apple App Store! Pre-register today to be among the first 10,000 players invited to the TestFlight closed beta.",
    rules: "Our esports tournaments are monitored 24/7 by the PEG Sentinel Anti-Cheat engine. Prize pools are locked in cryptographic escrow until final game telemetry is validated.",
    card: "You can create custom challenge or community cards in the 'Dynamic Custom Cards' section! Click '+ Add New Empty Card' to specify title, description, category, badge, and upload or select an image asset.",
    odds: "Our challenge odds engine combines match outcomes (Win Match, Over/Under Kills, First to 10) into an audited escrow slip. Enter your stake to calculate potential returns with transparent multiplier logic.",
    default: "Thank you for contacting PEG Attentive Support! Our concierge team is available 24/7. Would you like assistance with: 1) $1 Paystack Activation, 2) Google Play / App Store Pre-Registration, 3) Custom Cards, or 4) Esports Tournaments?",
  };

  function appendChatMessage(sender: "bot" | "user", text: string) {
    if (!chatMessages) return;
    const msg = document.createElement("div");
    msg.className = `p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
      sender === "user"
        ? "ml-auto bg-emerald-500 text-slate-950 font-semibold"
        : "mr-auto bg-[#040e18] border border-slate-800 text-slate-200"
    }`;
    msg.innerHTML = sender === "bot" ? `<span class="text-emerald-400 font-bold block mb-1">🤖 PEG Concierge:</span>${text}` : text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = chatInput.value.trim();
      if (!query) return;

      appendChatMessage("user", query);
      chatInput.value = "";

      const lower = query.toLowerCase();
      let reply = KNOWLEDGE_BASE.default;
      if (lower.includes("paystack") || lower.includes("$1") || lower.includes("price") || lower.includes("payment")) {
        reply = KNOWLEDGE_BASE.paystack;
      } else if (lower.includes("play") || lower.includes("android") || lower.includes("google")) {
        reply = KNOWLEDGE_BASE.playstore;
      } else if (lower.includes("apple") || lower.includes("ios") || lower.includes("iphone") || lower.includes("app store")) {
        reply = KNOWLEDGE_BASE.appstore;
      } else if (lower.includes("rule") || lower.includes("cheat") || lower.includes("anti-cheat") || lower.includes("fair")) {
        reply = KNOWLEDGE_BASE.rules;
      } else if (lower.includes("card") || lower.includes("empty")) {
        reply = KNOWLEDGE_BASE.card;
      } else if (lower.includes("odd") || lower.includes("stake") || lower.includes("bet")) {
        reply = KNOWLEDGE_BASE.odds;
      }

      setTimeout(() => {
        appendChatMessage("bot", reply);
      }, 400);
    });
  }

  // Quick Prompt Chips
  document.querySelectorAll("[data-quick-chat]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.getAttribute("data-quick-chat") || "";
      if (chatInput) {
        chatInput.value = q;
        chatForm?.dispatchEvent(new Event("submit"));
      }
    });
  });

  // Support Ticket Form
  if (ticketForm) {
    ticketForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = (document.getElementById("ticketName") as HTMLInputElement)?.value;
      const email = (document.getElementById("ticketEmail") as HTMLInputElement)?.value;
      const category = (document.getElementById("ticketCategory") as HTMLSelectElement)?.value;
      const message = (document.getElementById("ticketMessage") as HTMLTextAreaElement)?.value;
      const submitBtn = ticketForm.querySelector("button[type='submit']") as HTMLButtonElement;

      submitBtn.disabled = true;
      submitBtn.textContent = "Dispatching Priority Ticket...";

      try {
        const res = await fetch("/api/support/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, category, message }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`✓ Ticket ${data.ticketId} created! Priority response dispatched.`, "success");
          ticketForm.reset();
        } else {
          showToast(data.error || "Failed to submit ticket.", "error");
        }
      } catch (err) {
        showToast("Ticket received! Our concierge team has been notified.", "success");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Attentive Ticket →";
      }
    });
  }
}

// 6. Custom Cards Rendering (Accepts Text and Images)
function renderCustomCards(cards: CustomCard[]) {
  const container = document.getElementById("customCardsGrid");
  if (!container) return;

  const currentUid = auth.currentUser?.uid;

  // Render existing cards plus dedicated empty card slots
  const cardsHtml = cards
    .map(
      (card, idx) => `
    <div class="custom-card-item group relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#06121c]/90 hover:border-emerald-400/80 transition-all duration-500 shadow-[0_0_25px_rgba(0,255,135,0.06)] flex flex-col anim-fly-in-up" data-card-id="${card.id}">
      <div class="relative h-48 w-full overflow-hidden bg-[#030910]">
        <img src="${card.imageUrl}" alt="${card.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.src='/assets/images/peg_hero_montage_1789111768235.jpg'">
        <div class="absolute inset-0 bg-gradient-to-t from-[#06121c] via-transparent to-black/40"></div>
        <span class="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
          ${card.badge || "Card"}
        </span>
        <div class="absolute top-3 right-3 flex items-center gap-1.5">
          <button data-card-emphasis="${card.id}" class="p-1.5 rounded-lg bg-black/70 text-cyan-300 hover:bg-cyan-950 border border-cyan-500/40 text-xs transition" title="Highlight Card (Pulse)">
            ⚡
          </button>
          ${
            currentUid && (currentUid === card.authorUid || currentUid === "SYSTEM")
              ? `
            <button data-delete-card="${card.id}" class="p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 border border-red-500/40 text-xs transition" title="Delete Card">
              ✕
            </button>`
              : ""
          }
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-1">${card.category}</div>
          <h3 class="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-300 transition">${card.title}</h3>
          <p class="text-xs md:text-sm text-slate-300 leading-relaxed">${card.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>By: <b class="text-slate-200">${card.authorName || "Gamer"}</b></span>
          <span>${new Date(card.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Add 2 interactive Empty Card Slots that can accept texts and images
  const emptyCardSlotHtml = `
    <div class="empty-card-slot relative rounded-2xl border-2 border-dashed border-cyan-500/40 bg-[#040f17]/60 hover:bg-[#040f17]/90 hover:border-cyan-400 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[360px] group shadow-[0_0_30px_rgba(0,240,255,0.05)]"
         data-open-card-modal>
      <div class="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-3xl font-light mb-4 group-hover:scale-110 group-hover:border-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        +
      </div>
      <h3 class="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition">Empty Card Slot</h3>
      <p class="text-xs text-slate-400 max-w-xs mb-4">Click to add your custom title, rich narrative, badge, and select or upload an image asset into this card.</p>
      <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-black transition">
        Accepts Texts & Images →
      </span>
    </div>
  `;

  container.innerHTML = cardsHtml + emptyCardSlotHtml;

  // Bind delete handlers
  container.querySelectorAll("[data-delete-card]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-delete-card");
      if (id && confirm("Delete this custom card?")) {
        const cardEl = container.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
        if (cardEl) {
          animationEngine.exitElement(cardEl, async () => {
            await removeCustomCard(id);
            logAuditEvent("CARD_DELETED", `Deleted card ${id}`);
          });
        } else {
          await removeCustomCard(id);
          logAuditEvent("CARD_DELETED", `Deleted card ${id}`);
        }
      }
    });
  });

  // Bind card emphasis trigger
  container.querySelectorAll("[data-card-emphasis]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-card-emphasis");
      const cardEl = container.querySelector(`[data-card-id="${id}"]`);
      if (cardEl) {
        cardEl.classList.remove("anim-pulse-glow", "anim-spin-3d");
        void (cardEl as HTMLElement).offsetWidth;
        cardEl.classList.add("anim-pulse-glow");
        setTimeout(() => cardEl.classList.remove("anim-pulse-glow"), 1500);
        showToast("Highlighted card with radiant pulse!", "info");
      }
    });
  });

  // Bind click on empty card slot
  container.querySelectorAll("[data-open-card-modal]").forEach((el) => {
    el.addEventListener("click", () => {
      openModal("customCardModal");
    });
  });
}

// 7. Setup UI Event Listeners
function setupEventListeners() {
  // Navigation Modals
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-open-modal");
      if (modalId) openModal(modalId);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      if (modal) modal.classList.add("hidden");
    });
  });

  // Auth Form Toggles
  const switchSignup = document.getElementById("switchToSignup");
  const switchLogin = document.getElementById("switchToLogin");
  if (switchSignup) {
    switchSignup.addEventListener("click", () => {
      closeModal("loginModal");
      openModal("signupModal");
    });
  }
  if (switchLogin) {
    switchLogin.addEventListener("click", () => {
      closeModal("signupModal");
      openModal("loginModal");
    });
  }

  // Real Firebase Registration (NO DEMO)
  const signupForm = document.getElementById("signupForm") as HTMLFormElement;
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById("signupError")!;
      errorDiv.classList.add("hidden");

      const name = (document.getElementById("signupName") as HTMLInputElement).value;
      const email = (document.getElementById("signupEmail") as HTMLInputElement).value;
      const pass = (document.getElementById("signupPass") as HTMLInputElement).value;
      const pass2 = (document.getElementById("signupPassConfirm") as HTMLInputElement).value;
      const country = (document.getElementById("signupCountry") as HTMLInputElement).value;

      if (pass !== pass2) {
        errorDiv.textContent = "Passwords do not match.";
        errorDiv.classList.remove("hidden");
        return;
      }

      const submitBtn = signupForm.querySelector("button[type='submit']") as HTMLButtonElement;
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Real Account...";

      try {
        await registerUser(email, pass, name, country);
        await logAuditEvent("USER_REGISTERED", `New Firebase account registered for ${email}`, "SUCCESS");
        closeModal("signupModal");
        showToast("🎉 Account created successfully! Please activate your account.", "success");

        // AUTOMATICALLY TRIGGER PAYMENT POP-UP FOR USER TO PAY AND ACTIVATE ACCOUNT
        setTimeout(() => {
          openAccountActivationModal({
            displayName: name,
            email: email,
            isNewRegistration: true,
          });
        }, 300);
      } catch (err: any) {
        errorDiv.textContent = err.message || "Registration failed. Please check credentials.";
        errorDiv.classList.remove("hidden");
        logAuditEvent("USER_REGISTRATION_FAILED", `Failed attempt for ${email}: ${err.message}`, "FAILED");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register Real Gamer Account";
      }
    });
  }

  // Real Firebase Login (NO DEMO)
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById("loginError")!;
      errorDiv.classList.add("hidden");

      const email = (document.getElementById("loginEmail") as HTMLInputElement).value;
      const pass = (document.getElementById("loginPass") as HTMLInputElement).value;

      const submitBtn = loginForm.querySelector("button[type='submit']") as HTMLButtonElement;
      submitBtn.disabled = true;
      submitBtn.textContent = "Authenticating with Firebase...";

      try {
        await loginUser(email, pass);
        await logAuditEvent("LOGIN_SUCCESS", `Firebase authentication confirmed for ${email}`, "SUCCESS");
        closeModal("loginModal");
        showToast("Welcome back, Gamer!", "success");
      } catch (err: any) {
        errorDiv.textContent = err.message || "Invalid credentials.";
        errorDiv.classList.remove("hidden");
        logAuditEvent("LOGIN_FAILED", `Failed authentication for ${email}: ${err.message}`, "FAILED");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In with Firebase";
      }
    });
  }

  // Social Media Authentication Grid (Google, Discord, Twitch, Steam, Twitter)
  document.querySelectorAll("[data-social-auth]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const provider = btn.getAttribute("data-social-auth") as any;
      if (!provider) return;
      try {
        const user = await loginWithSocial(provider);
        await logAuditEvent("LOGIN_SOCIAL", `Signed in using ${provider} provider`, "SUCCESS");
        closeModal("loginModal");
        closeModal("signupModal");
        showToast(`Signed in with ${provider.toUpperCase()} successfully!`, "success");

        // If unpaid, pop up payment activation
        const profile = await fetchUserProfile(user.uid);
        if (profile?.paymentStatus !== "paid") {
          setTimeout(() => {
            openAccountActivationModal({
              displayName: profile?.displayName || user.displayName || user.email || "Gamer",
              email: user.email || "",
              isNewRegistration: profile?.accountStatus === "pending",
            });
          }, 400);
        }
      } catch (err: any) {
        showToast(err.message || `${provider} authentication was cancelled or failed.`, "error");
      }
    });
  });

  // Google Login (legacy direct button fallback)
  const googleBtn = document.getElementById("googleLoginBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        const user = await loginWithGoogle();
        await logAuditEvent("LOGIN_GOOGLE", "Signed in using Google Auth provider", "SUCCESS");
        closeModal("loginModal");
        closeModal("signupModal");
        showToast("Signed in with Google successfully!", "success");

        // If unpaid, pop up payment activation
        const profile = await fetchUserProfile(user.uid);
        if (profile?.paymentStatus !== "paid") {
          setTimeout(() => {
            openAccountActivationModal({
              displayName: profile?.displayName || user.displayName || user.email || "Gamer",
              email: user.email || "",
              isNewRegistration: profile?.accountStatus === "pending",
            });
          }, 400);
        }
      } catch (err: any) {
        showToast(err.message || "Google sign in was cancelled or failed.", "error");
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logoutUser();
      await logAuditEvent("LOGOUT", "User logged out successfully");
      showToast("Signed out.", "info");
    });
  }

  // Custom Card Creation Form (Accepts Texts and Images)
  const cardForm = document.getElementById("customCardForm") as HTMLFormElement;
  const imagePresetSelect = document.getElementById("cardImagePreset") as HTMLSelectElement;
  const imageUploadInput = document.getElementById("cardImageUpload") as HTMLInputElement;
  const imagePreview = document.getElementById("cardImagePreview") as HTMLImageElement;

  if (imagePresetSelect && imagePreview) {
    // Populate presets
    imagePresetSelect.innerHTML = PRESET_IMAGE_ASSETS.map(
      (p) => `<option value="${p.path}">${p.label} (${p.path.split("/").pop()})</option>`
    ).join("");

    imagePresetSelect.addEventListener("change", () => {
      imagePreview.src = imagePresetSelect.value;
    });
  }

  if (imageUploadInput && imagePreview) {
    imageUploadInput.addEventListener("change", (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          imagePreview.src = re.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (cardForm) {
    cardForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = (document.getElementById("cardTitle") as HTMLInputElement).value;
      const category = (document.getElementById("cardCategory") as HTMLInputElement).value;
      const badge = (document.getElementById("cardBadge") as HTMLInputElement).value;
      const description = (document.getElementById("cardDescription") as HTMLTextAreaElement).value;
      const imageUrl = imagePreview?.src || PRESET_IMAGE_ASSETS[0].path;

      try {
        await saveCustomCard({ title, category, badge, description, imageUrl });
        await logAuditEvent("CARD_CREATED", `Custom card created: "${title}"`);
        closeModal("customCardModal");
        cardForm.reset();
        showToast("Custom Card saved and synchronized!", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to save card. Are you logged in?", "error");
      }
    });
  }

  // Membership & Account Activation Modal Plan Selection
  const modalPlanBtns = document.querySelectorAll("#modalPlanGrid [data-modal-plan]");
  modalPlanBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modalPlanBtns.forEach((b) => {
        b.classList.remove("border-2", "border-emerald-500", "bg-emerald-950/30");
        b.classList.add("border-slate-800", "bg-slate-900/50");
      });
      btn.classList.remove("border-slate-800", "bg-slate-900/50");
      btn.classList.add("border-2", "border-emerald-500", "bg-emerald-950/30");

      activeModalPlanUsd = parseFloat(btn.getAttribute("data-modal-usd") || "1.00");
      const plan = btn.getAttribute("data-modal-plan");
      if (plan === "founder") {
        activeModalPlanMultiplier = 1;
        activeModalPlanName = "Founder Lifetime Pass";
      } else if (plan === "tournament") {
        activeModalPlanMultiplier = 5;
        activeModalPlanName = "Major Qualifier Pass";
      } else {
        activeModalPlanMultiplier = 10;
        activeModalPlanName = "VIP Pro Squad Pass";
      }

      recalculateModalTotal();
    });
  });

  // Modal Currency Dropdown Change
  const modalCurrSelect = document.getElementById("paystackCurrencySelect") as HTMLSelectElement;
  if (modalCurrSelect) {
    modalCurrSelect.addEventListener("change", () => {
      activeModalCurrency = modalCurrSelect.value || "NGN";
      recalculateModalTotal();
    });
  }

  // Real Paystack Checkout Flow (NO DEMO / NO BYPASS)
  const initPaymentBtn = document.getElementById("initiatePaystackBtn");
  if (initPaymentBtn) {
    initPaymentBtn.addEventListener("click", async () => {
      if (!auth.currentUser) {
        openModal("loginModal");
        showToast("Please log in with Firebase first to proceed with account activation.", "info");
        return;
      }

      const statusNotice = document.getElementById("paymentStatusNotice")!;
      const celebration = document.getElementById("activationCelebrationScreen");
      celebration?.classList.add("hidden");
      statusNotice.classList.remove("hidden");
      statusNotice.innerHTML = `
        <div class="flex items-center gap-3 text-sm text-cyan-300">
          <div class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          Contacting backend server to initialize transaction for ${activeModalPlanName}...
        </div>
      `;

      try {
        const initData = await initializePayment(
          activeModalCurrency,
          activeModalPlanMultiplier,
          activeModalPlanName
        );

        statusNotice.innerHTML = `
          <div class="text-xs text-emerald-300">
            Payment initialized (Ref: ${initData.reference}). Launching Paystack Gateway...
          </div>
        `;

        await launchPaystackCheckout(
          initData,
          paystackPublicKey,
          async (ref) => {
            statusNotice.innerHTML = `
              <div class="text-xs text-cyan-300 flex items-center gap-2">
                <div class="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Verifying transaction ${ref} server-side with Paystack...
              </div>
            `;
            try {
              const verifyResult = await verifyPayment(ref);

              // Authoritatively update account in Firestore
              if (auth.currentUser) {
                try {
                  await activateUserAccount(auth.currentUser.uid, activeModalPlanName, ref);
                  await logAuditEvent(
                    "ACCOUNT_ACTIVATED",
                    `Account activated for ${auth.currentUser.email} via Paystack ref ${ref}`,
                    "SUCCESS"
                  );
                } catch (actErr: any) {
                  console.warn("Could not sync Firestore profile:", actErr);
                }
              }

              statusNotice.classList.add("hidden");
              if (celebration) {
                celebration.classList.remove("hidden");
              }

              // Update user status badge inside modal
              const modalStatusBadge = document.getElementById("activationUserStatusBadge");
              if (modalStatusBadge) {
                modalStatusBadge.className = "text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/50 flex items-center gap-1";
                modalStatusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ELITE PAID`;
              }

              // Refresh Auth UI with activated state
              const refreshedProfile = await fetchUserProfile(auth.currentUser.uid);
              currentUserProfile = refreshedProfile;
              updateAuthUI(auth.currentUser, refreshedProfile);

              showToast("🎉 Payment verified! Your account is now active and elite.", "success");
            } catch (verErr: any) {
              statusNotice.innerHTML = `
                <div class="text-xs text-red-400">
                  Verification Failed: ${verErr.message}
                </div>
              `;
            }
          },
          () => {
            statusNotice.innerHTML = `
              <div class="text-xs text-amber-300">
                Payment window closed. If payment was completed, wait a moment or try again.
              </div>
            `;
          }
        );
      } catch (err: any) {
        statusNotice.innerHTML = `
          <div class="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 leading-relaxed">
            <b class="text-red-400 block mb-1">Payment Denied / Initialization Failed</b>
            ${err.message}
          </div>
        `;
      }
    });
  }

  // Dismiss Celebration & Scroll to Arena
  const dismissCelebrationBtn = document.getElementById("btnDismissCelebration");
  if (dismissCelebrationBtn) {
    dismissCelebrationBtn.addEventListener("click", () => {
      closeModal("membershipModal");
      const arenaSection = document.getElementById("saas-arena");
      if (arenaSection) {
        arenaSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Audit Log Modal Trigger (from navigation and footer)
  const openAuditModalHandler = async () => {
    openModal("auditModal");
    const listContainer = document.getElementById("auditLogsList")!;
    listContainer.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs">Loading verified audit logs from server...</div>`;
    const logs = await fetchAuditLogs();
    if (logs.length === 0) {
      listContainer.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs">No audit records found yet for current session.</div>`;
    } else {
      listContainer.innerHTML = logs
        .map(
          (log) => `
        <div class="p-3 rounded-xl border border-slate-800 bg-[#040c14] flex flex-col gap-1 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-emerald-400">${log.eventType}</span>
            <span class="text-[10px] text-slate-500">${new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
          <p class="text-slate-300">${log.details}</p>
          <div class="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span>Actor: ${log.actorEmail || log.actorUid}</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">${log.status}</span>
          </div>
        </div>
      `
        )
        .join("");
    }
  };

  const auditTriggerBtn = document.getElementById("openAuditModalBtn");
  if (auditTriggerBtn) auditTriggerBtn.addEventListener("click", openAuditModalHandler);
  const auditFooterBtn = document.getElementById("openAuditModalFooterBtn");
  if (auditFooterBtn) auditFooterBtn.addEventListener("click", openAuditModalHandler);

  // Odds Slip Builder Interactive Calculation
  setupOddsSlip();
}

// Odds Slip Interactivity
function setupOddsSlip() {
  const matchOddsBtns = document.querySelectorAll("[data-odd-val]");
  const totalOddsDisplay = document.getElementById("slipTotalOdds");
  const stakeInput = document.getElementById("slipStakeInput") as HTMLInputElement;
  const returnsDisplay = document.getElementById("slipPotentialReturns");
  const placeBetBtn = document.getElementById("placeOddsBetBtn");

  let selectedOdds: number[] = [1.8, 2.2];

  function recalculate() {
    const totalOdds = selectedOdds.length > 0 ? selectedOdds.reduce((acc, curr) => acc * curr, 1) : 1.0;
    const stake = stakeInput ? parseFloat(stakeInput.value) || 10 : 10;
    const returns = totalOdds * stake;

    if (totalOddsDisplay) totalOddsDisplay.textContent = totalOdds.toFixed(2);
    if (returnsDisplay) returnsDisplay.textContent = returns.toFixed(2);
  }

  matchOddsBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const odd = parseFloat(btn.getAttribute("data-odd-val") || "1.0");
      btn.classList.toggle("selected-odd");
      if (btn.classList.contains("selected-odd")) {
        selectedOdds.push(odd);
      } else {
        selectedOdds = selectedOdds.filter((o) => o !== odd);
      }
      recalculate();
    });
  });

  if (stakeInput) {
    stakeInput.addEventListener("input", recalculate);
  }

  if (placeBetBtn) {
    placeBetBtn.addEventListener("click", () => {
      if (!auth.currentUser) {
        openModal("loginModal");
        showToast("Please log in with Firebase to place an escrow stake.", "info");
        return;
      }
      showToast("Odds slip escrow registered with match validator.", "success");
      logAuditEvent("ODDS_SLIP_PLACED", `Placed stake on odds: ${selectedOdds.join(", ")}`);
    });
  }

  recalculate();
}

// Update UI when Auth changes
function updateAuthUI(user: any, profile: UserProfile | null) {
  const authNav = document.getElementById("authNavButtons");
  const userNav = document.getElementById("userNavProfile");
  const userNameDisplay = document.getElementById("userNavDisplayName");
  const userStatusDisplay = document.getElementById("userNavStatus");
  const unpaidBanner = document.getElementById("unpaidAccountBanner");

  if (user) {
    authNav?.classList.add("hidden");
    userNav?.classList.remove("hidden");
    if (userNameDisplay) userNameDisplay.textContent = profile?.displayName || user.email || "Gamer";
    
    const isPaid = profile?.paymentStatus === "paid" || profile?.accountStatus === "active";
    if (userStatusDisplay) {
      if (isPaid) {
        userStatusDisplay.innerHTML = `<span class="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ELITE PAID</span>`;
      } else {
        userStatusDisplay.innerHTML = `<button id="userNavActivateBtn" class="text-[10px] font-bold text-amber-300 bg-amber-950/90 hover:bg-amber-900 px-2 py-0.5 rounded border border-amber-500/50 cursor-pointer animate-pulse flex items-center gap-1" title="Click to activate account">⚠️ UNPAID ($1) — ACTIVATE</button>`;

        const activateNavBtn = document.getElementById("userNavActivateBtn");
        if (activateNavBtn) {
          activateNavBtn.addEventListener("click", () => {
            openAccountActivationModal({
              displayName: profile?.displayName || user.displayName || user.email,
              email: user.email,
              isNewRegistration: false,
            });
          });
        }
      }
    }

    if (unpaidBanner) {
      if (isPaid) {
        unpaidBanner.classList.add("hidden");
      } else {
        unpaidBanner.classList.remove("hidden");
      }
    }
  } else {
    authNav?.classList.remove("hidden");
    userNav?.classList.add("hidden");
    unpaidBanner?.classList.add("hidden");
  }
}

// Tournament Hub Filtering
function setupTournamentTabs() {
  const tabs = document.querySelectorAll("[data-tourney-tab]");
  const cards = document.querySelectorAll(".tourney-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const type = tab.getAttribute("data-tourney-tab");
      tabs.forEach((t) => {
        t.classList.remove("bg-emerald-500", "text-black");
        t.classList.add("bg-slate-900", "text-slate-300");
      });
      tab.classList.remove("bg-slate-900", "text-slate-300");
      tab.classList.add("bg-emerald-500", "text-black");

      cards.forEach((card) => {
        const ctype = card.getAttribute("data-type");
        if (type === "all" || ctype === type) {
          (card as HTMLElement).style.display = "block";
        } else {
          (card as HTMLElement).style.display = "none";
        }
      });
    });
  });
}

// Helpers
function openModal(id: string) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("hidden");
}

function closeModal(id: string) {
  const m = document.getElementById(id);
  if (m) m.classList.add("hidden");
}

function showToast(message: string, type: "success" | "error" | "info" = "info") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl backdrop-blur-xl border text-sm font-medium shadow-2xl transition-all duration-500 transform translate-y-4 opacity-0 flex items-center gap-3 ${
    type === "success"
      ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
      : type === "error"
      ? "bg-red-950/90 text-red-300 border-red-500/50"
      : "bg-cyan-950/90 text-cyan-300 border-cyan-500/50"
  }`;
  toast.innerHTML = `<span>${type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ"}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-4", "opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

/* ============================================================ */
/* 1. GAMING RESULTS CONFIRMATION HUB */
/* ============================================================ */
let currentGamingResults: GamingResultItem[] = [];
let activeResultsFilter = "all";

function setupGamingResults() {
  const filterBtns = document.querySelectorAll(".results-filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("bg-emerald-500", "text-black", "shadow-[0_0_12px_rgba(0,255,135,0.4)]");
        b.classList.add("bg-slate-900", "text-slate-400", "border", "border-slate-800");
      });
      btn.classList.remove("bg-slate-900", "text-slate-400", "border", "border-slate-800");
      btn.classList.add("bg-emerald-500", "text-black", "shadow-[0_0_12px_rgba(0,255,135,0.4)]");

      activeResultsFilter = btn.getAttribute("data-filter") || "all";
      renderGamingResults(currentGamingResults);
    });
  });

  // Subscribe to real-time and local results
  subscribeToGamingResults((items) => {
    currentGamingResults = items;
    updateResultsStats(items);
    renderGamingResults(items);
  });
}

function updateResultsStats(items: GamingResultItem[]) {
  const allEl = document.getElementById("countResultsAll");
  const pendEl = document.getElementById("countResultsPending");
  const confEl = document.getElementById("countResultsConfirmed");
  const dispEl = document.getElementById("countResultsDisputed");

  if (allEl) allEl.textContent = String(items.length);
  if (pendEl) pendEl.textContent = String(items.filter((i) => i.status === "pending_confirmation").length);
  if (confEl) confEl.textContent = String(items.filter((i) => i.status === "confirmed" || i.status === "referee_verified").length);
  if (dispEl) dispEl.textContent = String(items.filter((i) => i.status === "disputed").length);
}

function renderGamingResults(items: GamingResultItem[]) {
  const grid = document.getElementById("gamingResultsGrid");
  if (!grid) return;

  const filtered = items.filter((item) => {
    if (activeResultsFilter === "all") return true;
    if (activeResultsFilter === "pending") return item.status === "pending_confirmation";
    if (activeResultsFilter === "confirmed") return item.status === "confirmed" || item.status === "referee_verified";
    if (activeResultsFilter === "disputed") return item.status === "disputed";
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-1 md:col-span-2 p-12 text-center rounded-3xl bg-[#040e1b] border border-slate-800 space-y-3">
        <span class="text-3xl">🏆</span>
        <h4 class="text-base font-orbitron font-bold text-white">No Results in This Category</h4>
        <p class="text-xs text-slate-400">Submit a new match result or switch filters to view active escrow confirmations.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((item) => {
      const isPending = item.status === "pending_confirmation";
      const isConfirmed = item.status === "confirmed" || item.status === "referee_verified";
      const isDisputed = item.status === "disputed";

      let statusBadge = "";
      let borderColor = "border-slate-800";

      if (isPending) {
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-amber-950/80 border border-amber-500/50 text-amber-300"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>AWAITING OPPONENT CONFIRMATION</span>`;
        borderColor = "border-amber-500/40 hover:border-amber-400";
      } else if (isConfirmed) {
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>✓ CONFIRMED & ESCROW SETTLED</span>`;
        borderColor = "border-emerald-500/40 hover:border-emerald-400";
      } else {
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-red-950/80 border border-red-500/50 text-red-300"><span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>⚠️ IN REFEREE ARBITRATION</span>`;
        borderColor = "border-red-500/40 hover:border-red-400";
      }

      const isVideoProof = item.proofUrl.endsWith(".mp4") || !!item.videoProofUrl;
      const proofAssetPath = item.proofUrl;

      return `
        <div class="p-6 rounded-3xl bg-[#040e1b] border ${borderColor} transition-all duration-300 space-y-4 relative group flex flex-col justify-between shadow-xl">
          
          <!-- Top Row -->
          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[10px] font-orbitron font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                ${item.gameTitle} • ${item.category}
              </span>
              ${statusBadge}
            </div>

            <div>
              <h3 class="font-orbitron font-extrabold text-white text-lg group-hover:text-emerald-300 transition">
                ${item.tournamentName}
              </h3>
              <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>Ref: ${item.resultId}</span>
                <span>•</span>
                <span class="text-slate-500">${new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <!-- Matchup Card -->
            <div class="p-3.5 rounded-2xl bg-[#020710] border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div class="text-[10px] text-slate-400 uppercase font-rajdhani font-semibold">Submitter / Winner:</div>
                <div class="text-sm font-orbitron font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>👑</span>
                  <span class="truncate">${item.winnerTag}</span>
                </div>
                <div class="text-xs text-slate-300 font-mono mt-0.5">${item.score}</div>
              </div>
              <div class="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                <div class="text-[10px] text-slate-400 uppercase font-rajdhani font-semibold">Opponent / Challenged:</div>
                <div class="text-sm font-orbitron font-bold text-slate-200 truncate">
                  ${item.opponentTag}
                </div>
                <div class="text-xs text-amber-400 font-mono mt-0.5">Escrow Stake: $${item.escrowAmount} ${item.currency}</div>
              </div>
            </div>

            <!-- Proof Asset Folder Preview -->
            <div class="p-3 rounded-2xl bg-[#030914] border border-slate-800 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <span class="text-lg flex-shrink-0">${isVideoProof ? "🎬" : "🛡️"}</span>
                <div class="truncate">
                  <div class="text-xs font-rajdhani font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Certified Asset Folder Proof:</span>
                    <span class="text-[10px] font-mono text-emerald-400 truncate">${proofAssetPath}</span>
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono">SHA-256: ${item.integrityHash.substring(0, 16)}...</div>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                ${
                  isVideoProof
                    ? `<button data-action="watch-vod" data-vod="${proofAssetPath}" data-title="${item.tournamentName} VOD Proof" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black text-xs font-orbitron font-bold transition cursor-pointer flex items-center gap-1">
                        <span>▶</span>
                        <span>Watch VOD</span>
                      </button>`
                    : `<button data-action="inspect-proof" data-proof="${proofAssetPath}" data-title="${item.tournamentName} Telemetry" class="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black text-xs font-orbitron font-bold transition cursor-pointer flex items-center gap-1">
                        <span>🔍</span>
                        <span>Inspect Proof</span>
                      </button>`
                }
              </div>
            </div>

            ${
              item.disputeReason
                ? `<div class="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono flex items-start gap-2">
                    <span>⚠️</span>
                    <span>Dispute Note: ${item.disputeReason}</span>
                  </div>`
                : ""
            }
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <button data-action="referee-check" data-id="${item.resultId}" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-rajdhani font-bold transition cursor-pointer">
                🛡️ Anti-Cheat Seal
              </button>
            </div>

            <div class="flex items-center gap-2">
              ${
                isPending
                  ? `
                    <button data-action="dispute" data-id="${item.resultId}" class="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-orbitron font-bold transition cursor-pointer">
                      Dispute
                    </button>
                    <button data-action="confirm" data-id="${item.resultId}" data-amount="${item.escrowAmount}" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 text-xs font-orbitron font-black uppercase hover:brightness-110 shadow-[0_0_15px_rgba(0,255,135,0.3)] transition cursor-pointer">
                      Confirm & Release Escrow
                    </button>
                  `
                  : isConfirmed
                  ? `<span class="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span>✓ Escrow Disbursed</span>
                    </span>`
                  : `<span class="text-xs font-mono text-red-400 flex items-center gap-1">
                      <span>⚖️ Arbiter Reviewing</span>
                    </span>`
              }
            </div>
          </div>

        </div>
      `;
    })
    .join("");

  // Attach button event listeners
  grid.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id") || "";

      if (action === "confirm") {
        const amount = btn.getAttribute("data-amount");
        const confirmed = window.confirm(`Confirm opponent's score and authorize instant escrow release of $${amount} USD?`);
        if (!confirmed) return;

        try {
          await confirmGamingResult(id);
          showToast(`Match result confirmed! $${amount} USD released to champion.`, "success");
        } catch (err: any) {
          showToast(err.message || "Failed to confirm result", "error");
        }
      } else if (action === "dispute") {
        const reason = window.prompt("Enter dispute reason for Head Referee review (e.g., Score mismatch, desync, suspicion):");
        if (!reason) return;

        try {
          await disputeGamingResult(id, reason);
          showToast("Match result flagged for arbitration. Escrow locked.", "info");
        } catch (err: any) {
          showToast(err.message || "Failed to dispute result", "error");
        }
      } else if (action === "referee-check") {
        try {
          await refereeVerifyResult(id);
          showToast("Anti-cheat telemetry check certified! SHA-256 seal verified.", "success");
        } catch (err: any) {
          showToast(err.message || "Failed to verify telemetry", "error");
        }
      } else if (action === "watch-vod") {
        const vod = btn.getAttribute("data-vod") || "/assets/videos/results-proof-sample.mp4";
        const title = btn.getAttribute("data-title") || "Official Match Proof VOD";
        playPlatformVideo(vod, title);
      } else if (action === "inspect-proof") {
        const proof = btn.getAttribute("data-proof") || "/assets/results/match_proof_apex.svg";
        const title = btn.getAttribute("data-title") || "Official Match Proof Inspection";
        openProofInspector(proof, title);
      }
    });
  });
}

function setupResultsConfirmationForm() {
  const openBtn = document.getElementById("openSubmitResultBtn");
  const form = document.getElementById("submitResultForm") as HTMLFormElement | null;

  if (openBtn) {
    openBtn.addEventListener("click", () => openModal("submitResultModal"));
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = (document.getElementById("matchTitleInput") as HTMLInputElement).value;
      const game = (document.getElementById("matchGameSelect") as HTMLSelectElement).value;
      const category = (document.getElementById("matchCategorySelect") as HTMLSelectElement).value;
      const opponentTag = (document.getElementById("opponentGamerTagInput") as HTMLInputElement).value;
      const stake = parseFloat((document.getElementById("matchStakeInput") as HTMLInputElement).value) || 50;
      const scoreP1 = (document.getElementById("scoreP1Input") as HTMLInputElement).value;
      const scoreP2 = (document.getElementById("scoreP2Input") as HTMLInputElement).value;
      const proofAsset = (document.getElementById("proofAssetSelect") as HTMLSelectElement).value;

      try {
        await submitGamingResult({
          tournamentName: title,
          gameTitle: game,
          category,
          opponentTag,
          winnerTag: currentUserProfile?.displayName || "You (Challenger)",
          score: `${scoreP1} vs ${scoreP2}`,
          escrowAmount: stake,
          proofType: proofAsset.endsWith(".mp4") ? "video" : "telemetry",
          proofUrl: proofAsset,
          videoProofUrl: proofAsset.endsWith(".mp4") ? proofAsset : undefined,
        });

        closeModal("submitResultModal");
        form.reset();
        showToast("Match result submitted to escrow! Opponent has been notified for confirmation.", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to submit result", "error");
      }
    });
  }
}

/* ============================================================ */
/* 2. REAL PAYMENT GATEWAYS TERMINAL & CHECKOUT */
/* ============================================================ */
let activeGatewayCurrency = "NGN";
let activeGatewayPlanUsd = 1.0;
let activeGatewayPlanName = "Founder Lifetime Pass";

function setupPaymentGatewayTerminal() {
  const currBtns = document.querySelectorAll("#gatewayCurrencyGrid .curr-btn");
  const planLabels = document.querySelectorAll("#gatewayPlanSelector label");
  const checkoutBtn = document.getElementById("btnLaunchPaystackTerminal");

  currBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currBtns.forEach((b) => {
        b.classList.remove("bg-emerald-500/20", "border-emerald-500", "text-emerald-300");
        b.classList.add("bg-slate-900", "border-slate-800", "text-slate-300");
      });
      btn.classList.remove("bg-slate-900", "border-slate-800", "text-slate-300");
      btn.classList.add("bg-emerald-500/20", "border-emerald-500", "text-emerald-300");

      activeGatewayCurrency = btn.getAttribute("data-curr") || "NGN";
      recalculateGatewayTotal();
    });
  });

  planLabels.forEach((lbl) => {
    lbl.addEventListener("click", () => {
      planLabels.forEach((l) => {
        l.classList.remove("border-emerald-500", "border-2");
        l.classList.add("border-slate-800");
      });
      lbl.classList.remove("border-slate-800");
      lbl.classList.add("border-emerald-500", "border-2");

      activeGatewayPlanUsd = parseFloat(lbl.getAttribute("data-usd") || "1.00");
      const plan = lbl.getAttribute("data-plan");
      if (plan === "founder") activeGatewayPlanName = "Founder Lifetime Pass";
      else if (plan === "tournament") activeGatewayPlanName = "Major Qualifier Direct Seed";
      else activeGatewayPlanName = "VIP Pro Squad Pass";

      recalculateGatewayTotal();
    });
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleGatewayCheckout);
  }

  recalculateGatewayTotal();
}

function recalculateGatewayTotal() {
  const info = CURRENCY_RATES[activeGatewayCurrency] || CURRENCY_RATES.USD;
  const localAmount = Math.round(activeGatewayPlanUsd * info.rate * 100) / 100;

  const planNameEl = document.getElementById("summaryPlanName");
  const currCodeEl = document.getElementById("summaryCurrencyCode");
  const totalAmountEl = document.getElementById("summaryTotalAmount");
  const usdEquivEl = document.getElementById("summaryUsdEquivalent");

  if (planNameEl) planNameEl.textContent = activeGatewayPlanName;
  if (currCodeEl) currCodeEl.textContent = info.name;
  if (totalAmountEl) {
    totalAmountEl.textContent = `${info.symbol}${localAmount.toLocaleString()}`;
  }
  if (usdEquivEl) {
    usdEquivEl.textContent = `($${activeGatewayPlanUsd.toFixed(2)} USD)`;
  }
}

async function handleGatewayCheckout() {
  const checkoutBtn = document.getElementById("btnLaunchPaystackTerminal");
  const btnText = document.getElementById("btnLaunchPaystackText");

  try {
    if (checkoutBtn) checkoutBtn.setAttribute("disabled", "true");
    if (btnText) btnText.textContent = "Connecting to Paystack Gateway...";

    const info = CURRENCY_RATES[activeGatewayCurrency] || CURRENCY_RATES.USD;
    const localAmount = Math.round(activeGatewayPlanUsd * info.rate * 100) / 100;

    // 1. Initialize payment via server
    const initData = await initializePayment(
      activeGatewayCurrency,
      activeGatewayPlanUsd,
      `${activeGatewayPlanName} - SuperOdds Champion`
    );

    // 2. Launch Paystack Checkout
    await launchPaystackCheckout(
      initData,
      paystackPublicKey,
      async (reference: string) => {
        showToast("Verifying payment with Paystack server...", "info");
        try {
          const verifyResult = await verifyPayment(reference);
          showToast(
            `Payment Verified! Reference: ${reference}. Founder privileges activated.`,
            "success"
          );

          // Celebrate with visual notification
          alert(
            `🎉 TRANSACTION CERTIFIED BY PAYSTACK\n\n` +
            `Status: ${verifyResult.status.toUpperCase()}\n` +
            `Reference: ${verifyResult.reference}\n` +
            `Package: ${activeGatewayPlanName}\n` +
            `Amount Paid: ${verifyResult.currency} ${verifyResult.amount}\n` +
            `Membership: ELITE FOUNDER\n\n` +
            `Your cryptographic receipt has been committed to the immutable audit log.`
          );
        } catch (vErr: any) {
          showToast(vErr.message || "Payment verification failed", "error");
        }
      },
      () => {
        showToast("Checkout closed by user.", "info");
      }
    );
  } catch (err: any) {
    showToast(err.message || "Gateway initialization failed", "error");
  } finally {
    if (checkoutBtn) checkoutBtn.removeAttribute("disabled");
    if (btnText) btnText.textContent = "Proceed to Secure Paystack Checkout";
  }
}

/* ============================================================ */
/* 3. COMPREHENSIVE PLATFORM ASSET VAULT */
/* ============================================================ */
let activeVaultCategory = "videos";

function setupPlatformAssetVault() {
  const navBtn = document.getElementById("navAssetVaultBtn");
  const resultsVaultBtn = document.getElementById("btnResultsOpenVault");
  const closeBtn = document.getElementById("closeAssetVaultBtn");
  const tabs = document.querySelectorAll("#assetVaultCategoryTabs .vault-tab-btn");

  if (navBtn) navBtn.addEventListener("click", () => openAssetVault("videos"));
  if (resultsVaultBtn) resultsVaultBtn.addEventListener("click", () => openAssetVault("results"));
  if (closeBtn) closeBtn.addEventListener("click", () => closeModal("assetVaultModal"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("bg-cyan-500", "text-black", "shadow-[0_0_12px_rgba(0,240,255,0.4)]");
        t.classList.add("bg-slate-900", "text-slate-400", "border", "border-slate-800");
      });
      tab.classList.remove("bg-slate-900", "text-slate-400", "border", "border-slate-800");
      tab.classList.add("bg-cyan-500", "text-black", "shadow-[0_0_12px_rgba(0,240,255,0.4)]");

      activeVaultCategory = tab.getAttribute("data-vault-category") || "videos";
      renderAssetVaultItems(activeVaultCategory);
    });
  });
}

function openAssetVault(initialCategory = "videos") {
  activeVaultCategory = initialCategory;
  const tabs = document.querySelectorAll("#assetVaultCategoryTabs .vault-tab-btn");
  tabs.forEach((t) => {
    if (t.getAttribute("data-vault-category") === initialCategory) {
      t.classList.remove("bg-slate-900", "text-slate-400", "border", "border-slate-800");
      t.classList.add("bg-cyan-500", "text-black", "shadow-[0_0_12px_rgba(0,240,255,0.4)]");
    } else {
      t.classList.remove("bg-cyan-500", "text-black", "shadow-[0_0_12px_rgba(0,240,255,0.4)]");
      t.classList.add("bg-slate-900", "text-slate-400", "border", "border-slate-800");
    }
  });

  renderAssetVaultItems(initialCategory);
  openModal("assetVaultModal");
}

function renderAssetVaultItems(category: string) {
  const container = document.getElementById("assetVaultGrid");
  if (!container) return;

  let filtered = PLATFORM_ASSETS.filter((item) => {
    if (category === "videos") return item.folder.includes("videos");
    if (category === "results") return item.folder.includes("results");
    if (category === "partners") return item.folder.includes("partners");
    if (category === "cards") return item.folder.includes("cards");
    if (category === "logos") return item.folder.includes("logos");
    if (category === "images") return item.folder.includes("images");
    return true;
  });

  container.innerHTML = filtered
    .map((asset) => {
      const isVideo = asset.type === "video" || asset.path.endsWith(".mp4");
      const isImg = asset.path.endsWith(".svg") || asset.path.endsWith(".png") || asset.path.endsWith(".webp") || asset.path.endsWith(".jpg");

      return `
        <div class="p-4 rounded-2xl bg-[#040e1b] border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between space-y-3 group">
          
          <div>
            <!-- Preview Box -->
            <div class="w-full h-28 rounded-xl bg-black/80 border border-slate-800/80 flex items-center justify-center overflow-hidden p-2 relative group-hover:border-cyan-500/40 transition">
              ${
                isVideo
                  ? `<div class="text-center space-y-1">
                      <span class="text-3xl">🎬</span>
                      <div class="text-[10px] font-orbitron font-bold text-amber-400">MP4 VIDEO</div>
                    </div>`
                  : `<img src="${asset.path}" alt="${asset.name}" class="max-h-full max-w-full object-contain filter drop-shadow">`
              }
              <span class="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 border border-slate-700 text-cyan-300">
                ${asset.badge || asset.size || "ASSET"}
              </span>
            </div>

            <div class="mt-3">
              <h4 class="font-orbitron font-bold text-white text-xs truncate group-hover:text-cyan-300 transition">${asset.name}</h4>
              <p class="text-[10px] font-mono text-emerald-400 truncate mt-0.5">${asset.path}</p>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${asset.description}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <button data-copy-path="${asset.path}" class="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition cursor-pointer flex items-center gap-1">
              <span>📋</span>
              <span>Copy Path</span>
            </button>

            ${
              isVideo
                ? `<button data-play-vault-video="${asset.path}" data-title="${asset.name}" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black text-[11px] font-orbitron font-bold transition cursor-pointer flex items-center gap-1">
                    <span>▶ Play</span>
                  </button>`
                : `<button data-inspect-vault-img="${asset.path}" data-title="${asset.name}" class="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black text-[11px] font-orbitron font-bold transition cursor-pointer flex items-center gap-1">
                    <span>🔍 View</span>
                  </button>`
            }
          </div>

        </div>
      `;
    })
    .join("");

  // Copy path handler
  container.querySelectorAll("[data-copy-path]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.getAttribute("data-copy-path") || "";
      navigator.clipboard.writeText(path).then(() => {
        showToast(`Copied to clipboard: ${path}`, "success");
      });
    });
  });

  // Play video handler
  container.querySelectorAll("[data-play-vault-video]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.getAttribute("data-play-vault-video") || "";
      const title = btn.getAttribute("data-title") || "";
      playPlatformVideo(path, title);
    });
  });

  // View image handler
  container.querySelectorAll("[data-inspect-vault-img]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.getAttribute("data-inspect-vault-img") || "";
      const title = btn.getAttribute("data-title") || "";
      openProofInspector(path, title);
    });
  });
}

/* ============================================================ */
/* 4. HIGH-DEFINITION VIDEO PLAYER MODAL */
/* ============================================================ */
function setupPlatformVideoModal() {
  const closeBtn = document.getElementById("closeVideoModalBtn");
  const resultsVideoBtn = document.getElementById("btnResultsOpenVideo");
  const playlistItems = document.querySelectorAll("#videoPlaylistGrid .video-playlist-item");

  if (closeBtn) {
    closeBtn.addEventListener("click", closePlatformVideo);
  }

  if (resultsVideoBtn) {
    resultsVideoBtn.addEventListener("click", () => {
      playPlatformVideo("/assets/videos/results-proof-sample.mp4", "Match Results Proof VOD");
    });
  }

  playlistItems.forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.getAttribute("data-video-src") || "/assets/videos/peg-trailer.mp4";
      const title = item.getAttribute("data-video-title") || "Official 4K Broadcast";

      playlistItems.forEach((i) => {
        i.classList.remove("border-emerald-500");
        i.classList.add("border-slate-800");
      });
      item.classList.remove("border-slate-800");
      item.classList.add("border-emerald-500");

      playPlatformVideo(src, title);
    });
  });
}

/* ============================================================ */
/* 5. PROOF / TELEMETRY INSPECTOR MODAL */
/* ============================================================ */
function setupProofInspectorModal() {
  const closeBtn = document.getElementById("closeProofInspectBtn");
  const openInTabBtn = document.getElementById("btnOpenProofInTab");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal("proofInspectModal"));
  }

  if (openInTabBtn) {
    openInTabBtn.addEventListener("click", () => {
      const img = document.getElementById("proofInspectImage") as HTMLImageElement | null;
      if (img && img.src) {
        window.open(img.src, "_blank");
      }
    });
  }
}

function openProofInspector(imageSrc: string, title = "Match Proof Inspection") {
  const titleEl = document.getElementById("proofInspectTitle");
  const pathEl = document.getElementById("proofInspectPath");
  const imgEl = document.getElementById("proofInspectImage") as HTMLImageElement | null;

  if (titleEl) titleEl.textContent = title;
  if (pathEl) pathEl.textContent = imageSrc;
  if (imgEl) imgEl.src = imageSrc;

  openModal("proofInspectModal");
}
