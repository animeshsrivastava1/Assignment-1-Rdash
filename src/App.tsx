import React, { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";

interface ListItem {
  id: string;
  label: string;
  children?: ListItem[];
  expanded?: boolean;
}

const initialData: ListItem[] = [
  {
    id: "1",
    label: "A",
    expanded: true,
    children: [
      { id: "1-1", label: "A1" },
      { id: "1-2", label: "A2" },
    ],
  },
  {
    id: "2",
    label: "B",
    expanded: true,
    children: [{ id: "2-1", label: "B1" }],
  },
  {
    id: "3",
    label: "C",
    expanded: false,
    children: [{ id: "3-1", label: "C1" }],
  },
];

function Row({
  item,
  wbs,
  isRoot,
  toggle,
}: {
  item: ListItem;
  wbs: string;
  isRoot?: boolean;
  toggle?: () => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = isRoot ? useSortable({ id: item.id }) : ({} as any);

  const style = transform
    ? { transform: CSS.Transform.toString(transform), transition }
    : {};
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b bg-white hover:bg-gray-50 ${
        isDragging ? "opacity-50" : ""
      } cursor-grab`} // 👈 always show drag cursor on row
    >
      <td className="px-4 py-2 text-sm text-gray-500">{wbs}</td>
      <td
        className="px-4 py-2 flex items-center gap-2 cursor-grab" // 👈 drag area
        {...listeners} // 👈 apply only here, not whole <tr>
        {...attributes}
      >
        {item.children ? (
          <button
            onPointerDown={(e) => e.stopPropagation()} // 👈 prevent drag
            onClick={(e) => {
              e.stopPropagation();
              toggle?.();
            }}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer" // 👈 override cursor
          >
            {item.expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{item.label}</span>
      </td>
      <td className="px-4 py-2 text-center">
        <MessageSquare className="w-4 h-4 text-gray-500" />
      </td>
    </tr>
  );
}

export default function App() {
  const [items, setItems] = useState(initialData);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = ({ active, over }: any) => {
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-6">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 w-20 text-left">WBS</th>
              <th className="px-4 py-2 text-left">Activity Name</th>
              <th className="px-4 py-2 w-12 text-center">💬</th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {items.map((root, i) => (
                  <React.Fragment key={root.id}>
                    <Row
                      item={root}
                      wbs={`${i + 1}`}
                      isRoot
                      toggle={() =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === root.id
                              ? { ...it, expanded: !it.expanded }
                              : it
                          )
                        )
                      }
                    />
                    {root.expanded &&
                      root.children?.map((c, j) => (
                        <Row key={c.id} item={c} wbs={`${i + 1}.${j + 1}`} />
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
