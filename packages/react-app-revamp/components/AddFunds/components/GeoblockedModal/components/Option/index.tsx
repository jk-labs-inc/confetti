import { FC, ReactNode } from "react";

interface GeoblockedOptionProps {
  label: ReactNode;
  children: ReactNode;
}

const GeoblockedOption: FC<GeoblockedOptionProps> = ({ label, children }) => (
  <section className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-neutral-2 p-3.5 md:gap-2.5 md:p-4">
    <p className="font-bold">{label}</p>
    {children}
  </section>
);

export default GeoblockedOption;
