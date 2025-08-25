export interface ListItem {
  id: string;
  label: string;
  children?: ListItem[];
}

export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string | null;
  } | null;
}

export interface NestedListProps {
  items: ListItem[];
  onItemsChange: (items: ListItem[]) => void;
}