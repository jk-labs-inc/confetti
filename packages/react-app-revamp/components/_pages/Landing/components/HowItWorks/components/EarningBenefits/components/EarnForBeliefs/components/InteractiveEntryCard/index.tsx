import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { InteractiveEntryCardProps } from "./types";
import { useInteractiveEntryCard } from "./useInteractiveEntryCard";

const InteractiveEntryCard: FC<InteractiveEntryCardProps> = ({
  // TODO: replace with actual bubbles from figma (requested from david)
  imageSrc = "/landing/bubbles-money.png",
  authorName = "cowfund.eth",
}) => {
  const { voteCount, particles, clickId, handleUpvote, handleKeyDown } = useInteractiveEntryCard();

  return (
    <div className="relative flex flex-col gap-1 p-1.5 bg-true-black rounded-xl shadow-entry-card w-44 border border-transparent will-change-transform">
      <div className="rounded-xl overflow-hidden relative aspect-square">
        <img src={imageSrc} alt="Entry card demo" className="w-full h-full object-cover" />

        <div className="absolute inset-x-0 top-0 h-10 bg-linear-to-b from-true-black/50 to-transparent pointer-events-none" />

        <div className="absolute top-1 left-1">
          <img src="/contest/gold-medal.png" alt="Rank 1" className="w-6 h-6 object-contain" />
        </div>

        <div className="absolute top-1 right-1">
          <p className="text-[8px] font-bold text-neutral-15 drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">{authorName}</p>
        </div>

        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <AnimatePresence mode="popLayout">
              {particles.map(particle => (
                <motion.div
                  key={particle.id}
                  className="absolute left-1/2 top-1/2 pointer-events-none"
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0.8,
                    opacity: 1,
                    rotate: 0,
                  }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    scale: particle.scale,
                    opacity: 0,
                    rotate: particle.rotation,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <img src="/contest/upvote-2.svg" width={12} height={14} alt="" className="drop-shadow-lg" />
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              onClick={handleUpvote}
              onKeyDown={handleKeyDown}
              whileTap={{ scale: 0.9 }}
              className="group min-w-12 shrink-0 h-5 px-2 py-1 flex items-center justify-between gap-1.5 bg-gradient-vote hover:shadow-button-embossed-hover rounded-[12px] cursor-pointer text-true-black relative z-10"
              aria-label={`Upvote, current count: ${voteCount}`}
              tabIndex={0}
              style={{ willChange: "transform" }}
            >
              <motion.img
                key={`icon-${clickId}`}
                src="/contest/upvote-2.svg"
                width={10}
                height={12}
                alt="upvote"
                className="shrink-0"
                initial={{ y: 0 }}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 0.15 }}
              />
              <motion.p
                className="text-[12px] font-bold grow text-center"
                key={voteCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {voteCount}
              </motion.p>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEntryCard;
