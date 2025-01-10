import BoardSvg from "@/components/svg/board-view";
import List from "@/components/svg/list";
import Search from "@/components/svg/search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DocumentListFilter } from "@retro/common";

type FilterPanelProps = {
  filters: {
    label: string;
    value: string;
  }[];
  activeFilter: DocumentListFilter;
  onFilterChange: (filter: DocumentListFilter) => void;
};

const FilterPanel = ({
  filters,
  children,
  activeFilter,
  onFilterChange,
}: React.PropsWithChildren<FilterPanelProps>) => {
  return (
    <div className="w-full flex-1 overflow-hidden flex gap-4 justify-center">
      <Tabs
        defaultValue="account"
        className="w-[680px] relative"
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as DocumentListFilter)}
      >
        <div className="flex border-b border-black border-opacity-5">
          {filters.map((filter) => {
            return (
              <TabsList className="h-full items-start mr-6" key={filter.value}>
                <TabsTrigger
                  className="border-b data-[state=active]:border-black border-transparent font-bold pb-[10px] rounded-none"
                  value={filter.value}
                >
                  {filter.label}
                </TabsTrigger>
              </TabsList>
            );
          })}
        </div>

        <TabsContent
          className="h-full overflow-y-auto pb-[120px] mt-4 no-scrollbar"
          value={activeFilter}
        >
          {children}
        </TabsContent>
        <div className="absolute top-0 right-0 flex gap-3 items-end">
          <Search className="cursor-pointer" />
          <List className="cursor-pointer" />
          <BoardSvg className="cursor-pointer" />
        </div>
      </Tabs>
    </div>
  );
};

export default FilterPanel;
