// src/components/SearchBar.jsx
import { TextField } from "@mui/material";

export default function SearchBar({ value, onChange }) {
  return (
    <TextField
      fullWidth
      size="small"
      label="Search items"
      placeholder="Type a name…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
