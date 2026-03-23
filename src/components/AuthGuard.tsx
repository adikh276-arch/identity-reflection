import { useEffect, useState } from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      let userId = sessionStorage.getItem("user_id");
      if (!userId || isNaN(Number(userId))) {
        // Generate a random numeric user ID since DB uses BIGINT
        userId = Math.floor(Math.random() * 9000000000000000).toString();
        sessionStorage.setItem("user_id", userId);
        
        try {
          // Initialize user in database
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
