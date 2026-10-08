import { useState } from "react";
import { BRAND } from "../config";

const KEY = "ona_last_pin_v1";

function readSavedPin() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export default function DeliveryCheck() {
  const [pin, setPin] = useState(readSavedPin);
  const [result, setResult] = useState(null); // { ok: true/false, text: '...' }
  const [checking, setChecking] = useState(false);

  async function handleCheck(e) {
    e.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setResult({ ok: false, text: "Please enter a valid 6-digit PIN code." });
      return;
    }

    setChecking(true);
    let place = "";
    let notFound = false;

    // A free public lookup tells us the district and state for the PIN code.
    // If it is slow or unavailable, we still show the standard estimate.
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      const office = data?.[0]?.PostOffice?.[0];
      if (data?.[0]?.Status === "Success" && office) {
        place = `${office.District}, ${office.State}`;
      } else {
        notFound = true;
      }
    } catch {
      // Lookup unavailable: continue with the standard estimate
    }

    if (notFound) {
      setResult({
        ok: false,
        text: "We could not find that PIN code. Please check it and try again.",
      });
    } else {
      try {
        localStorage.setItem(KEY, pin);
      } catch {
        // Storage can be blocked. That is fine.
      }
      const estimate =
        (BRAND.delivery && BRAND.delivery.estimate) || "5 to 7 working days";
      setResult({
        ok: true,
        text: `${place ? `Delivering to ${place}. ` : ""}Estimated delivery: ${estimate}.`,
      });
    }
    setChecking(false);
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium mb-2">Check delivery</p>
      <form onSubmit={handleCheck} className="flex gap-2 max-w-xs">
        <input
          className="input text-sm"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter PIN code"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        />
        <button className="btn btn-outline" disabled={checking}>
          {checking ? "..." : "Check"}
        </button>
      </form>
      {result && (
        <p
          className={`text-sm mt-2 ${result.ok ? "text-ink/80" : "text-red-600"}`}
        >
          {result.text}
        </p>
      )}
    </div>
  );
}
