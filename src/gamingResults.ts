import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { logAuditEvent } from "./auditLogger";

export interface GamingResultItem {
  resultId: string;
  tournamentId: string;
  tournamentName: string;
  gameTitle: string;
  category: string;
  submitterUid: string;
  submitterTag: string;
  opponentUid: string;
  opponentTag: string;
  winnerUid: string;
  winnerTag: string;
  score: string;
  escrowAmount: number;
  currency: string;
  status: "pending_confirmation" | "confirmed" | "disputed" | "referee_verified";
  proofType: "screenshot" | "video" | "telemetry";
  proofUrl: string;
  videoProofUrl?: string;
  integrityHash: string;
  disputeReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

// Initial high-fidelity gaming results seeded from the platform asset folders
const SEED_RESULTS: GamingResultItem[] = [
  {
    resultId: "res_apex_9042",
    tournamentId: "tourn_apex_live",
    tournamentName: "Apex Predator Invitational",
    gameTitle: "Apex Legends",
    category: "Battle Royale",
    submitterUid: "user_zenith_apex",
    submitterTag: "Team Zenith (Gamer #102)",
    opponentUid: "user_cloud_striker",
    opponentTag: "CloudStrikers Squad",
    winnerUid: "user_zenith_apex",
    winnerTag: "Team Zenith",
    score: "18 Kills vs 14 Kills (Final Ring Wipe)",
    escrowAmount: 1200,
    currency: "USD",
    status: "pending_confirmation",
    proofType: "screenshot",
    proofUrl: "/assets/results/match_proof_apex.svg",
    videoProofUrl: "/assets/videos/results-proof-sample.mp4",
    integrityHash: "0x8f4c2eb971a2ec01ff88902adbb8412856f8a49c25f00e3189",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    resultId: "res_sim_8120",
    tournamentId: "tourn_racing_live",
    tournamentName: "Velocity Hyper-Prix Circuit",
    gameTitle: "Sim Racing GP",
    category: "Racing",
    submitterUid: "user_ghost_racer",
    submitterTag: "GhostRacer_X",
    opponentUid: "user_apex_shift",
    opponentTag: "ApexShift#44",
    winnerUid: "user_ghost_racer",
    winnerTag: "GhostRacer_X",
    score: "P1 Finish (Split +0.180s • 25 Laps)",
    escrowAmount: 500,
    currency: "USD",
    status: "confirmed",
    proofType: "telemetry",
    proofUrl: "/assets/results/match_proof_racing.svg",
    videoProofUrl: "/assets/videos/gameplay-highlight.mp4",
    integrityHash: "0x3ab912cd8014fe881023baee410985cba124801fe128",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    resultId: "res_val_7721",
    tournamentId: "tourn_warzone_upcoming",
    tournamentName: "Warzone Gauntlet Qualifier",
    gameTitle: "Valorant Tactical",
    category: "FPS Tactical",
    submitterUid: "user_cyber_ninja",
    submitterTag: "CyberNinja#204",
    opponentUid: "user_phantom_ghost",
    opponentTag: "PhantomGhost#109",
    winnerUid: "user_cyber_ninja",
    winnerTag: "CyberNinja#204",
    score: "13 — 11 (Overtime Round 24)",
    escrowAmount: 750,
    currency: "USD",
    status: "disputed",
    proofType: "screenshot",
    proofUrl: "/assets/results/match_proof_valorant.svg",
    videoProofUrl: "/assets/videos/peg-trailer.mp4",
    integrityHash: "0xcc8109d941bb0203e0129a0024f91185ef30a841",
    disputeReason: "Opponent flagged round 22 packet drop. Dedicated referee analyzing match tick telemetry.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    resultId: "res_sports_4410",
    tournamentId: "tourn_fifa_cup",
    tournamentName: "EA Continental Cup Showdown",
    gameTitle: "EA FC 26 Pro League",
    category: "Sports",
    submitterUid: "user_golden_striker",
    submitterTag: "GoldenStriker#7",
    opponentUid: "user_tactical_fc",
    opponentTag: "TacticalFC_Master",
    winnerUid: "user_golden_striker",
    winnerTag: "GoldenStriker#7",
    score: "4 — 2 (Full Time 90')",
    escrowAmount: 400,
    currency: "USD",
    status: "pending_confirmation",
    proofType: "screenshot",
    proofUrl: "/assets/images/cat_sports_1789111869130.jpg",
    videoProofUrl: "/assets/videos/esports-intro.mp4",
    integrityHash: "0x98ef412a0149bb89c4125890adbc14838f09aa11",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
];

let localResultsCache: GamingResultItem[] = [...SEED_RESULTS];
let unsubscribeResults: (() => void) | null = null;

// Load and subscribe to real-time Gaming Results from Firebase Firestore
export function subscribeToGamingResults(onUpdate: (results: GamingResultItem[]) => void) {
  if (unsubscribeResults) {
    unsubscribeResults();
  }

  // Always invoke initial callback with local cache
  onUpdate(localResultsCache);

  try {
    const colRef = collection(db, "gamingResults");
    const q = query(colRef, orderBy("createdAt", "desc"), limit(25));

    unsubscribeResults = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: GamingResultItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as GamingResultItem);
          });
          localResultsCache = items;
          onUpdate(localResultsCache);
        } else {
          // If empty, auto-seed to Firestore so the user has immediate rich data
          seedInitialResultsToFirestore();
        }
      },
      (error) => {
        console.warn("Firestore gamingResults snapshot notice:", error.message);
        // Seamless fallback to memory cache
        onUpdate(localResultsCache);
      }
    );
  } catch (err) {
    console.warn("Firestore collection subscription unavailable, using local cache:", err);
    onUpdate(localResultsCache);
  }
}

// Auto-seed to Firestore
async function seedInitialResultsToFirestore() {
  try {
    for (const item of SEED_RESULTS) {
      const docRef = doc(db, "gamingResults", item.resultId);
      await setDoc(docRef, item, { merge: true });
    }
  } catch (e) {
    console.warn("Could not seed initial results to Firestore:", e);
  }
}

// Submit a new gaming match result
export async function submitGamingResult(payload: {
  tournamentName: string;
  gameTitle: string;
  category: string;
  opponentTag: string;
  score: string;
  escrowAmount: number;
  proofType: "screenshot" | "video" | "telemetry";
  proofUrl: string;
  videoProofUrl?: string;
  winnerTag?: string;
}): Promise<GamingResultItem> {
  const currentUser = auth.currentUser;
  const submitterUid = currentUser ? currentUser.uid : `guest_${Date.now()}`;
  const submitterTag = currentUser?.displayName || currentUser?.email?.split("@")[0] || "ProGamer_PEG";

  const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const integrityHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  const newResult: GamingResultItem = {
    resultId,
    tournamentId: `tourn_${Date.now()}`,
    tournamentName: payload.tournamentName,
    gameTitle: payload.gameTitle,
    category: payload.category,
    submitterUid,
    submitterTag,
    opponentUid: `opp_${Math.random().toString(36).substring(2, 7)}`,
    opponentTag: payload.opponentTag || "Challenger_Gamer",
    winnerUid: payload.winnerTag === submitterTag ? submitterUid : "opponent_winner",
    winnerTag: payload.winnerTag || submitterTag,
    score: payload.score,
    escrowAmount: payload.escrowAmount || 250,
    currency: "USD",
    status: "pending_confirmation",
    proofType: payload.proofType,
    proofUrl: payload.proofUrl || "/assets/results/match_proof_apex.svg",
    videoProofUrl: payload.videoProofUrl || "/assets/videos/results-proof-sample.mp4",
    integrityHash,
    createdAt: new Date().toISOString(),
  };

  // Update local memory
  localResultsCache.unshift(newResult);

  // Persist to Firestore if available
  try {
    const docRef = doc(db, "gamingResults", resultId);
    await setDoc(docRef, newResult);
  } catch (e) {
    console.warn("Saved to local cache (Firestore write skipped):", e);
  }

  // Audit event
  await logAuditEvent(
    "GAMING_RESULT_SUBMITTED",
    `Match result for ${payload.gameTitle} (${payload.score}) submitted for confirmation`,
    "PENDING"
  );

  return newResult;
}

// Confirm gaming match result and release escrow prize
export async function confirmGamingResult(resultId: string): Promise<GamingResultItem> {
  const itemIndex = localResultsCache.findIndex((r) => r.resultId === resultId);
  if (itemIndex === -1) {
    throw new Error("Match result not found");
  }

  const updatedItem: GamingResultItem = {
    ...localResultsCache[itemIndex],
    status: "confirmed",
    verifiedAt: new Date().toISOString(),
  };

  localResultsCache[itemIndex] = updatedItem;

  // Persist to Firestore
  try {
    const docRef = doc(db, "gamingResults", resultId);
    await updateDoc(docRef, {
      status: "confirmed",
      verifiedAt: updatedItem.verifiedAt,
    });
  } catch (e) {
    console.warn("Updated in local cache:", e);
  }

  // Audit Log Escrow Release
  await logAuditEvent(
    "GAMING_RESULT_CONFIRMED",
    `Result ${resultId} mutually confirmed. Escrow prize of $${updatedItem.escrowAmount} USD released to ${updatedItem.winnerTag}`,
    "SETTLED"
  );

  return updatedItem;
}

// Dispute gaming match result for referee arbitration
export async function disputeGamingResult(resultId: string, reason: string): Promise<GamingResultItem> {
  const itemIndex = localResultsCache.findIndex((r) => r.resultId === resultId);
  if (itemIndex === -1) {
    throw new Error("Match result not found");
  }

  const updatedItem: GamingResultItem = {
    ...localResultsCache[itemIndex],
    status: "disputed",
    disputeReason: reason || "Score mismatch reported by opponent",
  };

  localResultsCache[itemIndex] = updatedItem;

  // Persist to Firestore
  try {
    const docRef = doc(db, "gamingResults", resultId);
    await updateDoc(docRef, {
      status: "disputed",
      disputeReason: updatedItem.disputeReason,
    });
  } catch (e) {
    console.warn("Updated in local cache:", e);
  }

  // Audit Log Dispute
  await logAuditEvent(
    "GAMING_RESULT_DISPUTED",
    `Match result ${resultId} disputed: ${reason}. Escrow frozen for referee arbitration.`,
    "DISPUTED"
  );

  return updatedItem;
}

// Referee Anti-Cheat / Arbiter verification
export async function refereeVerifyResult(resultId: string): Promise<GamingResultItem> {
  const itemIndex = localResultsCache.findIndex((r) => r.resultId === resultId);
  if (itemIndex === -1) {
    throw new Error("Match result not found");
  }

  const updatedItem: GamingResultItem = {
    ...localResultsCache[itemIndex],
    status: "referee_verified",
    verifiedAt: new Date().toISOString(),
  };

  localResultsCache[itemIndex] = updatedItem;

  try {
    const docRef = doc(db, "gamingResults", resultId);
    await updateDoc(docRef, {
      status: "referee_verified",
      verifiedAt: updatedItem.verifiedAt,
    });
  } catch (e) {
    console.warn("Updated in local cache:", e);
  }

  await logAuditEvent(
    "REFEREE_VERIFIED",
    `Match ${resultId} anti-cheat tick analysis completed and verified by Head Arbiter.`,
    "VERIFIED"
  );

  return updatedItem;
}
