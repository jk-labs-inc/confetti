/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { SIZES, SizeType } from "../UserProfileDisplay/constants/sizes";
import { GeneratedAvatar } from "./GeneratedAvatar";
import { DEFAULT_AVATAR_URL } from "./constants";

export interface AvatarProps {
  src: string;
  /** Wallet address used to seed the generated fallback avatar when there's no real one. */
  address?: string;
  size?: SizeType;
  alt?: string;
  className?: string;
  asLink?: boolean;
  href?: string;
}

export const Avatar: FC<AvatarProps> = ({
  src,
  address,
  size = "small",
  alt = "avatar",
  className = "",
  asLink = false,
  href,
}) => {
  const { avatarSizeClass } = SIZES[size];
  const hasRealAvatar = !!src && src !== DEFAULT_AVATAR_URL;

  const avatarElement = (
    <div
      className={`flex items-center justify-center ${avatarSizeClass} bg-neutral-5 rounded-full overflow-hidden ${className}`}
    >
      {hasRealAvatar ? (
        <img style={{ width: "100%", height: "100%", objectFit: "cover" }} src={src} alt={alt} />
      ) : address ? (
        <GeneratedAvatar seed={address} />
      ) : (
        <UserCircleIcon className="w-full h-full text-neutral-9" />
      )}
    </div>
  );

  if (asLink && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {avatarElement}
      </a>
    );
  }

  return avatarElement;
};
