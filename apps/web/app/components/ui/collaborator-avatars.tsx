import { cn } from "@/lib/utils";
import type { Collaborator } from "@retro/common";
import { authClient, useFollowAlongUser } from "@retro/sdk";
import { memo, useMemo } from "react";

interface CollaboratorAvatarsProps {
  numPeople?: number;
  collaborators: Collaborator[];
}

const CollaboratorAvatar = memo(
  ({
    collaborator,
    currentUserId,
    onFollow,
    followAlongUser,
  }: {
    collaborator: Collaborator;
    currentUserId: string | undefined;
    onFollow: (id: string) => void;
    followAlongUser: {
      id: string;
      name: string;
      image: string | null;
      email: string;
      color: {
        primary: string;
      };
    } | null;
  }) => {
    const isFollowing = useMemo(
      () =>
        followAlongUser?.id ? followAlongUser.id === collaborator.id : false,
      [followAlongUser?.id, collaborator.id],
    );

    return (
      <div
        className="p-[0.5px] bg-white rounded-full border-2"
        style={{
          boxShadow: "0px 0px 1px 0px #00000080",
          borderColor: isFollowing ? followAlongUser!.color.primary : "white",
        }}
        onClick={() => {
          // Skipping setting current user as the follow along user
          if (collaborator.id !== currentUserId) {
            onFollow(collaborator.id);
          }
        }}
      >
        <img
          className="rounded-full object-cover"
          style={{
            width: 24,
            height: 24,
          }}
          src={collaborator.image ?? ""}
          alt={collaborator.name || `Collaborator`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  },
);

const RemainingCount = memo(({ count }: { count: number }) => {
  if (count <= 0) return null;

  return (
    <div
      className="flex items-center justify-center rounded-full bg-secondary text-center text-xs font-medium bg-white p-[2px]"
      style={{
        width: 24 + 6,
        height: 24 + 6,
        boxShadow: "0px 0px 1px 0px #00000080",
      }}
    >
      +{count}
    </div>
  );
});

const CollaboratorAvatars = memo(
  ({ collaborators }: CollaboratorAvatarsProps) => {
    const { data } = authClient.useSession();
    const visibleAvatars = collaborators.slice(0, 5);
    const remainingCount = collaborators.length - 5;

    const { user: followAlongUser, setFollowAlong } = useFollowAlongUser();

    const currentUserId = data?.user.id;

    return (
      <div
        className={cn(
          "z-10 rtl:space-x-reverse -space-x-2 h-[24px] rounded-2xl flex items-center justify-center",
        )}
      >
        {visibleAvatars.map((collaborator) => (
          <CollaboratorAvatar
            key={collaborator.id}
            collaborator={collaborator}
            currentUserId={currentUserId}
            onFollow={setFollowAlong}
            followAlongUser={followAlongUser}
          />
        ))}
        <RemainingCount count={remainingCount} />
      </div>
    );
  },
);

export { CollaboratorAvatars };
