import api from "./api";
import { BRAND } from "./config";

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Opens the Razorpay window for a pending order.
// Resolves true if the payment succeeded, false if the window was closed.
export async function payForOrder(orderId, customer) {
  const loaded = await loadScript(
    "https://checkout.razorpay.com/v1/checkout.js",
  );
  if (!loaded) {
    throw new Error(
      "Could not load the payment window. Please check your internet connection.",
    );
  }

  const { data } = await api.post("/payments/create-order", {
    order_id: orderId,
  });

  return new Promise((resolve, reject) => {
    const options = {
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      name: BRAND.name,
      description: `Order #${orderId}`,
      order_id: data.razorpay_order_id,
      prefill: { name: customer?.name, email: customer?.email },
      theme: { color: "#9a5b63" },
      handler: async (response) => {
        try {
          await api.post("/payments/verify", {
            order_id: orderId,
            ...response,
          });
          resolve(true);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => resolve(false) },
    };
    new window.Razorpay(options).open();
  });
}
