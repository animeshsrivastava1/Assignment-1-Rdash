import { ListItem } from "@/types/nested-list";

export const sampleNestedList: ListItem[] = [
  {
    id: "1",
    label: "A",
    children: [
      { id: "1-1", label: "A1" },
      { id: "1-2", label: "A2" },
      { id: "1-3", label: "A3" },
    ],
  },
  {
    id: "2",
    label: "B",
    children: [
      { id: "2-1", label: "B1" },
      { id: "2-2", label: "B2" },
    ],
  },
  {
    id: "3",
    label: "C",
    children: [{ id: "3-1", label: "C1" }],
  },
];
