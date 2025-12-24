import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";

export default function AddItemForm({ onAdd, nameRef }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !quantity.trim()) return;
    onAdd({ name: itemName, quantity });
    setItemName("");
    setQuantity("");

    // re-focus after submission
    nameRef?.current?.focus();
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            inputRef={nameRef} // ⭐ use the parent ref here
          />
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained">
            Add Item
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
