import { ImageResponse } from "next/og";

export const alt = "AddisDispatch — Dispatch, Engineered by Data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamically-rendered social card so OpenGraph/Twitter previews always exist,
// no static design asset required.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0d0b09 0%, #1a1712 60%, #241d13 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#f2891f",
            }}
          />
          <span style={{ color: "#f2891f", fontSize: "36px", fontWeight: 700 }}>
            AddisDispatch
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ color: "#f7f4ef", fontSize: "76px", fontWeight: 800, lineHeight: 1.05 }}>
            Dispatch, engineered by data.
          </span>
          <span style={{ color: "#a89b88", fontSize: "34px", maxWidth: "900px" }}>
            Route optimization, cost-per-mile intelligence, and carrier scoring for
            owner-operators and small fleets.
          </span>
        </div>

        <span style={{ color: "#6f6555", fontSize: "26px" }}>addisdispatch.com</span>
      </div>
    ),
    { ...size },
  );
}
