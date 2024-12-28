import { cn } from "@/lib/utils";

interface CollaboratorAvatarsProps {
  className?: string;
  avatarSize?: 16 | 24 | 32 | 40;
  numPeople?: number;
  avatarUrls: string[];
}

const CollaboratorAvatars = ({
  className,
  avatarUrls,
  avatarSize = 16,
}: CollaboratorAvatarsProps) => {
  const visibleAvatars = avatarUrls.slice(0, 5);
  const remainingCount = avatarUrls.length - 5;

  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {visibleAvatars.map((url, index) => (
        <img
          key={index}
          className={cn("rounded-full object-cover")}
          style={{
            width: avatarSize,
            height: avatarSize,
          }}
          src={url}
          alt={`Avatar ${index + 1}`}
          referrerPolicy="no-referrer"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className="flex items-center justify-center rounded-full bg-secondary text-center text-xs font-medium text-white"
          style={{
            width: avatarSize,
            height: avatarSize,
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { CollaboratorAvatars };
