import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "@/components/constellation/WelcomeScreen";
import StarSelectionScreen from "@/components/constellation/StarSelectionScreen";
import ReflectionScreen from "@/components/constellation/ReflectionScreen";
import HistoryScreen from "@/components/constellation/HistoryScreen";
import type { SavedConstellation } from "@/components/constellation/HistoryScreen";
import BackgroundStars from "@/components/constellation/BackgroundStars";

export interface StarData {
  id: number;
  x: number;
  y: number;
  label: string;
}

const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "selection" | "reflection" | "history">("welcome");
  const [stars, setStars] = useState<StarData[]>([]);
  const [savedConstellations, setSavedConstellations] = useState<SavedConstellation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = sessionStorage.getItem("user_id");

  const fetchConstellations = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/identity_reflection/api/constellations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedConstellations(data);
      }
    } catch (e) {
      console.error("Failed to fetch constellations", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConstellations();
  }, [fetchConstellations]);

  const handleStart = useCallback(() => setScreen("selection"), []);
  const handleHistory = useCallback(() => setScreen("history"), []);

  const handleComplete = useCallback((completedStars: StarData[]) => {
    setStars(completedStars);
    setScreen("reflection");
  }, []);

  const handleSave = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/identity_reflection/api/constellations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stars }),
      });
      if (res.ok) {
        await fetchConstellations();
        setScreen("welcome");
      }
    } catch (e) {
      console.error("Failed to save constellation", e);
    }
  }, [stars, userId, fetchConstellations]);

  const handleDelete = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/identity_reflection/api/constellations/${id}?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchConstellations();
      }
    } catch (e) {
      console.error("Failed to delete constellation", e);
    }
  }, [userId, fetchConstellations]);

  const handleViewSaved = useCallback((c: SavedConstellation) => {
    setStars(c.stars);
    setScreen("reflection");
  }, []);

  const handleReset = useCallback(() => {
    setStars([]);
    setScreen("welcome");
  }, []);

  const handleBack = useCallback(() => setScreen("welcome"), []);

  return (
    <div className="relative min-h-screen bg-night-sky overflow-hidden">
      <BackgroundStars />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-6 px-2">
        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <WelcomeScreen key="welcome" onStart={handleStart} onHistory={handleHistory} hasHistory={savedConstellations.length > 0} />
          )}
          {screen === "selection" && (
            <StarSelectionScreen key="selection" onComplete={handleComplete} onBack={handleBack} />
          )}
          {screen === "reflection" && (
            <ReflectionScreen
              key="reflection"
              stars={stars}
              onSave={handleSave}
              onCreateAnother={handleReset}
            />
          )}
          {screen === "history" && (
            <HistoryScreen
              key="history"
              constellations={savedConstellations}
              onBack={handleBack}
              onDelete={handleDelete}
              onView={handleViewSaved}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
