import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { StarData } from "@/pages/Index";
import { ArrowLeft, Trash2 } from "lucide-react";

export interface SavedConstellation {
  id: string;
  stars: StarData[];
  createdAt: string;
}

interface HistoryScreenProps {
  constellations: SavedConstellation[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onView: (constellation: SavedConstellation) => void;
}

const HistoryScreen = ({ constellations, onBack, onDelete, onView }: HistoryScreenProps) => {
  const { t } = useTranslation();

  const renderMiniConstellation = (stars: StarData[]) => {
    const minX = Math.min(...stars.map((s) => s.x));
    const maxX = Math.max(...stars.map((s) => s.x));
    const minY = Math.min(...stars.map((s) => s.y));
    const maxY = Math.max(...stars.map((s) => s.y));
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const normalized = stars.map((s) => ({
      ...s,
      nx: 10 + ((s.x - minX) / rangeX) * 80,
      ny: 10 + ((s.y - minY) / rangeY) * 80,
    }));

    return (
      <svg width="100" height="100" viewBox="0 0 100 100">
        {normalized.map((star, i) => {
          if (i === 0) return null;
          const prev = normalized[i - 1];
          return (
            <line
              key={`l-${i}`}
              x1={prev.nx} y1={prev.ny} x2={star.nx} y2={star.ny}
              className="stroke-constellation" strokeWidth="1" opacity="0.5"
            />
          );
        })}
        {normalized.map((star) => (
          <circle key={star.id} cx={star.nx} cy={star.ny} r="3" className="fill-star-selected" />
        ))}
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center w-full max-w-md mx-auto px-4"
    >
      <div className="w-full flex items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors text-foreground/70"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h2 className="flex-1 text-center font-reflection text-lg text-foreground/90">
          {t("my_constellations")}
        </h2>
        <div className="w-9" />
      </div>

      {constellations.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-reflection text-sm text-muted-foreground text-justified mt-12"
        >
          {t("no_constellations")}
        </motion.p>
      ) : (
        <div className="w-full space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {constellations.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3 bg-card/60 border border-border/50 rounded-xl p-3 cursor-pointer hover:bg-card/80 transition-colors"
              onClick={() => onView(c)}
            >
              <div className="shrink-0">{renderMiniConstellation(c.stars)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/90 font-reflection truncate">
                  {c.stars.map((s) => s.label).join(" · ")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="p-2 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HistoryScreen;
