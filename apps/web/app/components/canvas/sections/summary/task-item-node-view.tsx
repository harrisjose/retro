import { type NodeViewComponentProps } from "@retro/pm";
import * as random from "lib0/random";

export function TaskItemNodeView({
  node,
  getPos,
  editor,
  children,
}: NodeViewComponentProps) {
  // Ensure task has an ID
  if (!node.attrs.id) {
    const { tr } = editor.view.state;
    tr.setNodeMarkup(getPos(), undefined, {
      ...node.attrs,
      id: random.uuidv4(),
    });
    editor.view.dispatch(tr);
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();

    const { tr } = editor.view.state;
    tr.setNodeMarkup(getPos(), undefined, {
      ...node.attrs,
      completed: !node.attrs.completed,
    });
    editor.view.dispatch(tr);
  };

  return (
    <li className="flex items-start text-sm">
      <label className="flex items-start cursor-pointer relative w-full">
        <input
          type="checkbox"
          checked={node.attrs.completed}
          onClick={handleToggle}
          className="absolute opacity-0 w-0 h-0 cursor-pointer"
        />
        <span
          className={`flex items-center justify-center w-5 h-5 rounded mr-3 border-2 mt-0.5 bg-checkbox`}
        >
          {node.attrs.completed && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black"
            >
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span
          className={`
            whitespace-pre-wrap break-words pr-2 w-full
            ${node.attrs.completed ? "line-through decoration-checkbox" : ""}
          `}
        >
          {children}
        </span>
      </label>
    </li>
  );
}
