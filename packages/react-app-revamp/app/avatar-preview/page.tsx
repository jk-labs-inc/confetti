"use client";

/**
 * THROWAWAY PREVIEW — /avatar-preview
 * Verifies the production path: full-bleed mascot morph (no background, variant D).
 *  - real <Avatar> (GeneratedAvatar) — gray behind is the wrapper, as in-app
 *  - real generatedAvatarDataUri (base64) for the price-curve <image> markers
 * Delete this route when you're happy.
 */
import { Avatar } from "@components/UI/Avatar";
import { DEFAULT_AVATAR_URL } from "@components/UI/Avatar/constants";
import { generatedAvatarDataUri } from "@components/UI/Avatar/generatedAvatarDataUri";

const ADDRESSES = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "0x983110309620D911731Ac0932219af06091b6744",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0x1db3439a222c519ab44bb1144fc28167b4fa6ee6",
  "0x388C818CA8B9251b393131C08a736A67ccB19297",
  "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x0000000000000000000000000000000000000001",
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
];

export default function AvatarPreviewPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#1a1a1a", color: "#fff", padding: "48px 32px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Generated avatar — full-bleed mascot (D)</h1>
        <p style={{ color: "#9d9d9d", marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
          Real <code>&lt;Avatar&gt;</code>, no ENS case. Full-bleed mascot, no background — gray behind is the wrapper
          color, exactly as in the app. Same address → same avatar.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>&lt;Avatar&gt; at real sizes (medium 56 / extraSmall 24)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center", marginBottom: 40 }}>
          {ADDRESSES.map(addr => (
            <div key={addr} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar src={DEFAULT_AVATAR_URL} address={addr} size="medium" />
              <Avatar src={DEFAULT_AVATAR_URL} address={addr} size="extraSmall" />
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Price-curve markers (real generatedAvatarDataUri, base64)</h2>
        <p style={{ color: "#9d9d9d", marginBottom: 14, fontSize: 13 }}>Exactly the VoterAvatar path: gray bg circle + data-URI image, no ring.</p>
        <svg width={ADDRESSES.length * 40} height="56" style={{ overflow: "visible" }}>
          {ADDRESSES.map((addr, i) => {
            const r = 16;
            const cx = 20 + i * 40;
            const cy = 24;
            const clip = `clip-${i}`;
            return (
              <g key={addr} pointerEvents="none">
                <defs>
                  <clipPath id={clip}>
                    <circle cx={cx} cy={cy} r={r} />
                  </clipPath>
                </defs>
                <circle cx={cx} cy={cy} r={r} fill="#3D3D3D" />
                <image
                  href={generatedAvatarDataUri(addr, r * 2)}
                  x={cx - r}
                  y={cy - r}
                  width={r * 2}
                  height={r * 2}
                  clipPath={`url(#${clip})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </main>
  );
}
