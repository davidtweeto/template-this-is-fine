import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing, CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/Roboto";
import { BASE_ENTER, BASE_EXIT, FPS, SHAKE_DURATION } from "./constants";

const { fontFamily } = loadFont("normal", {
  weights: ["900"],
  subsets: ["latin"],
});

export const ThisIsFineSchema = z.object({
  line1: z.string(),
  line2: z.string(),
  line3: z.string(),
  line4: z.string(),
  transitionSpeed: z.number().min(0.1).max(10),
  fontSize: z.number().min(20).max(200),
  lineHeight: z.number().min(0.5).max(3),
  lineDuration: z.number().min(0.2).max(10),
  backgroundFile: z.string(),
  watermark: z.string(),
});

export type ThisIsFineProps = z.infer<typeof ThisIsFineSchema>;

const getShake = (frame: number, enterFrames: number, slot: number, lines: string[]) => {
  let x = 0;
  let y = 0;
  for (let i = 0; i < lines.length; i++) {
    const landFrame = i * slot + enterFrames;
    const rel = frame - landFrame;
    if (rel >= 0 && rel < SHAKE_DURATION) {
      const decay = Math.exp(-rel * 0.28);
      x -= 22 * Math.cos(rel * 1.2) * decay;
      y -= 10 * Math.cos(rel * 1.2 + 0.5) * decay;
    }
  }
  return { x, y };
};

const TextLine = ({
  text,
  startFrame,
  enterFrames,
  exitFrames,
  pauseFrames,
  fontSize,
  lineHeight,
}: {
  text: string;
  startFrame: number;
  enterFrames: number;
  exitFrames: number;
  pauseFrames: number;
  fontSize: number;
  lineHeight: number;
}) => {
  const frame = useCurrentFrame();

  const enterEnd = startFrame + enterFrames;
  const exitStart = enterEnd + pauseFrames;
  const exitEnd = exitStart + exitFrames;

  if (frame < startFrame || frame > exitEnd) return null;

  const x = (() => {
    if (frame < enterEnd) {
      return interpolate(frame, [startFrame, enterEnd], [1200, 0], {
        easing: (t) => t,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
    if (frame >= exitStart) {
      return interpolate(frame, [exitStart, exitEnd], [0, -1200], {
        easing: Easing.bezier(0.7, 0, 0.84, 0),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }
    return 0;
  })();

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        top: "50%",
        transform: `translate(${x}px, -50%)`,
        padding: "0 60px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "block",
          width: "fit-content",
          margin: "0 auto",
          fontSize,
          fontWeight: 900,
          fontFamily,
          letterSpacing: "-1px",
          lineHeight,
          wordBreak: "break-word",
          textAlign: "center",
          paddingBottom: "0.35em",
          background: "linear-gradient(125deg, #ff4800, #ff5400, #ff6000, #ff6d00, #ff7900, #ff8500, #ff9100, #ff9e00, #ffaa00, #ffb600)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const ThisIsFineComposition = ({ line1, line2, line3, line4, transitionSpeed, fontSize, lineHeight, lineDuration, backgroundFile, watermark }: ThisIsFineProps) => {
  const lines = [line1, line2, line3, line4];
  const frame = useCurrentFrame();
  const enterFrames = Math.max(1, Math.round(BASE_ENTER / transitionSpeed));
  const exitFrames = Math.max(1, Math.round(BASE_EXIT / transitionSpeed));
  const pauseFrames = Math.round(lineDuration * FPS);
  const slot = enterFrames + pauseFrames + exitFrames + 8;
  const { x: shakeX, y: shakeY } = getShake(frame, enterFrames, slot, lines);

  return (
    <AbsoluteFill style={{ backgroundColor: "white", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <Img
          src={staticFile(backgroundFile)}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: 680,
            objectFit: "cover",
            objectPosition: "top",
            display: "block",
          }}
        />
        {watermark ? (
          <div style={{ position: "absolute", bottom: 6, left: 14, fontSize: 24, fontFamily, fontWeight: 900, color: "#000", opacity: 0.5, letterSpacing: "0.05em" }}>
            {watermark}
          </div>
        ) : null}
        <div style={{ flex: 1, position: "relative" }}>
          {lines.map((line, i) => (
            <TextLine
              key={line}
              text={line}
              startFrame={i * slot}
              enterFrames={enterFrames}
              exitFrames={exitFrames}
              pauseFrames={pauseFrames}
              fontSize={fontSize}
              lineHeight={lineHeight}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const calculateMetadata: CalculateMetadataFunction<ThisIsFineProps> = ({ props }) => {
  const lines = [props.line1, props.line2, props.line3, props.line4];
  const enterFrames = Math.max(1, Math.round(BASE_ENTER / props.transitionSpeed));
  const exitFrames = Math.max(1, Math.round(BASE_EXIT / props.transitionSpeed));
  const pauseFrames = Math.round(props.lineDuration * FPS);
  const slot = enterFrames + pauseFrames + exitFrames + 8;
  const durationInFrames = (lines.length - 1) * slot + enterFrames + pauseFrames + exitFrames + 10;
  return { durationInFrames };
};
