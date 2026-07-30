import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { FC, ReactNode, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useCreateContestFormStore } from "../../store";
import { sectionElementId } from "../../hooks/useSectionNavigation";
import { FormSection } from "../../types";

interface CreateFormSectionProps {
  id: FormSection;
  title: string;
  errorMessage?: string | null;
  children: ReactNode;
}

const CreateFormSection: FC<CreateFormSectionProps> = ({ id, title, errorMessage, children }) => {
  const { isOpen, toggleSection } = useCreateContestFormStore(
    useShallow(state => ({
      isOpen: state.openSections[id],
      toggleSection: state.toggleSection,
    })),
  );
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <section id={sectionElementId(id)} className="flex flex-col py-4 scroll-mt-20">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        aria-expanded={isOpen}
        className="flex items-center gap-4 cursor-pointer w-fit"
      >
        <p
          className={`text-[16px] font-bold uppercase text-left min-w-[112px] ${errorMessage ? "text-negative-11" : "text-neutral-9"}`}
        >
          {title}
        </p>
        <ChevronDownIcon
          className={`w-6 h-6 text-neutral-9 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {errorMessage ? <p className="text-[12px] md:text-[16px] font-bold text-negative-11 mt-2">{errorMessage}</p> : null}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
        // clip while the height animates, then let it overflow so children's shadows and
        // dropdowns aren't cut off at the section's edges
        className={isOpen && !isAnimating ? "overflow-visible" : "overflow-hidden"}
        inert={!isOpen}
      >
        <div className="pt-6 pb-2">{children}</div>
      </motion.div>
    </section>
  );
};

export default CreateFormSection;
