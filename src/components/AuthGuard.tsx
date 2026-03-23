import { useEffect, useState } from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      let userId = sessionStorage.getItem("user_id");

      // Attempt to extract token from URL if we don't have a valid session
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token && (!userId || isNaN(Number(userId)))) {
        try {
          const response = await fetch("https://api.mantracare.com/user/user-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.user_id) {
              userId = data.user_id.toString();
              sessionStorage.setItem("user_id", userId);

              // Clean token from URL
              const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]+/, "");
              window.history.replaceState({}, "", newUrl);
            }
          }
        } catch (error) {
          console.warn("Token handshake failed, proceeding as guest:", error);
        }
      }

      // If we STILL don't have a valid BIGINT compatible userId, generate a local fallback
      if (!userId || isNaN(Number(userId))) {
        userId = Math.floor(Math.random() * 9000000000000000).toString();
        sessionStorage.setItem("user_id", userId);
      }
      
      try {
        // Initialize user in database
        console.log(`Initializing user ${userId} in DB`);
        const initRes = await fetch("/identity_reflection/api/user/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!initRes.ok) throw new Error("User init API failed");
      } catch (e) {
        console.error("User initialization failed", e);
      }

      setIsReady(true);
    };

    initializeSession();
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-lavender border-t-transparent"></div>
          <p className="font-reflection animate-pulse">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

