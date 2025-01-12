import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getFormattedEndDate, getFormattedStartDate } from "@retro/common";
import { authClient, useCreateDocument } from "@retro/sdk";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

const FooterPanel = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<{
    name: string;
    startDate: string;
    endDate: string;
  }>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const onLogout = () => {
    authClient.signOut({ fetchOptions: { onSuccess: () => navigate("/") } });
  };
  const { createDocument } = useCreateDocument();
  const validate = useCallback(() => {
    if (!name) {
      setError((prev) => ({ ...prev, name: "Please enter a name" }));
      return false;
    }
    if (!startDate) {
      setError((prev) => ({ ...prev, startDate: "Please pick a start date" }));
      return false;
    }
    if (!endDate) {
      setError((prev) => ({ ...prev, endDate: "Please pick an end date" }));
      return false;
    }

    return true;
  }, [startDate, endDate, name]);

  const onCreateBoard = async () => {
    if (!validate()) return;
    setError({ name: "", startDate: "", endDate: "" });
    const documentId = await createDocument({
      organizationId: activeOrganization!.id,
      name,
      startDate: getFormattedStartDate(startDate!),
      endDate: getFormattedEndDate(endDate!),
    });
    console.log(`Created document with id: ${documentId}`);
    setOpen(false);
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError((prev) => ({ ...prev, name: "" }));
  };

  return (
    <footer className="flex justify-center gap-2 fixed bottom-4 left-0 right-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {open ? (
            <Button
              onClick={(event) => {
                event.preventDefault();
                onCreateBoard();
              }}
            >
              Create new retro
            </Button>
          ) : (
            <Button onClick={() => setOpen(true)}>Create new retro</Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="flex flex-col w-[360px] bg-black rounded-[12px] p-3">
          <h3 className="font-bold text-white">Create new retro</h3>
          <div className="flex flex-col">
            <p className="text-[#808080] text-xs mb-1 mt-4">Retro title</p>
            <Input
              placeholder="Enter retro title"
              className="text-white placeholder:text-[#5f5f5f] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-[10px] py-2 bg-[#1a1a1a] rounded-[6px] outline-none border-none"
              value={name}
              onChange={onChangeName}
            />
            {error.name && (
              <span className="text-red-500 text-xs mt-0.5">{error.name}</span>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col flex-grow">
              <p className="text-[#808080] text-xs mb-1 mt-4">Start date</p>
              <DatePicker
                date={startDate}
                onSelect={setStartDate}
                className="rounded-md border"
                btnClassName="w-auto px-[10px] text-white placeholder:text-[#5f5f5f] bg-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none"
                hideCalendar
              />
              {error.startDate && (
                <span className="text-red-500 text-xs mt-0.5">
                  {error.startDate}
                </span>
              )}
            </div>
            <div className="flex flex-col flex-grow">
              <p className="text-[#808080] text-xs mb-1 mt-4">End date</p>
              <DatePicker
                date={endDate}
                onSelect={setEndDate}
                className="rounded-md border"
                btnClassName="w-auto px-[10px] text-white placeholder:text-[#5f5f5f] bg-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none"
                hideCalendar
              />
              {error.endDate && (
                <span className="text-red-500 text-xs mt-0.5">
                  {error.endDate}
                </span>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* <Button onClick={onLogout}>Log out</Button> */}
    </footer>
  );
};

export default FooterPanel;
