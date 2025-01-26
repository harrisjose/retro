import DueDate from "@/components/svg/duedate";
import Retro from "@/components/svg/retro";
import { getRelativeTime, getRemainingTime } from "@retro/common";
import { useDocumentList } from "@retro/sdk";
import { orderBy } from "lodash-es";
import { useMemo } from "react";
import { Link } from "react-router";
import RetroEmpty from "./retro-empty";

const RetroList = () => {
  const { documents, isLoading } = useDocumentList();

  const documentList = useMemo(() => {
    return orderBy(
      Object.values(documents),
      (document) => new Date(document.createdAt),
      "desc",
    );
  }, [documents]);

  // TODO: @aki change later
  if (isLoading) return <>Loading...</>;

  if (documentList.length === 0) return <RetroEmpty />;

  return (
    <ul className="flex gap-4 flex-wrap">
      {documentList.map((document) => {
        const remainingTime = getRemainingTime(new Date(document.endDate));
        return (
          <Link to={`/document/${document.id}`} key={document.id}>
            <li
              key={document.id}
              className="w-[216px] h-[150px] rounded-[10px] bg-white box-shadow-[0px_0px_1px_0px_#0000004D] px-4 py-3 flex flex-col justify-end"
            >
              <Retro className="w-[54px] h-[54px] mb-auto" />
              <div className="flex flex-col">
                <div className="font-bold">{document.name}</div>
                <div className="inline-flex gap-1 items-center text-[10px] leading-[11.64px] text-gray-500">
                  {getRelativeTime(new Date(document.createdAt))}{" "}
                  {remainingTime && (
                    <>
                      <span className="text-black opacity-10">|</span>
                      <DueDate className="text-[#FF8401]" />
                      {remainingTime}
                    </>
                  )}
                </div>
              </div>
            </li>
          </Link>
        );
      })}
    </ul>
  );
};

export default RetroList;
