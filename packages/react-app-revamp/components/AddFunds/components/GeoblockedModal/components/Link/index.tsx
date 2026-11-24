import { FC, ReactNode } from "react";

interface GeoblockedLinkProps {
  href: string;
  children: ReactNode;
}

const GeoblockedLink: FC<GeoblockedLinkProps> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-positive-11 hover:text-positive-10">
    {children}
  </a>
);

export default GeoblockedLink;
