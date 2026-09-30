import { Avatar } from "@components/UI/Avatar";
import useProfileData from "@hooks/useProfileData";
import { FC } from "react";
import { CHIP_AVATAR_CLASS_NAME, CHIP_AVATAR_STACKED_CLASS_NAME } from "../constants";

interface EntryVotersChipAvatarProps {
  address: string;
  isStacked: boolean;
}

const EntryVotersChipAvatar: FC<EntryVotersChipAvatarProps> = ({ address, isStacked }) => {
  const { profileAvatar } = useProfileData(address, true);

  return (
    <Avatar
      src={profileAvatar}
      address={address}
      size="extraSmall"
      className={`${CHIP_AVATAR_CLASS_NAME} ${isStacked ? CHIP_AVATAR_STACKED_CLASS_NAME : ""}`}
    />
  );
};

export default EntryVotersChipAvatar;
