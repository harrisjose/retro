import { type NodeViewComponentProps } from "@retro/pm";
import { useEffect, useState } from "react";
import { TaskList } from "./task-list";

// React component that renders inside the NodeView
export function TaskListNodeView({
  node,
  getPos,
  editor,
}: NodeViewComponentProps & { getPos: () => number; editor: any }) {
  // Get tasks from node attributes
  const [tasks, setTasks] = useState(node.attrs.tasks || []);

  // Update local state when node changes
  useEffect(() => {
    setTasks(node.attrs.tasks || []);
  }, [node.attrs.tasks]);

  // Handler for task toggling
  const handleTaskToggle = (taskId: string) => {
    // Create updated tasks array
    const newTasks = tasks.map((task: { id: string; completed: boolean }) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );

    // Create a transaction to update the node
    const { view } = editor;
    const { tr } = view.state;

    tr.setNodeMarkup(getPos(), undefined, {
      ...node.attrs,
      tasks: newTasks,
    });

    view.dispatch(tr);
  };

  return (
    <div className="task-list-node-view">
      <TaskList tasks={tasks} onTaskToggle={handleTaskToggle} />
    </div>
  );
}
