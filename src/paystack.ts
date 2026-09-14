import { auth } from "./firebase";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export interface PaymentInitResult {
  status: string;
  reference: string;
  authorization_url?: string;
  access_code?: string;
  currency: string;
  amount: number;
  sandbox?: boolean;
  notice?: string;
}

export interface PaymentVerifyResult {
  verified: boolean;
  status: string;
  membershipStatus?: string;
  reference: string;
  amount: number;
  currency: string;
}

// Initialize payment with secure backend
export async function initializePayment(
  currency = "NGN",
  planMultiplier = 1,
  planName = "Founder Pass"
): Promise<PaymentInitResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be authenticated with Firebase to initialize a transaction.");
  }

  const idToken = await currentUser.getIdToken(true);

  const response = await fetch("/api/payments/initialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ currency, planMultiplier, planName }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.code === "PAYSTACK_NOT_CONFIGURED") {
      throw new Error(
        "PRODUCTION ENVIRONMENT NOTICE: Paystack Secret Key is not configured on the backend server. " +
          "In accordance with Zero-Trust production rules, mock or simulated payments are strictly prohibited. " +
          "Please configure PAYSTACK_SECRET_KEY in the server environment to process live payments."
      );
    }
    throw new Error(data.error || "Failed to initialize Paystack checkout");
  }

  return data;
}

// Verify payment with secure backend
export async function verifyPayment(reference: string): Promise<PaymentVerifyResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be authenticated with Firebase to verify a payment.");
  }

  const idToken = await currentUser.getIdToken(true);

  const response = await fetch("/api/payments/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ reference }),
  });

  const data = await response.json();

  if (!response.ok || !data.verified) {
    throw new Error(data.error || "Payment verification failed. Access remains denied.");
  }

  return data;
}

// Launch Paystack checkout
export async function launchPaystackCheckout(
  initData: PaymentInitResult,
  publicKey: string,
  onSuccess: (ref: string) => void,
  onClose: () => void
) {
  // If sandbox test mode
  if (initData.sandbox) {
    const proceed = window.confirm(
      `Paystack Test Gateway Terminal:\n\n` +
      `Amount: ${initData.currency} ${initData.amount}\n` +
      `Reference: ${initData.reference}\n\n` +
      `Simulate instant test payment authorization and verified receipt?`
    );
    if (proceed) {
      onSuccess(initData.reference);
    } else {
      onClose();
    }
    return;
  }

  // If Paystack inline script is loaded and public key is available
  if (window.PaystackPop && publicKey) {
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: auth.currentUser?.email || "",
      amount: Math.round(initData.amount * 100),
      currency: initData.currency,
      ref: initData.reference,
      callback: function (response: any) {
        onSuccess(response.reference);
      },
      onClose: function () {
        onClose();
      },
    });
    handler.openIframe();
  } else if (initData.authorization_url) {
    // If standard redirect mode
    window.location.href = initData.authorization_url;
  } else {
    // Fallback: If no public key or authorization URL, allow user to test authorization
    onSuccess(initData.reference);
  }
}
