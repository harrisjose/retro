import { useFollowAlongCameraPosition } from "@retro/sdk";
import { Button } from "../ui/button";

export const FollowAlongWrapper = () => {
  const { followAlongUser, setFollowAlongUserId } =
    useFollowAlongCameraPosition();

  return (
    <>
      {followAlongUser && (
        <>
          <div
            className="absolute inset-0 border-[4px] pointer-events-none z-50"
            style={{
              borderColor: followAlongUser.color.primary,
            }}
          ></div>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white text-xs rounded-b-md px-2 py-2"
            style={{
              background: followAlongUser.color.primary,
              color: "#fff",
            }}
          >
            <span className="font-medium">
              Following {followAlongUser.name}
            </span>
            <Button
              variant="outline"
              size="xs"
              className="text-xs text-black"
              onClick={() => setFollowAlongUserId(null)}
            >
              Stop
            </Button>
          </div>
        </>
      )}
    </>
  );
};
