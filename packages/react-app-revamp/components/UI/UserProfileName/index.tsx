import { ROUTE_VIEW_USER } from "@config/routes";
import { FC } from "react";
import CustomLink from "../Link";
import { SIZES, SizeType } from "../UserProfileDisplay/constants/sizes";

export interface UserProfileNameProps {
  ethereumAddress: string;
  profileName: string;
  size?: SizeType;
  textColor?: string;
  byTextColor?: string;
  asLink?: boolean;
  showBy?: boolean;
  target?: "_blank" | "_self";
  className?: string;
}

export const UserProfileName: FC<UserProfileNameProps> = ({
  ethereumAddress,
  profileName,
  size = "small",
  textColor,
  byTextColor,
  asLink = true,
  showBy = false,
  target = "_blank",
  className = "",
}) => {
  const { textSizeClass } = SIZES[size];
  const textColorClass = textColor || "text-neutral-11";
  const byColorClass = byTextColor || textColorClass;

  const nameContent = asLink ? (
    <CustomLink
      className={`${textSizeClass} font-bold ${textColorClass} no-underline ${className}`}
      target={target}
      href={`${ROUTE_VIEW_USER.replace("[address]", ethereumAddress)}`}
    >
      {profileName}
    </CustomLink>
  ) : (
    <span className={`${textSizeClass} font-bold ${textColorClass} ${className}`}>{profileName}</span>
  );

  if (showBy) {
    return (
      <span className="flex items-center gap-1">
        <span className={`${textSizeClass} font-bold ${byColorClass}`}>by</span>
        {nameContent}
      </span>
    );
  }

  return nameContent;
};

export default UserProfileName;
