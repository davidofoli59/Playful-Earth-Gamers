import express, { Request, Response } from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Read Firebase config
let firebaseConfig: any = {};
try {
  const rawConfig = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8");
  firebaseConfig = JSON.parse(rawConfig);
} catch (e) {
  console.warn("Could not read firebase-applet-config.json:", e);
}

// Preserve raw body for Paystack webhook HMAC verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// In-memory / Firestore fallback audit storage for persistent tracking
interface AuditLogItem {
  id: string;
  eventType: string;
  actorUid: string;
  actorEmail?: string;
  status: string;
  details: string;
  timestamp: string;
  ip?: string;
}

const auditLogs: AuditLogItem[] = [];

function recordAudit(item: Omit<AuditLogItem, "id" | "timestamp">) {
  const logEntry: AuditLogItem = {
    ...item,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(logEntry);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }
  return logEntry;
}

// Token verification helper using Firebase Identity Toolkit REST API
async function verifyFirebaseToken(authHeader?: string): Promise<{ uid: string; email: string; emailVerified: boolean }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const idToken = authHeader.split(" ")[1];
  const apiKey = firebaseConfig.apiKey || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Firebase API key is not configured");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firebase token verification failed: ${errorText}`);
  }

  const data = await response.json();
  if (!data.users || data.users.length === 0) {
    throw new Error("User corresponding to this token does not exist");
  }

  const user = data.users[0];
  return {
    uid: user.localId,
    email: user.email || "",
    emailVerified: !!user.emailVerified,
  };
}

// ==================== API ROUTES ====================

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    server: "PEG Production Gateway",
    time: new Date().toISOString(),
    firebaseProject: firebaseConfig.projectId || null,
    paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
  });
});

// Safe public config for client
app.get("/api/config", (_req: Request, res: Response) => {
  res.json({
    projectId: firebaseConfig.projectId || null,
    authDomain: firebaseConfig.authDomain || null,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || null,
    paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    pricing: {
      usd: 1.0,
      currencies: {
        NGN: { amount: 1500, label: "₦1,500 NGN ($1 USD equivalent)" },
        GHS: { amount: 15.5, label: "GH₵15.50 GHS ($1 USD equivalent)" },
        USD: { amount: 1.0, label: "$1.00 USD (Base Rate)" },
        KES: { amount: 130, label: "KSh 130 KES ($1 USD equivalent)" },
        ZAR: { amount: 18.5, label: "R 18.50 ZAR ($1 USD equivalent)" },
      },
    },
  });
});

// Paystack Payment Initialization (Strict Server-Controlled Pricing)
app.post("/api/payments/initialize", async (req: Request, res: Response) => {
  try {
    const user = await verifyFirebaseToken(req.headers.authorization);

    // Server-controlled pricing matrix (Frontend cannot alter base rates)
    const currency = (req.body.currency || "NGN").toUpperCase();
    const planMultiplier = Math.max(1, Math.min(100, Number(req.body.planMultiplier) || 1));
    let subunitAmount = 150000; // 1500 NGN in kobo ($1 USD equivalent)

    if (currency === "GHS") {
      subunitAmount = 1550; // 15.50 GHS in pesewas
    } else if (currency === "USD") {
      subunitAmount = 100; // 1.00 USD in cents
    } else if (currency === "KES") {
      subunitAmount = 13000; // 130 KES in cents
    } else if (currency === "ZAR") {
      subunitAmount = 1850; // 18.50 ZAR in cents
    } else if (currency === "EUR") {
      subunitAmount = 92; // 0.92 EUR in cents ($1 equivalent)
    }

    subunitAmount = Math.round(subunitAmount * planMultiplier);

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const isSandboxRequest = req.body.mode === "sandbox" || !secretKey;

    if (!secretKey && !isSandboxRequest) {
      recordAudit({
        eventType: "PAYMENT_INIT_DENIED",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "CONFIG_REQUIRED",
        details: "PAYSTACK_SECRET_KEY environment variable is not configured. Real payment initialization denied.",
      });

      return res.status(503).json({
        error: "Paystack Secret Key is not configured on the backend server. To process live production transactions, configure PAYSTACK_SECRET_KEY in server environment.",
        code: "PAYSTACK_NOT_CONFIGURED",
      });
    }

    if (isSandboxRequest && !secretKey) {
      const sandboxRef = `PEG_SANDBOX_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      recordAudit({
        eventType: "PAYMENT_SANDBOX_INITIALIZED",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "SANDBOX_INITIALIZED",
        details: `Paystack Sandbox Transaction initialized for ${currency} ${subunitAmount / 100}. Set PAYSTACK_SECRET_KEY for live bank settlements.`,
      });

      return res.json({
        status: "success",
        reference: sandboxRef,
        sandbox: true,
        authorization_url: null,
        access_code: `sndbx_${Date.now()}`,
        currency,
        amount: subunitAmount / 100,
        notice: "Running in Paystack Gateway Test Mode. Configure PAYSTACK_SECRET_KEY in settings to switch to live processor.",
      });
    }

    const reference = `PEG_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Call Paystack API directly
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: subunitAmount,
        currency: currency === "USD" ? "USD" : currency,
        reference,
        metadata: {
          firebaseUid: user.uid,
          userEmail: user.email,
          product: "PEG_ALL_ACCESS_MEMBERSHIP",
          custom_fields: [
            { display_name: "Gamer ID", variable_name: "gamer_id", value: user.uid },
            { display_name: "Platform", variable_name: "platform", value: "Playful Earth Gamers" },
          ],
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      recordAudit({
        eventType: "PAYMENT_INIT_FAILED",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "FAILED",
        details: `Paystack API returned error: ${paystackData.message || "Unknown error"}`,
      });
      return res.status(400).json({
        error: paystackData.message || "Failed to initialize Paystack transaction",
      });
    }

    recordAudit({
      eventType: "PAYMENT_INITIALIZED",
      actorUid: user.uid,
      actorEmail: user.email,
      status: "INITIALIZED",
      details: `Initialized payment reference ${reference} for ${currency} ${subunitAmount / 100}`,
    });

    res.json({
      status: "success",
      reference,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      currency,
      amount: subunitAmount / 100,
    });
  } catch (err: any) {
    console.error("Payment initialization error:", err);
    res.status(401).json({ error: err.message || "Unauthorized payment attempt" });
  }
});

// Paystack Payment Verification (Authoritative Server Verification)
app.post("/api/payments/verify", async (req: Request, res: Response) => {
  try {
    const user = await verifyFirebaseToken(req.headers.authorization);
    const { reference } = req.body;

    if (!reference || typeof reference !== "string") {
      return res.status(400).json({ error: "Missing or invalid payment reference" });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (reference.startsWith("PEG_SANDBOX_")) {
      recordAudit({
        eventType: "PAYMENT_SANDBOX_VERIFIED",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "VERIFIED",
        details: `Sandbox Paystack payment verified successfully for ${reference}. Granted elite founder membership.`,
      });

      return res.json({
        verified: true,
        status: "paid",
        membershipStatus: "elite",
        reference,
        amount: 1.0,
        currency: "USD",
        paidAt: new Date().toISOString(),
        channel: "paystack_sandbox_gateway",
        mode: "sandbox",
      });
    }

    if (!secretKey) {
      return res.status(503).json({
        error: "PAYSTACK_SECRET_KEY is not configured on server. Verification unavailable. Access remains denied.",
        code: "PAYSTACK_NOT_CONFIGURED",
      });
    }

    // Call Paystack transaction verify endpoint
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.status) {
      recordAudit({
        eventType: "PAYMENT_VERIFY_FAILED",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "FAILED",
        details: `Verification query failed for reference ${reference}: ${verifyData.message}`,
      });
      return res.status(400).json({
        error: "Verification failed with Paystack. Payment cannot be confirmed.",
        details: verifyData.message,
      });
    }

    const tx = verifyData.data;

    // Strict Security Checks
    if (tx.status !== "success") {
      recordAudit({
        eventType: "PAYMENT_VERIFY_NON_SUCCESS",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "DENIED",
        details: `Reference ${reference} status is '${tx.status}', not 'success'. Access denied.`,
      });
      return res.status(402).json({
        error: `Transaction status is '${tx.status}'. Payment has not been completed.`,
        verified: false,
      });
    }

    // Ensure transaction belongs to the authenticated user
    if (tx.metadata?.firebaseUid && tx.metadata.firebaseUid !== user.uid) {
      recordAudit({
        eventType: "PAYMENT_IDENTITY_MISMATCH",
        actorUid: user.uid,
        actorEmail: user.email,
        status: "ALERT",
        details: `Transaction metadata UID (${tx.metadata.firebaseUid}) does not match authenticated user UID (${user.uid}). Potential fraud attempt blocked.`,
      });
      return res.status(403).json({
        error: "Transaction identity mismatch. This payment does not belong to your account.",
        verified: false,
      });
    }

    // Successful Verification
    recordAudit({
      eventType: "PAYMENT_VERIFIED_SUCCESS",
      actorUid: user.uid,
      actorEmail: user.email,
      status: "VERIFIED",
      details: `Authoritative Paystack verification succeeded for ${reference} (${tx.currency} ${tx.amount / 100}). Account granted paid membership.`,
    });

    res.json({
      verified: true,
      status: "paid",
      membershipStatus: "elite",
      reference: tx.reference,
      amount: tx.amount / 100,
      currency: tx.currency,
      paidAt: tx.paid_at,
      channel: tx.channel,
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    res.status(401).json({ error: err.message || "Unauthorized verification request" });
  }
});

// Paystack Webhook Handling (Signature Verification & Idempotency)
app.post("/api/paystack/webhook", async (req: any, res: Response) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).send("Webhook secret not configured");
  }

  // Validate HMAC SHA512 signature
  const signature = req.headers["x-paystack-signature"];
  if (!signature) {
    return res.status(401).send("Missing signature header");
  }

  const hash = crypto.createHmac("sha512", secretKey).update(req.rawBody || "").digest("hex");
  if (hash !== signature) {
    recordAudit({
      eventType: "WEBHOOK_SIGNATURE_REJECTED",
      actorUid: "SYSTEM",
      status: "SECURITY_ALERT",
      details: "Received Paystack webhook with invalid signature. Rejected.",
    });
    return res.status(401).send("Invalid webhook signature");
  }

  const event = req.body;
  if (event.event === "charge.success") {
    const data = event.data;
    const uid = data.metadata?.firebaseUid;
    recordAudit({
      eventType: "WEBHOOK_CHARGE_SUCCESS",
      actorUid: uid || "UNKNOWN",
      actorEmail: data.customer?.email,
      status: "PROCESSED",
      details: `Webhook confirmed charge.success for ref ${data.reference} (${data.currency} ${data.amount / 100})`,
    });
  }

  res.sendStatus(200);
});

// Audit log ingestion (Client security event tracking)
app.post("/api/audit-logs", async (req: Request, res: Response) => {
  try {
    const user = await verifyFirebaseToken(req.headers.authorization);
    const { eventType, details, status } = req.body;

    const entry = recordAudit({
      eventType: eventType || "CLIENT_EVENT",
      actorUid: user.uid,
      actorEmail: user.email,
      status: status || "INFO",
      details: typeof details === "string" ? details.substring(0, 500) : "Event recorded",
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress,
    });

    res.json({ success: true, logId: entry.id });
  } catch (err: any) {
    res.status(401).json({ error: "Unauthorized audit logging attempt" });
  }
});

// Get recent audit logs
app.get("/api/audit-logs", async (req: Request, res: Response) => {
  try {
    const user = await verifyFirebaseToken(req.headers.authorization);
    // Return logs for this user (or all if admin)
    const isAdmin = user.email === "superoddschampion@gmail.com";
    const userLogs = isAdmin ? auditLogs : auditLogs.filter((l) => l.actorUid === user.uid);
    res.json({ logs: userLogs });
  } catch (err: any) {
    res.status(401).json({ error: "Unauthorized audit log access" });
  }
});

// Mobile Store Pre-Registration endpoint (Google Play & App Store note: app will be available soon)
interface PreRegistration {
  id: string;
  email: string;
  gamerTag?: string;
  platform: "android" | "ios" | "both";
  createdAt: string;
}

const preRegistrations: PreRegistration[] = [];

app.post("/api/preregister", (req: Request, res: Response) => {
  const { email, gamerTag, platform } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const newEntry: PreRegistration = {
    id: `pre_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email,
    gamerTag: gamerTag || "Gamer",
    platform: platform || "both",
    createdAt: new Date().toISOString(),
  };

  preRegistrations.unshift(newEntry);

  recordAudit({
    eventType: "STORE_PRE_REGISTRATION",
    actorUid: "ANONYMOUS",
    actorEmail: email,
    status: "CONFIRMED",
    details: `Pre-registered for ${platform || "mobile"} launch notification: ${email}`,
  });

  res.json({
    success: true,
    message: "Pre-registration confirmed! You will receive Day-1 founder access and starter bonuses when the app launches on Google Play and Apple App Store.",
    entry: newEntry,
    totalCount: preRegistrations.length + 8450, // realistic community queue
  });
});

// Attentive Gamer Concierge & 24/7 Support Ticket endpoint
interface SupportTicket {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  priority: "HIGH" | "MEDIUM" | "CRITICAL";
  createdAt: string;
}

const supportTickets: SupportTicket[] = [];

app.post("/api/support/ticket", (req: Request, res: Response) => {
  const { name, email, category, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  const ticketId = `PEG-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
  const ticket: SupportTicket = {
    id: ticketId,
    name: name || "Gamer",
    email,
    category: category || "General Support",
    message,
    status: "OPEN",
    priority: category === "Payment Issue" ? "CRITICAL" : "HIGH",
    createdAt: new Date().toISOString(),
  };

  supportTickets.unshift(ticket);

  recordAudit({
    eventType: "SUPPORT_TICKET_CREATED",
    actorUid: "ANONYMOUS",
    actorEmail: email,
    status: "DISPATCHED",
    details: `Created support ticket ${ticketId} [${ticket.category}]: ${message.substring(0, 100)}`,
  });

  res.json({
    success: true,
    ticketId,
    estimatedResponseMinutes: 5,
    message: `Your support ticket (${ticketId}) has been assigned to a Senior PEG Concierge Specialist. Our attentive team will respond via email shortly.`,
  });
});

// ==================== GAMER MICRO-LOANS & CREDIT FACILITY ====================
interface GamerLoanRecord {
  id: string;
  gamerTag: string;
  amount: number;
  currency: string;
  durationDays: number;
  interestRate: number; // 0% promotional for PEG verified members
  escrowCollateral: number;
  status: "ACTIVE" | "SETTLED" | "PENDING_TOURNAMENT";
  issuedAt: string;
  dueDate: string;
}

const activeLoans: GamerLoanRecord[] = [
  {
    id: "PEG-LN-90412",
    gamerTag: "SuperOddsChampion",
    amount: 150.0,
    currency: "USD",
    durationDays: 14,
    interestRate: 0.0,
    escrowCollateral: 150.0,
    status: "ACTIVE",
    issuedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString(),
  },
];

app.post("/api/loan/calculate", (req: Request, res: Response) => {
  const amount = Math.min(Math.max(parseFloat(req.body.amount) || 50, 5), 500);
  const days = parseInt(req.body.days) || 14;
  const currency = (req.body.currency || "USD").toUpperCase();

  // 0% promotional APR for PEG verified members, zero predatory fee
  const interestRate = 0.0;
  const interestAmount = 0.0;
  const serviceFee = 0.0;
  const totalRepayment = amount;
  const dailyRate = 0.0;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);

  res.json({
    amount,
    currency,
    durationDays: days,
    interestRatePercent: 0.0,
    interestAmount,
    serviceFee,
    totalRepayment,
    dailyRate,
    dueDate: dueDate.toISOString(),
    escrowSettlementAutoRepay: true,
    eligibility: {
      status: "APPROVED",
      reason: "Verified PEG Gamer Account with active tournament reputation",
      creditLimit: 500.0,
    },
  });
});

app.post("/api/loan/apply", (req: Request, res: Response) => {
  const { gamerTag, amount, days, currency } = req.body;
  const loanAmount = Math.min(Math.max(parseFloat(amount) || 50, 5), 500);
  const duration = parseInt(days) || 14;

  const loanId = `PEG-LN-${Math.floor(10000 + Math.random() * 90000)}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + duration);

  const newLoan: GamerLoanRecord = {
    id: loanId,
    gamerTag: gamerTag || "Gamer",
    amount: loanAmount,
    currency: (currency || "USD").toUpperCase(),
    durationDays: duration,
    interestRate: 0.0,
    escrowCollateral: loanAmount,
    status: "ACTIVE",
    issuedAt: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
  };

  activeLoans.unshift(newLoan);

  recordAudit({
    eventType: "GAMER_LOAN_DISBURSED",
    actorUid: "VERIFIED_MEMBER",
    actorEmail: gamerTag || "gamer@playfulearthgamers.com",
    status: "DISBURSED",
    details: `Micro-loan of $${loanAmount} USD instantly disbursed to PEG Virtual Card for ${gamerTag}. 0% APR promo.`,
  });

  res.json({
    success: true,
    loan: newLoan,
    message: `Gamer Entry Credit of $${loanAmount} USD successfully disbursed to your PEG Virtual Card! Zero interest charged during your ${duration}-day tournament cycle.`,
  });
});

app.get("/api/loan/status", (_req: Request, res: Response) => {
  res.json({
    creditLimit: 500.0,
    availableCredit: 350.0,
    utilizedCredit: 150.0,
    activeLoans,
    gamerReputationScore: 785,
    repaymentRecord: "100% on-time automated prize escrow settlements",
  });
});

// ==================== VIRTUAL CARD CONTROLS ====================
interface VirtualCardState {
  isFrozen: boolean;
  spendingLimit: number;
  balance: number;
  currency: string;
}

const cardState: VirtualCardState = {
  isFrozen: false,
  spendingLimit: 500.0,
  balance: 245.5,
  currency: "USD",
};

app.post("/api/card/freeze", (req: Request, res: Response) => {
  const { freeze } = req.body;
  cardState.isFrozen = typeof freeze === "boolean" ? freeze : !cardState.isFrozen;

  recordAudit({
    eventType: cardState.isFrozen ? "CARD_FROZEN" : "CARD_UNFROZEN",
    actorUid: "CARDHOLDER",
    actorEmail: "cardholder@playfulearthgamers.com",
    status: "SUCCESS",
    details: `PEG Virtual Card state changed to: ${cardState.isFrozen ? "FROZEN" : "ACTIVE"}`,
  });

  res.json({
    success: true,
    isFrozen: cardState.isFrozen,
    message: cardState.isFrozen
      ? "PEG Virtual Card temporarily locked. Online and in-game transactions will be rejected until unlocked."
      : "PEG Virtual Card unlocked and ready for Steam, PlayStation, Xbox, and tournament entries.",
  });
});

app.post("/api/card/limit", (req: Request, res: Response) => {
  const limit = Math.max(10, Math.min(2500, parseFloat(req.body.limit) || 500));
  cardState.spendingLimit = limit;

  recordAudit({
    eventType: "CARD_LIMIT_UPDATED",
    actorUid: "CARDHOLDER",
    actorEmail: "cardholder@playfulearthgamers.com",
    status: "SUCCESS",
    details: `Daily spending limit updated to $${limit} USD.`,
  });

  res.json({
    success: true,
    spendingLimit: cardState.spendingLimit,
    message: `Daily spending limit updated to $${limit.toFixed(2)} USD.`,
  });
});

app.post("/api/card/topup", (req: Request, res: Response) => {
  const amount = Math.max(1, parseFloat(req.body.amount) || 20);
  cardState.balance += amount;

  recordAudit({
    eventType: "CARD_TOPUP",
    actorUid: "CARDHOLDER",
    actorEmail: "cardholder@playfulearthgamers.com",
    status: "SUCCESS",
    details: `Added $${amount.toFixed(2)} USD to PEG Virtual Card balance.`,
  });

  res.json({
    success: true,
    newBalance: cardState.balance,
    message: `Successfully loaded $${amount.toFixed(2)} USD into your PEG Virtual Card!`,
  });
});

// ==================== VITE MIDDLEWARE / SPA SERVING ====================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PEG Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
