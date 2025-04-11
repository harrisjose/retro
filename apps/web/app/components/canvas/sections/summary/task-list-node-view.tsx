import { type NodeViewComponentProps } from "@retro/pm";

export function TaskListNodeView({ children }: NodeViewComponentProps) {
  return <ul className="flex flex-col gap-2 w-full mt-2 mb-4">{children}</ul>;
}
