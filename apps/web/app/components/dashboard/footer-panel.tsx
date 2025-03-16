import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  cn,
  getDuration,
  getStartAndEndTime,
  toDate,
  toZonedTime,
} from "@retro/common";
import { authClient, useCreateDocument, useProfile } from "@retro/sdk";
import { format } from "date-fns";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { RetroFormData, RetroFormError } from "./retro-form";
import RetroForm from "./retro-form";
import { RetroGcalIntegration } from "./retro-gcal-integration";

const FooterPanel = () => {
  const { profile } = useProfile();

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { createDocument } = useCreateDocument();

  const [open, setOpen] = useState<boolean>(false);
  const [isCreationInProgress, setIsCreationInProgress] =
    useState<boolean>(false);
  const [showGcalIntegration, setShowGcalIntegration] =
    useState<boolean>(false);

  const formId = "create-retro-form";

  const [retroData, setRetroData] = useState<RetroFormData>({
    name: "",
    endDate: new Date(),
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState<RetroFormError>({
    name: "",
    endDate: "",
  });

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      resetForm();
    } else if (showGcalIntegration) {
      setShowGcalIntegration(false);
    }
    setOpen(open);
  }, []);

  const resetForm = useCallback(() => {
    setRetroData({
      name: "",
      endDate: new Date(),
      startTime: getStartAndEndTime(profile!.timezone).startTime,
      endTime: getStartAndEndTime(profile!.timezone).endTime,
    });
    setError({ name: "", endDate: "" });
  }, [profile!.timezone]);

  useEffect(() => {
    if (!profile?.timezone) return;
    setRetroData((prev) => ({
      ...prev,
      endDate: toZonedTime(new Date(), profile.timezone),
      startTime: getStartAndEndTime(profile!.timezone).startTime,
      endTime: getStartAndEndTime(profile!.timezone).endTime,
    }));
  }, [profile!.timezone]);

  const validate = useCallback(() => {
    if (!retroData.name) {
      setError((prev) => ({ ...prev, name: "Please enter a name" }));
      return false;
    }
    if (!retroData.endDate) {
      setError((prev) => ({ ...prev, endDate: "Please pick an end date" }));
      return false;
    }

    return true;
  }, [retroData.endDate, retroData.name]);

  const onCreateRetro = useCallback(async () => {
    if (!open) {
      setOpen(true);
      return;
    }
    if (!validate() || isCreationInProgress) return;
    setIsCreationInProgress(true);
    setError({ name: "", endDate: "" });

    try {
      const duration = getDuration(retroData.startTime, retroData.endTime);
      // Parse time components
      const [startHours, startMinutes] = retroData.startTime
        .split(":")
        .map(Number);

      // Create date in user's timezone
      const endDateStr = format(retroData.endDate!, "yyyy-MM-dd");
      const startTimeStr = `${startHours.toString().padStart(2, "0")}:${startMinutes.toString().padStart(2, "0")}:00`;
      const dateTimeStr = `${endDateStr}T${startTimeStr}`;

      // Convert to UTC for storage
      const endDateTime = toDate(dateTimeStr, {
        timeZone: profile!.timezone,
      });

      const documentId = await createDocument({
        organizationId: activeOrganization!.id,
        name: retroData.name,
        endDateTime,
        duration,
      });
      console.log(`Created document with id: ${documentId}`);
    } catch (error) {
      console.error("Error creating board:", error);
    } finally {
      setIsCreationInProgress(false);
      setShowGcalIntegration(true);
      resetForm();
    }
  }, [
    isCreationInProgress,
    retroData.endDate,
    retroData.name,
    open,
    createDocument,
    activeOrganization,
    profile!.timezone,
  ]);

  const updateFormData = useCallback(
    <K extends keyof RetroFormData>(key: K, value: RetroFormData[K]) => {
      setRetroData((prev) => ({ ...prev, [key]: value }));
      setError((prev) => ({ ...prev, [key]: "" }));
    },
    [],
  );

  return (
    <footer
      className={cn(
        `flex justify-center gap-2 fixed bottom-4 left-0 right-0`,
        open && !showGcalIntegration && "z-[100]",
      )}
    >
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <motion.div
            className={cn("flex justify-center rounded-md")}
            initial={false}
            animate={{
              width: open ? 336 : "auto",
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <Button
              variant={"brand"}
              size={"brand"}
              className={cn("w-full")}
              formId={formId}
              isLoading={isCreationInProgress}
              onClick={(event) => {
                event.preventDefault();
                onCreateRetro();
              }}
            >
              Create new retro
              <span className=" opacity-50 text-xs">⌘+N</span>
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={-52}
          className={cn(
            `flex flex-col w-[360px] bg-black rounded-[12px] p-3`,
            !showGcalIntegration && "pb-[72px]",
          )}
          onInteractOutside={(event) => {
            !showGcalIntegration && event.preventDefault();
          }}
        >
          <PopoverClose className="absolute right-3 top-3">
            <X className="h-4 w-4 text-[#808080] hover:text-white cursor-pointer" />
          </PopoverClose>
          {showGcalIntegration ? (
            <RetroGcalIntegration retroData={retroData} />
          ) : (
            <RetroForm
              formId={formId}
              formData={retroData}
              error={error}
              updateFormData={updateFormData}
              onFormSubmit={onCreateRetro}
            />
          )}
        </PopoverContent>
      </Popover>
    </footer>
  );
};

export default FooterPanel;
