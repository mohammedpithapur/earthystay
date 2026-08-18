"use client";

import { useEffect, useState } from "react";
import { isPushSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } from "@/lib/push";

interface Props {
  /** JWT access token from auth context */
  token: string | null;
}

export default function PushSubscribeButton({ token }: Props) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!isPushSupported()) return;
    setSupported(true);
    setPermission(Notification.permission);
    isSubscribed().then(setSubscribed);
  }, []);

  if (!supported) return null;

  const handleToggle = async () => {
    if (!token) return;
    setLoading(true);

    if (subscribed) {
      const ok = await unsubscribeFromPush(token);
      if (ok) setSubscribed(false);
    } else {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setLoading(false);
        return;
      }
      const ok = await subscribeToPush(token);
      if (ok) setSubscribed(true);
    }

    setLoading(false);
  };

  const blocked = permission === "denied";

  return (
    <button
      onClick={handleToggle}
      disabled={loading || blocked || !token}
      title={
        blocked
          ? "Notifications blocked in browser settings"
          : subscribed
          ? "Disable booking notifications"
          : "Enable booking notifications"
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 12px",
        borderRadius: "6px",
        border: subscribed ? "1px solid #c9a84a" : "1px solid #d4cdc4",
        background: subscribed ? "#fffdf5" : "#ffffff",
        color: subscribed ? "#9a7a2f" : "#5f574d",
        fontSize: "13px",
        fontWeight: 600,
        cursor: loading || blocked ? "not-allowed" : "pointer",
        opacity: blocked ? 0.5 : 1,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <BellIcon active={subscribed} />
      )}
      {blocked
        ? "Notifications Blocked"
        : subscribed
        ? "Notifications On"
        : "Enable Notifications"}
    </button>
  );
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? "#c9a84a" : "none"} stroke={active ? "#c9a84a" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
