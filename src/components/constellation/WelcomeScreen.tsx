import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WelcomeScreenProps {
  onStart: () => void;
  onHistory: () => void;
  hasHistory: boolean;
}

const WelcomeScreen = ({ onStart, onHistory, hasHistory }: WelcomeScreenProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center px-6 text-center max-w-sm mx-auto"
    >
      {/* Decorative star cluster */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="mb-8"
      >
        <svg width="70" height="70" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="4" className="fill-star-selected glow-star" />
          <circle cx="20" cy="25" r="2.5" className="fill-star" />
          <circle cx="60" cy="20" r="3" className="fill-accent-pink" />
          <circle cx="55" cy="58" r="2" className="fill-accent-blue" />
          <circle cx="15" cy="55" r="2.5" className="fill-accent-lavender" />
          <circle cx="40" cy="12" r="1.5" className="fill-accent-mint" />
          <line x1="40" y1="40" x2="20" y2="25" className="stroke-constellation" strokeWidth="0.5" opacity="0.5" />
          <line x1="40" y1="40" x2="60" y2="20" className="stroke-constellation" strokeWidth="0.5" opacity="0.5" />
          <line x1="40" y1="40" x2="55" y2="58" className="stroke-constellation" strokeWidth="0.5" opacity="0.5" />
          <line x1="40" y1="40" x2="15" y2="55" className="stroke-constellation" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-reflection text-base sm:text-lg leading-relaxed text-foreground/90 mb-8 text-justified"
      >
        {t("welcome_text")}
        <br />
        <span className="text-accent-lavender">{t("welcome_subtext")}</span>
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="bg-gradient-primary px-10 py-3 rounded-full text-primary-foreground font-semibold text-base tracking-wide shadow-lg shadow-primary/30"
      >
        {t("start_button")}
      </motion.button>

      {hasHistory && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onHistory}
          className="mt-4 flex items-center gap-2 px-6 py-2 rounded-full border border-secondary/50 text-secondary text-sm font-reflection hover:bg-secondary/10 transition-colors"
        >
          <History size={16} />
          {t("my_constellations")}
        </motion.button>
      )}
    </motion.div>
  );
};

export default WelcomeScreen;
