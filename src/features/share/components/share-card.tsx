import { useState } from "react";

import { formatDate } from "@/lib/shared";
import { splashFrameOf } from "../lib/splash";
import { SHARE_COLORS, type ShareCardData, type ShareHero } from "../lib/share-card-data";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const FONT = '"Geist Variable", system-ui, -apple-system, "Segoe UI", sans-serif';

const FALLBACK_GRADIENT = "linear-gradient(165deg, #1c2a4a 0%, #0d1220 48%, #201430 100%)";
const SCRIM_TOP = "linear-gradient(180deg, rgba(6,9,18,0.55) 0%, rgba(6,9,18,0) 20%)";
const SCRIM_BOTTOM =
  "linear-gradient(180deg, rgba(7,10,20,0) 30%, rgba(7,10,20,0.62) 62%, rgba(7,10,20,0.94) 86%, rgba(7,10,20,0.98) 100%)";

function HeroSplash({
  hero,
  focalPoint,
}: {
  hero?: ShareHero;
  focalPoint?: { x: number; y: number };
}) {
  const [broken, setBroken] = useState(false);
  const x = focalPoint?.x ?? 0.5;
  const y = focalPoint?.y ?? 0.38;
  const translateX = (0.5 - x) * 32;
  const translateY = (0.38 - y) * 32;

  if (!hero || broken) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <img
        src={splashFrameOf(hero.name).src}
        alt=""
        onError={() => setBroken(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "82%",
          objectFit: "contain",
          objectPosition: "center top",
          transform: `translate(${translateX}%, ${translateY}%)`,
        }}
      />
    </div>
  );
}

function Chip({
  children,
  color = "#ffffff",
  bg = "rgba(255,255,255,0.12)",
  border = "rgba(255,255,255,0.25)",
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  border?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 18px",
        borderRadius: 999,
        fontSize: 19,
        fontWeight: 800,
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </span>
  );
}

function Portrait({ name, pity, url }: { name: string; pity: number; url?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div
      style={{ display: "flex", width: 90, flexDirection: "column", alignItems: "center", gap: 5 }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          border: `2px solid ${SHARE_COLORS.gold}`,
          overflow: "hidden",
          background: "linear-gradient(135deg, #f2c66d, #9a6b1f)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {url && !broken ? (
          <img
            src={url}
            alt={name}
            onError={() => setBroken(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              color: "#241505",
            }}
          >
            {name.trim().charAt(0).toUpperCase() || "?"}
          </div>
        )}
      </div>
      <span
        style={{
          maxWidth: 90,
          overflow: "hidden",
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(255,255,255,0.72)",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: SHARE_COLORS.gold }}>P{pity}</span>
    </div>
  );
}

function ShareCard({
  cardRef,
  data,
  focalPoint,
}: {
  cardRef?: React.Ref<HTMLDivElement>;
  data: ShareCardData;
  focalPoint?: { x: number; y: number };
}) {
  const { hero, stats, recent, profileName, generatedAt } = data;
  const nameSize = hero && hero.name.length > 10 ? 68 : 96;
  const statPriority = ["Total Summons", "Total Pulls", "6★", "Win Rate", "Avg Pity"];
  const displayStats = statPriority
    .map((label) => stats.find((stat) => stat.label === label))
    .filter((stat): stat is (typeof stats)[number] => Boolean(stat))
    .slice(0, 3);

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        overflow: "hidden",
        backgroundColor: "#0d1220",
        fontFamily: FONT,
        color: "#ffffff",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: FALLBACK_GRADIENT }} />
      {hero && <HeroSplash key={hero.name} hero={hero} focalPoint={focalPoint} />}
      <div style={{ position: "absolute", inset: 0, background: SCRIM_TOP }} />
      <div style={{ position: "absolute", inset: 0, background: SCRIM_BOTTOM }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px 44px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{ fontSize: 34, fontWeight: 900, letterSpacing: 9, color: SHARE_COLORS.gold }}
            >
              MEMORIA
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                letterSpacing: 4,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              REVERSE: 1999
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 18, color: "rgba(255,255,255,0.65)" }}>
            <div style={{ fontWeight: 700 }}>{profileName}</div>
            <div style={{ marginTop: 4, opacity: 0.7 }}>{generatedAt}</div>
          </div>
        </div>

        <div>
          {hero ? (
            <div>
              <div
                style={{
                  marginBottom: 10,
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: 4,
                  color: SHARE_COLORS.gold,
                  textTransform: "uppercase",
                }}
              >
                Obtained
              </div>
              <div
                style={{
                  fontSize: nameSize,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: 0.5,
                  textShadow: "0 6px 30px rgba(0,0,0,0.5)",
                }}
              >
                {hero.name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 28,
                  marginTop: 18,
                  alignItems: "flex-end",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                  <Chip color="#241505" bg={SHARE_COLORS.gold} border="rgba(0,0,0,0.15)">
                    {hero.rarity}★ Arcanist
                  </Chip>
                  {hero.rateOn != null && (
                    <Chip
                      color="#ffffff"
                      bg={hero.rateOn ? "rgba(60,200,140,0.22)" : "rgba(255,90,90,0.22)"}
                      border={hero.rateOn ? "rgba(95,224,168,0.6)" : "rgba(255,107,107,0.6)"}
                    >
                      {hero.rateOn ? "Rate ON" : "Rate OFF"}
                    </Chip>
                  )}
                </div>
                {hero.pity != null && (
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 92,
                        fontWeight: 900,
                        lineHeight: 0.82,
                        color: SHARE_COLORS.gold,
                        textShadow: "0 6px 24px rgba(0,0,0,0.45)",
                      }}
                    >
                      {String(hero.pity).padStart(2, "0")}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 15,
                        fontWeight: 800,
                        letterSpacing: 4,
                        color: "rgba(255,255,255,0.62)",
                      }}
                    >
                      PITY
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 28,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {hero.bannerName}
              </div>
              <div style={{ marginTop: 6, fontSize: 20, color: "rgba(255,255,255,0.55)" }}>
                {hero.bannerType} · {formatDate(hero.createTime) || "—"}
              </div>
            </div>
          ) : data.heading ? (
            <div>
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  textShadow: "0 6px 30px rgba(0,0,0,0.5)",
                }}
              >
                {data.heading.title}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 26,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {data.heading.subtitle}
              </div>
            </div>
          ) : null}

          <div
            style={{
              marginTop: 26,
              borderRadius: 14,
              padding: "24px 28px",
              backgroundColor: "rgba(10,14,26,0.72)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderTop: `2px solid ${SHARE_COLORS.gold}`,
              boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.max(displayStats.length, 1)}, 1fr)`,
                gap: 28,
              }}
            >
              {displayStats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: 1.8,
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 2,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                Recent 6★
              </span>
              <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
                {recent.slice(0, 6).map((r) => (
                  <Portrait key={r.id} name={r.name} pity={r.pity} url={r.portraitUrl} />
                ))}
                {recent.length > 6 && (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.85)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px dashed rgba(255,255,255,0.3)",
                    }}
                  >
                    +{recent.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 30,
              paddingTop: 22,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
              }}
            >
              By community, for community
            </span>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.38)" }}>
              Generated by Memoria
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ShareCard };
