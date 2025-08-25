import React from 'react';
import { ListItem } from '@/types/nested-list';
import { GripVertical, ChevronRight } from 'lucide-react';

interface DraggedItemProps {
  item: ListItem;
}

export function DraggedItem({ item }: DraggedItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-primary shadow-glow opacity-90 backdrop-blur-sm">
      {/* Expand/Collapse Placeholder */}
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {hasChildren && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>

      {/* Drag Handle */}
      <div className="flex-shrink-0 p-1">
        <GripVertical className="w-4 h-4 text-primary" />
      </div>

      {/* Item Content */}
      <div className="flex-1 text-foreground font-medium">
        {item.label}
      </div>

      {/* Item Count Badge */}
      {hasChildren && (
        <div className="flex-shrink-0 px-2 py-1 text-xs bg-primary-light text-primary rounded-full">
          {item.children?.length}
        </div>
      )}
    </div>
  );
}