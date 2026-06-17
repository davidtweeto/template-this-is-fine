import "./index.css";
import { Composition } from "remotion";
import { ThisIsFineComposition, ThisIsFineSchema, calculateMetadata } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ThisIsFine"
      component={ThisIsFineComposition}
      calculateMetadata={calculateMetadata}
      durationInFrames={340}
      fps={30}
      width={1080}
      height={1080}
      schema={ThisIsFineSchema}
      defaultProps={{
        line1: "Machine down",
        line2: "Material late",
        line3: "Operator missing",
        line4: "Customer priority changed",
        transitionSpeed: 1,
        fontSize: 135,
        lineHeight: 1,
        lineDuration: 1,
        backgroundFile: "this-is-fine.png",
        watermark: "",
      }}
    />
  );
};
