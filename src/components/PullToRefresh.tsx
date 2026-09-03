import React, { useState, useRef, ReactNode } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 75;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      // Resistance effect
      setPullY(Math.min(diff * 0.45, 110));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullY(60);
      try {
        await onRefresh();
      } catch (e) {
        console.error('Refresh error:', e);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullY(0);
        }, 500);
      }
    } else {
      setPullY(0);
    }
    startY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full overflow-y-auto flex-1 relative no-scrollbar"
    >
      {/* Pull Indicator Header */}
      <AnimatePresence>
        {(pullY > 0 || isRefreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isRefreshing ? 55 : pullY, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full flex items-center justify-center bg-[#E9F7F1]/80 dark:bg-[#12281D]/80 backdrop-blur-xs border-b border-[#008F5B]/20 overflow-hidden shrink-0"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#008F5B] dark:text-[#10E594]">
              {isRefreshing ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-[#008F5B] dark:text-[#10E594]" />
                  <span>Syncing with Firebase...</span>
                </>
              ) : (
                <>
                  <ArrowDown
                    size={16}
                    style={{ transform: `rotate(${Math.min(pullY * 2.5, 180)}deg)` }}
                    className="transition-transform duration-100"
                  />
                  <span>
                    {pullY >= PULL_THRESHOLD ? 'Release to reload data' : 'Pull down to reload'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
};
