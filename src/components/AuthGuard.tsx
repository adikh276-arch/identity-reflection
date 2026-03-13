import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface UserInfoResponse {
  user_id: string;
}

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const resolveAuth = async () => {
      // Step 1: Check existing session
      const existingUserId = sessionStorage.getItem("user_id");
      if (existingUserId) {
        setIsAuthResolved(true);
        return;
      }

      // Step 2: Extract token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        // No token and no session, redirect
        window.location.href = "/token";
        return;
      }

      try {
        // Step 3: Validate Token
        const response = await fetch("https://api.mantracare.com/user/user-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error("Handshake failed");
        }

        const data: UserInfoResponse = await response.json();
        const userId = data.user_id;

        // Step 4: Handle Success
        sessionStorage.setItem("user_id", userId);

        // Step 5: Remove token from URL
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]+/, "");
        window.history.replaceState({}, "", newUrl);

        // Step 6: Initialize user in database (Phase 11)
        // Note: This will need to be handled by the backend
        await initializeUser(userId);

        setIsAuthResolved(true);
      } catch (error) {
        console.error("Auth error:", error);
        window.location.href = "/token";
      }
    };

    resolveAuth();
  }, [location, navigate]);

  const initializeUser = async (userId: string) => {
    try {
      // Step 6: Initialize user in database (Phase 11) via backend
      console.log(`Initializing user ${userId} in DB`);
      const response = await fetch("/identity_reflection/api/user/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("User init failed");
    } catch (e) {
      console.error("User initialization failed", e);
    }
  };

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-lavender border-t-transparent"></div>
          <p className="font-reflection animate-pulse">Establishing connection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
