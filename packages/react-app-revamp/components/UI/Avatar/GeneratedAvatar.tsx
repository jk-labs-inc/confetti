import { FC } from "react";
import { MASCOT_AVATAR_IMG, MASCOT_RECT, getMorphParams } from "./mascotMorph";

interface GeneratedAvatarProps {
  seed: string;
}

export const GeneratedAvatar: FC<GeneratedAvatarProps> = ({ seed }) => {
  const p = getMorphParams(seed);
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        {/* The "morph" pipeline — each primitive is documented on MDN:
              feTurbulence       https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence
                                 Perlin-noise texture, used as the displacement source.
              feDisplacementMap  https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap
                                 shifts the mascot's pixels by that noise (R->x, G->y) = the warp.
              feColorMatrix      https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix
                                 type="hueRotate" spins the hue = the full repaint.
            hueRotate primer: https://johndjameson.com/posts/understanding-fecolormatrix-svg-filters */}
        <filter id={`f-${p.id}`} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={p.baseFrequency}
            numOctaves={2}
            seed={p.turbSeed}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={p.scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="w"
          />
          <feColorMatrix in="w" type="hueRotate" values={`${p.hueRotate}`} result="h" />
          <feColorMatrix in="h" type="saturate" values="1.1" />
        </filter>
      </defs>
      <image
        href={MASCOT_AVATAR_IMG}
        x={MASCOT_RECT.x}
        y={MASCOT_RECT.y}
        width={MASCOT_RECT.w}
        height={MASCOT_RECT.h}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#f-${p.id})`}
      />
    </svg>
  );
};
