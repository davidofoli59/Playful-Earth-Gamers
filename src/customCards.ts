import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";

export interface CustomCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge: string;
  category: string;
  authorUid: string;
  authorName: string;
  createdAt: string;
}

// Available platform image assets from assets folder
export const PRESET_IMAGE_ASSETS = [
  { label: "Hero Montage", path: "/assets/images/peg_hero_montage_1789111768235.jpg" },
  { label: "Gamer Challenge Arena", path: "/assets/images/peg_gamer_challenge_1789111784294.jpg" },
  { label: "Portal Orb", path: "/assets/images/peg_portal_orb_1789111796928.jpg" },
  { label: "Battle Royale", path: "/assets/images/cat_battle_royale_1789111816039.jpg" },
  { label: "Racing Horizon", path: "/assets/images/cat_racing_1789111828418.jpg" },
  { label: "MOBA Warfront", path: "/assets/images/cat_moba_1789111839354.jpg" },
  { label: "FPS Tactical", path: "/assets/images/cat_fps_1789111852654.jpg" },
  { label: "Sports League", path: "/assets/images/cat_sports_1789111869130.jpg" },
  { label: "RPG & Adventure", path: "/assets/images/cat_rpg_1789111880501.jpg" },
  { label: "Sandbox & Craft", path: "/assets/images/cat_sandbox_1789111891956.jpg" },
  { label: "Puzzle & Logic", path: "/assets/images/cat_puzzle_1789111902737.jpg" },
];

const LOCAL_STORAGE_KEY = "peg_custom_cards_cache";

// Initial default cards
const DEFAULT_CARDS: CustomCard[] = [
  {
    id: "card_apex_legends_qualifier",
    title: "Apex Predator Invitational 2026",
    description: "Squad registration open. 60 trios dropping into Storm Point for a 50,000 PEG escrow prize pool. Anti-cheat client verification required.",
    imageUrl: "/assets/images/cat_battle_royale_1789111816039.jpg",
    badge: "Official Tournament",
    category: "Battle Royale",
    authorUid: "SYSTEM",
    authorName: "PEG Esports Board",
    createdAt: new Date().toISOString(),
  },
  {
    id: "card_creator_bounty",
    title: "Shoutcaster & Streamer Creator Bounty",
    description: "Submit your live tournament stream clip or analysis. Verified creators earn $1 USD equivalent per qualifying highlight reel with community upvotes.",
    imageUrl: "/assets/images/peg_portal_orb_1789111796928.jpg",
    badge: "Creator Hub",
    category: "Community Bounty",
    authorUid: "SYSTEM",
    authorName: "Creator Guild",
    createdAt: new Date().toISOString(),
  },
];

// Subscribe to real-time custom cards from Firestore with local fallback
export function subscribeToCustomCards(callback: (cards: CustomCard[]) => void) {
  try {
    const q = collection(db, "customCards");
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cards: CustomCard[] = [];
          snapshot.forEach((doc) => {
            cards.push(doc.data() as CustomCard);
          });
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
          callback(cards);
        } else {
          // Initialize with defaults if empty
          callback(DEFAULT_CARDS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "customCards");
        // Fallback to cache
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        callback(cached ? JSON.parse(cached) : DEFAULT_CARDS);
      }
    );
  } catch (e) {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    callback(cached ? JSON.parse(cached) : DEFAULT_CARDS);
    return () => {};
  }
}

// Save or Update a Custom Card
export async function saveCustomCard(card: Omit<CustomCard, "id" | "createdAt" | "authorUid" | "authorName"> & { id?: string }): Promise<CustomCard> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be logged in with Firebase to create or customize a card.");
  }

  const id = card.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullCard: CustomCard = {
    id,
    title: card.title.trim(),
    description: card.description.trim(),
    imageUrl: card.imageUrl || PRESET_IMAGE_ASSETS[0].path,
    badge: card.badge.trim() || "Custom Card",
    category: card.category.trim() || "Community",
    authorUid: currentUser.uid,
    authorName: currentUser.displayName || currentUser.email || "Gamer",
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "customCards", id), fullCard);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `customCards/${id}`);
  }

  // Update local cache
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  const list: CustomCard[] = cached ? JSON.parse(cached) : [...DEFAULT_CARDS];
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx] = fullCard;
  } else {
    list.unshift(fullCard);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));

  return fullCard;
}

// Delete a custom card
export async function removeCustomCard(cardId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentication required to remove card.");
  }

  try {
    await deleteDoc(doc(db, "customCards", cardId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `customCards/${cardId}`);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    const list: CustomCard[] = JSON.parse(cached);
    const updated = list.filter((c) => c.id !== cardId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
}
