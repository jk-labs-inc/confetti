import { DEFAULT_AVATAR_URL } from "@components/UI/Avatar/constants";
import { generatedAvatarDataUri } from "@components/UI/Avatar/generatedAvatarDataUri";
import useProfileData from "@hooks/useProfileData";
import { FC, useMemo } from "react";
import { AVATAR_BG } from "../constants";

interface VoterAvatarProps {
  address: string;
  clipKey: string;
  cx: number;
  cy: number;
  r: number;
}

const VoterAvatar: FC<VoterAvatarProps> = ({ address, clipKey, cx, cy, r }) => {
  const { profileAvatar } = useProfileData(address, true);
  const clipId = `voter-avatar-${clipKey}`;
  const hasRealAvatar = !!profileAvatar && profileAvatar !== DEFAULT_AVATAR_URL;

  const href = useMemo(
    () => (hasRealAvatar ? profileAvatar : generatedAvatarDataUri(address, Math.ceil(r * 2))),
    [hasRealAvatar, profileAvatar, address, r],
  );

  return (
    <g pointerEvents="none">
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={AVATAR_BG} />
      <image
        href={href}
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
      />
    </g>
  );
};

export default VoterAvatar;
