import { useState } from "react";
import { NestedList } from "@/components/NestedList";
import { ListItem } from "@/types/nested-list";
import { sampleNestedList } from "@/data/sample-data";

const Index = () => {
  const [items, setItems] = useState<ListItem[]>(sampleNestedList);

  const handleItemsChange = (newItems: ListItem[]) => {
    setItems(newItems);
  };

  return <NestedList items={items} onItemsChange={handleItemsChange} />;
};

export default Index;
