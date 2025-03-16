import { cn } from "@/lib/utils";

interface CollaboratorAvatarsProps {
  avatarSize?: 22 | 24 | 32 | 40;
  numPeople?: number;
  avatarUrls: string[];
}

const CollaboratorAvatars = ({
  avatarUrls,
  avatarSize = 24,
}: CollaboratorAvatarsProps) => {
  const visibleAvatars = avatarUrls.slice(0, 5);
  const remainingCount = avatarUrls.length - 5;

  return (
    <div
      className={cn(
        "z-10 rtl:space-x-reverse -space-x-2 h-[24px] rounded-2xl flex items-center justify-center",
      )}
    >
      {visibleAvatars.map((url, index) => (
        <div
          className="p-[0.5px] bg-white rounded-full border-2 border-white"
          style={{
            boxShadow: "0px 0px 1px 0px #00000080",
          }}
        >
          <img
            key={index}
            className={cn("rounded-full object-cover")}
            style={{
              width: avatarSize,
              height: avatarSize,
            }}
            src={url}
            alt={`Collaborator ${index + 1}`}
            referrerPolicy="no-referrer"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className="flex items-center justify-center rounded-full bg-secondary text-center text-xs font-medium bg-white p-[2px]"
          style={{
            width: avatarSize + 6,
            height: avatarSize + 6,
            boxShadow: "0px 0px 1px 0px #00000080",
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { CollaboratorAvatars };
