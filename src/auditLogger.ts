import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface AuditRecord {
  id: string;
  eventType: string;
  actorUid: string;
  actorEmail?: string;
  status: string;
  details: string;
  timestamp: string;
}

export async function logAuditEvent(eventType: string, details: string, status = "INFO"): Promise<void> {
  const currentUser = auth.currentUser;
  const uid = currentUser ? currentUser.uid : "ANONYMOUS";
  const email = currentUser ? currentUser.email || "" : undefined;

  const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: AuditRecord = {
    id: logId,
    eventType,
    actorUid: uid,
    actorEmail: email,
    status,
    details,
    timestamp: new Date().toISOString(),
  };

  // Try logging to server endpoint
  try {
    const idToken = currentUser ? await currentUser.getIdToken() : null;
    if (idToken) {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ eventType, details, status }),
      });
    }
  } catch (e) {
    // Silently continue
  }

  // Also write to Firestore directly if user is logged in
  if (currentUser) {
    try {
      await setDoc(doc(db, "auditLogs", logId), record);
    } catch (err) {
      // Non-blocking
    }
  }
}

export async function fetchAuditLogs(): Promise<AuditRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  try {
    const idToken = await currentUser.getIdToken();
    const res = await fetch("/api/audit-logs", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch (e) {
    console.warn("Could not fetch server audit logs:", e);
  }
  return [];
}
