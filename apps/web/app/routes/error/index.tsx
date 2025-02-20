import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { useSearchParams } from "react-router";
import { ErrorCodesMap } from "./types";

export default function Error() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const error = ErrorCodesMap[code as keyof typeof ErrorCodesMap];

  console.log("error", error, message);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-app-gradient p-6 md:p-10">
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-center gap-2 self-center font-medium">
          <div className="text-primary-foreground">
            <BaloonOutlineSvg className="size-6" />
          </div>
          <span className="text-xl font-bold">Mellow</span>
        </div>
        <div className="text-center">
          {error ? (
            <>
              <span className="text-2xl font-bold">{error.title}</span>
              <p className="text-md text-muted-foreground pt-2">
                {error.description}
              </p>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold">
                {code ? code : "Something went wrong"}
              </span>
              <p className="text-md text-muted-foreground">
                {message ? message : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
