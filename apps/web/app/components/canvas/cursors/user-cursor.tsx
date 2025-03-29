import { CollaboratorCursor } from "@/components/ui/collaborator-cursor";
import { useAwarenessActions, useCollaborators, usePointers } from "@retro/sdk";
import { throttle } from "lodash-es";
import { useEffect, useMemo } from "react";
import { screenToCanvas, useCamera } from "../store";

const UserCursorPointer = ({
  id,
  x,
  y,
  color,
}: {
  id: string;
  x: number;
  y: number;
  color: {
    background: string;
    text: string;
  };
}) => {
  const collaborators = useCollaborators();

  const user = useMemo(() => {
    return collaborators.find((c) => c.id === id);
  }, [collaborators, id]);

  return (
    <CollaboratorCursor
      key={id}
      x={x}
      y={y}
      color={color}
      userName={user?.name ?? ""}
    />
  );
};

export const UserCursor = () => {
  const { updatePointersAwareness } = useAwarenessActions();
  const { camera } = useCamera();
  const pointers = usePointers();

  useEffect(() => {
    const updatePosition = throttle((e: MouseEvent) => {
      const point = screenToCanvas({ x: e.clientX, y: e.clientY }, camera);
      updatePointersAwareness({ x: point.x, y: point.y });
    }, 100);

    const controller = new AbortController();

    document.addEventListener("mousemove", updatePosition, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [updatePointersAwareness]);

  return pointers.map((p) => (
    <UserCursorPointer key={p.id} id={p.id} x={p.x} y={p.y} color={p.color} />
  ));
};
