interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
}

export const TaskList = ({ tasks = [], onTaskToggle }: TaskListProps) => {
  const handleToggle = (taskId: string, e: React.MouseEvent) => {
    // Prevent normal checkbox behavior to let ProseMirror handle the state
    e.preventDefault();
    onTaskToggle?.(taskId);
  };

  return (
    <div className="flex flex-col gap-2 w-full mt-2 mb-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start text-sm">
          <label className="flex items-start cursor-pointer relative w-full">
            <input
              type="checkbox"
              checked={task.completed}
              // Use onClick instead of onChange to work better with ProseMirror
              onClick={(e) => handleToggle(task.id, e)}
              className="absolute opacity-0 w-0 h-0 cursor-pointer"
            />
            <span
              className={`flex items-center justify-center w-5 h-5 rounded mr-3 border-2 mt-0.5 bg-checkbox`}
            >
              {task.completed && (
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
                  ${task.completed ? "line-through decoration-checkbox" : ""}
                `}
            >
              {task.text}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};
