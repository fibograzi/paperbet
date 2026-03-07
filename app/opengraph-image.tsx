import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PaperBet.io — Test Your Edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0B0F1A 0%, #111827 50%, #0B0F1A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,160,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#00E5A0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
              color: "#0B0F1A",
            }}
          >
            P
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#F9FAFB",
              letterSpacing: "-1px",
            }}
          >
            PaperBet.io
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "28px",
            color: "#00E5A0",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          Test Your Edge
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "20px",
            color: "#9CA3AF",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Free Plinko, Crash & Mines simulators. Practice strategies risk-free.
        </p>

        {/* Game badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "32px",
          }}
        >
          {[
            { name: "Plinko", color: "#00E5A0" },
            { name: "Crash", color: "#00B4D8" },
            { name: "Mines", color: "#F59E0B" },
          ].map((game) => (
            <div
              key={game.name}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: `2px solid ${game.color}`,
                color: game.color,
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {game.name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
