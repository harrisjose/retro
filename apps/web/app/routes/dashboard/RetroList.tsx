import DueDate from "@/components/svg/duedate";
import { useDocumentList } from "@retro/sdk/src/document";
import { useMemo } from "react";
import { Link } from "react-router";
import RetroEmpty from "./RetroEmpty";

const RetroList = () => {
  const { documents, isLoading } = useDocumentList();

  // TODO: @aki change later
  if (isLoading) return <>Loading...</>;

  const documentList = useMemo(() => Object.values(documents), [documents]);

  if (documentList.length === 0) return <RetroEmpty />;

  return (
    <ul className="flex gap-4 flex-wrap">
      {documentList.map((document) => {
        return (
          <Link to={`/document/${document.id}`} key={document.id}>
            <li
              key={document.id}
              className="w-[216px] h-[150px] rounded-[10px] bg-white box-shadow-[0px_0px_1px_0px_#0000004D] px-4 py-3 flex flex-col justify-end"
            >
              <div className="flex flex-col">
                <div className="font-bold">{document.name}</div>
                <div className="inline-flex gap-1 items-center text-[10px] leading-[11.64px] text-gray-500">
                  2 days ago <span className="text-black opacity-10">|</span>
                  <DueDate className="text-[#FF8401]" />9 hrs
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
