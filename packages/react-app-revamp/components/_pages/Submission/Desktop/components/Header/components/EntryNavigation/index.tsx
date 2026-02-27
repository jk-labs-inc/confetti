import useNavigateProposals from "@components/_pages/Submission/hooks/useNavigateProposals";
import CustomLink from "@components/UI/Link";
import { motion } from "motion/react";
import Image from "next/image";

const SubmissionPageDesktopEntryNavigation = () => {
  const { previousEntryUrl, nextEntryUrl } = useNavigateProposals();

  return (
    <div className="flex items-center gap-2">
      {previousEntryUrl && (
        <motion.div whileTap={{ scale: 0.95 }} style={{ willChange: "transform" }}>
          <CustomLink
            href={previousEntryUrl}
            scroll={false}
            aria-label="Previous entry"
            className="flex items-center justify-center w-12 h-8 bg-primary-2 rounded-[40px] transition-opacity hover:opacity-80"
          >
            <Image src="/entry/nav.svg" alt="prev" width={16} height={14.22} className="rotate-180" />
          </CustomLink>
        </motion.div>
      )}
      {nextEntryUrl && (
        <motion.div whileTap={{ scale: 0.95 }} style={{ willChange: "transform" }}>
          <CustomLink
            href={nextEntryUrl}
            scroll={false}
            aria-label="Next entry"
            className="flex items-center justify-center w-12 h-8 bg-primary-2 rounded-[40px] transition-opacity hover:opacity-80"
          >
            <Image src="/entry/nav.svg" alt="next" width={16} height={14.22} />
          </CustomLink>
        </motion.div>
      )}
    </div>
  );
};

export default SubmissionPageDesktopEntryNavigation;
