import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getEndTimeIntervals,
  getTimeIntervals,
  removeDurationLabel,
} from "@retro/common";
import { useCallback, useMemo } from "react";

export type RetroFormData = {
  name: string;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  isAnonymous: boolean;
};
export type RetroFormError = {
  name: string;
  endDate: string;
};

type RetroFormProps = {
  formId: string;
  formData: RetroFormData;
  error: RetroFormError;
  onFormSubmit: () => void;
  updateFormData: <K extends keyof RetroFormData>(
    key: K,
    value: RetroFormData[K],
  ) => void;
};

const START_TIME_INTERVALS = getTimeIntervals({
  intervalLength: 96,
  intervalDuration: 15,
});

const RetroForm = ({
  onFormSubmit,
  formId,
  formData,
  error,
  updateFormData,
}: RetroFormProps) => {
  const endTimeIntervals = useMemo(() => {
    return getEndTimeIntervals(formData.startTime);
  }, [formData.startTime]);
  const onChangeName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData("name", e.target.value);
  }, []);

  const onChangeEndDate = useCallback((date: Date | undefined) => {
    updateFormData("endDate", date);
  }, []);

  return (
    <form
      id={formId}
      onSubmit={async (event) => {
        event.preventDefault();
        onFormSubmit();
      }}
    >
      <h3 className="font-bold text-white">Create new retro</h3>
      <div className="flex flex-col">
        <p className="text-[#808080] text-xs mb-1 mt-4">Retro title</p>
        <Input
          placeholder="Enter retro title"
          className="text-white placeholder:text-[#5f5f5f] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-[10px] py-2 bg-[#1a1a1a] rounded-[6px] outline-none border-none"
          value={formData.name}
          onChange={onChangeName}
        />
        {error.name && (
          <span className="text-red-500 text-xs mt-0.5">{error.name}</span>
        )}
      </div>
      <div className="flex">
        <div className="flex flex-col flex-grow">
          <p className="text-[#808080] text-xs mb-1 mt-4">Pick a date</p>
          <DatePicker
            date={formData.endDate}
            onSelect={onChangeEndDate}
            className="rounded-md border"
            btnClassName="w-auto px-[10px] text-white placeholder:text-[#5f5f5f] bg-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none"
            hideCalendar
          />
          {error.endDate && (
            <span className="text-red-500 text-xs mt-0.5">{error.endDate}</span>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col flex-grow">
          <p className="text-[#808080] text-xs mb-1 mt-4">Start time</p>
          <Select
            value={formData.startTime}
            onValueChange={(value) => {
              updateFormData("startTime", value);
            }}
          >
            <SelectTrigger
              className="w-auto px-[10px] text-white placeholder:text-[#5f5f5f] bg-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:ring-0 focus-visible:ring-0 outline-none border-none
              focus-visible:ring-offset-0
            "
            >
              <SelectValue placeholder="Select a start time" />
            </SelectTrigger>
            <SelectContent>
              {START_TIME_INTERVALS.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col flex-grow">
          <p className="text-[#808080] text-xs mb-1 mt-4">End time</p>
          <Select
            value={formData.endTime}
            onValueChange={(value) => updateFormData("endTime", value)}
          >
            <SelectTrigger className="w-auto px-[10px] text-white placeholder:text-[#5f5f5f] bg-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none">
              <SelectValue
                placeholder="Select an end time"
                className="text-white"
              />
            </SelectTrigger>
            <SelectContent>
              {endTimeIntervals.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {formData.endTime === interval.value
                    ? removeDurationLabel(interval.label)
                    : interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-[#808080] text-sm mb-1 mt-4">Is Anonymous retro?</p>
        <Switch
          checked={formData.isAnonymous}
          onCheckedChange={(checked) => updateFormData("isAnonymous", checked)}
        />
      </div>
    </form>
  );
};

export default RetroForm;
