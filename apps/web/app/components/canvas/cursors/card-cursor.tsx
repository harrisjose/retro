import { Cursor } from "../../ui/cursor";

export default function CardCursor({
  width,
  height,
  cardColor,
  cameraZ,
}: {
  width: number;
  height: number;
  cardColor: string;
  cameraZ: number;
}) {
  return (
    <Cursor attachToParent>
      <div
        className="relative"
        style={{
          transform: `scale(${cameraZ})`,
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 border border-transparent"
          style={{
            width: width,
            height: height,
            backgroundColor: cardColor,
            borderRadius: "10px",
            opacity: 0.3,
          }}
        ></div>
      </div>
    </Cursor>
  );
}
