import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ListItem } from "@/types/nested-list";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListItemProps {
  item: ListItem;
  level: number;
  draggedOverItem: string | null;
  wbsNumber?: string;
  parentWbs?: string;
  index?: number;
}

export function SortableListItem({
  item,
  level,
  draggedOverItem,
  wbsNumber = "1",
  parentWbs = "",
  index = 0,
}: SortableListItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = item.children && item.children.length > 0;
  const isDropZone = draggedOverItem === `${item.id}-container`;

  // Generate WBS number
  const currentWbs = parentWbs ? `${parentWbs}.${index + 1}` : `${index + 1}`;

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "border-b border-border bg-background hover:bg-muted/30 transition-colors cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50 z-50",
          isDropZone &&
            draggedOverItem?.endsWith("-container") &&
            "bg-primary/10"
        )}
      >
        {isDropZone && !draggedOverItem?.endsWith("-container") && (
          <tr>
            <td colSpan={3} className="px-4 py-1">
              <div className="h-1 bg-primary rounded-full"></div>
            </td>
          </tr>
        )}
        {/* WBS Column */}
        <td className="px-4 py-3 text-sm text-muted-foreground w-24">
          {currentWbs}
        </td>

        {/* Activity Name Column */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={cn(
                "flex-shrink-0 w-4 h-4 rounded hover:bg-muted transition-colors p-0.5",
                !hasChildren && "invisible"
              )}
            >
              {hasChildren &&
                (isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                ))}
            </button>

            {/* Item Label */}
            <span className="text-sm text-foreground font-medium">
              {item.label}
            </span>
          </div>
        </td>

        {/* Actions Column */}
        <td className="px-4 py-3 w-20">
          <div className="flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </div>
        </td>
      </tr>

      {/* Drop Zone Row for Children */}
      {hasChildren && isExpanded && isDropZone && (
        <tr>
          <td colSpan={3} className="px-4 py-2">
            <div
              id={`${item.id}-container`}
              className="min-h-[40px] border-2 border-dashed border-primary bg-primary/5 rounded-md flex items-center justify-center text-xs text-primary"
            >
              Drop here to make it a child item
            </div>
          </td>
        </tr>
      )}

      {/* Children Rows */}
      {hasChildren &&
        isExpanded &&
        item.children?.map((child, childIndex) => (
          <SortableListItem
            key={child.id}
            item={child}
            level={level + 1}
            draggedOverItem={draggedOverItem}
            parentWbs={currentWbs}
            index={childIndex}
          />
        ))}
    </>
  );
}
