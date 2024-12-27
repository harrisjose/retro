import { Button } from "@/components/ui/button";
import { useAwareness } from "@/lib/sdk/awarness";
import { useYDoc } from "@/lib/sdk/document";
import { cn } from "@/lib/utils";
import { LucideTrash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { TypedArray } from "yjs-types";

const colors = [
  "#D1B6FF",
  "#F5BBBB",
  "#FFE49E",
  "#8DCAFF",
  "#C5E4BC",
  "#FFB082",
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

type Card = {
  id: string;
  color: string;
};

type YCardsList = TypedArray<Card>;

export default function DocumentPage() {
  const [cards, setCards] = useState<Card[]>([]);

  const doc = useYDoc();
  const YCardsList = doc.getArray("cards") as YCardsList;

  useEffect(() => {
    YCardsList.observe((event) => {
      setCards(event.target.toArray());
    });
    return () => {};
  }, []);

  const addCard = () => {
    YCardsList.push([{ id: crypto.randomUUID(), color: getRandomColor() }]);
  };
  const removeCard = (id: string) => {
    const index = cards.findIndex((card) => card.id === id);
    if (index !== -1) {
      YCardsList.delete(index);
    }
  };

  const { awarenessList } = useAwareness();
  console.log("awarenessList", awarenessList);

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC] flex flex-col">
      <div className="max-w-screen-sm w-full min-h-[500px] mx-auto flex gap-4 py-10">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "w-[216px] h-[150px] bg-white rounded-lg p-4 flex justify-center items-center"
            )}
            style={{ backgroundColor: card.color }}
          >
            <Button variant="link" onClick={() => removeCard(card.id)}>
              <LucideTrash2 />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-auto mb-10">
        <Button onClick={addCard}>Add sticky</Button>
      </div>
    </div>
  );
}
