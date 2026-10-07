import { useEffect, useState } from "react";

// Returns true when something has been loading for longer than `delay` milliseconds.
// Used to show a friendly "the server is waking up" message.
export default function useSlowLoading(loading, delay = 3500) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = setTimeout(() => setSlow(true), delay);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [loading, delay]);

  return loading && slow;
}
