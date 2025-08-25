import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ListItem } from "@/types/nested-list";
import { SortableListItem } from "./SortableListItem";
import { DraggedItem } from "./DraggedItem";
import { MessageSquare } from "lucide-react";

interface NestedListProps {
  items: ListItem[];
  onItemsChange: (items: ListItem[]) => void;
}

export function NestedList({ items, onItemsChange }: NestedListProps) {
  const [activeItem, setActiveItem] = useState<ListItem | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findItemById = (items: ListItem[], id: string): ListItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeItemById = (items: ListItem[], id: string): ListItem[] => {
    return items
      .filter((item) => item.id !== id)
      .map((item) => ({
        ...item,
        children: item.children ? removeItemById(item.children, id) : undefined,
      }));
  };

  const addItemToParent = (
    items: ListItem[],
    parentId: string,
    newItem: ListItem
  ): ListItem[] => {
    return items.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem],
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItemToParent(item.children, parentId, newItem),
        };
      }
      return item;
    });
  };

  const insertItemAtIndex = (
    items: ListItem[],
    index: number,
    newItem: ListItem
  ): ListItem[] => {
    const newItems = [...items];
    newItems.splice(index, 0, newItem);
    return newItems;
  };

  const findItemParent = (
    items: ListItem[],
    childId: string,
    parentId?: string
  ): string | null => {
    for (const item of items) {
      if (item.id === childId) {
        return parentId || null;
      }

      if (item.children) {
        const found = findItemParent(item.children, childId, item.id);
        if (found) return found;
      }
    }
    return null;
  };

  const isDescendant = (
    parentId: string,
    childId: string,
    items: ListItem[]
  ): boolean => {
    const parent = findItemById(items, parentId);
    if (!parent || !parent.children) return false;

    return parent.children.some(
      (child) => child.id === childId || isDescendant(child.id, childId, items)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = findItemById(items, event.active.id as string);
    setActiveItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !activeItem) {
      setActiveItem(null);
      setDraggedOverItem(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      setActiveItem(null);
      setDraggedOverItem(null);
      return;
    }

    // Prevent dropping into descendant
    if (isDescendant(activeId, overId, items)) {
      setActiveItem(null);
      setDraggedOverItem(null);
      return;
    }

    // Remove the item from its current location
    let newItems = removeItemById(items, activeId);

    // Handle dropping on a container (making it a child)
    if (overId.endsWith("-container")) {
      const parentId = overId.replace("-container", "");
      newItems = addItemToParent(newItems, parentId, activeItem);
    } else {
      // Handle dropping between items (reordering)
      const overItem = findItemById(newItems, overId);
      if (overItem) {
        // Find the parent of the over item
        const overParentId = findItemParent(newItems, overId);

        if (overParentId) {
          // Insert into parent's children
          const parent = findItemById(newItems, overParentId);
          if (parent && parent.children) {
            const overIndex = parent.children.findIndex(
              (child) => child.id === overId
            );
            // Insert after the over item
            parent.children.splice(overIndex + 1, 0, activeItem);
          }
        } else {
          // Insert at root level
          const overIndex = newItems.findIndex((item) => item.id === overId);
          // Insert after the over item
          newItems.splice(overIndex + 1, 0, activeItem);
        }
      }
    }

    onItemsChange(newItems);
    setActiveItem(null);
    setDraggedOverItem(null);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setDraggedOverItem(over?.id || null);
  };

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="border border-border rounded-lg overflow-hidden bg-background">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-24">
                  WBS
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Activity Name
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-20">
                  <MessageSquare className="w-4 h-4 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="group">
              {items.map((item, index) => (
                <SortableListItem
                  key={item.id}
                  item={item}
                  level={0}
                  draggedOverItem={draggedOverItem}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        <DragOverlay>
          {activeItem && <DraggedItem item={activeItem} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
