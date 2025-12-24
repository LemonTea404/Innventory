import { List } from "@mui/material";
import ItemRow from "./ItemRow";

export default function ItemsList({ items, onUpdate, onDelete, isManager }) {
  return (
    <List>
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isManager={isManager} // 👈 pass through
        />
      ))}
    </List>
  );
}
