import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  IconButton,
  ListItem,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

export default function ItemRow({ item, onUpdate, onDelete, isManager }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);
  const [draftQty, setDraftQty] = useState(item.quantity);
  const [draftLowThreshold, setDraftLowThreshold] = useState(
    item.lowThreshold ?? 0
  );

  const handleSave = () => {
    const name = draftName.trim();
    const quantity = Number(draftQty);
    if (!name || Number.isNaN(quantity)) return;

    const patch = { name, quantity };

    if (isManager) {
      const lowThresholdNum = Number(draftLowThreshold);
      if (Number.isNaN(lowThresholdNum) || lowThresholdNum < 0) {
        // simple guard; you could show a toast instead
        return;
      }
      patch.lowThreshold = lowThresholdNum;
    }

    onUpdate(item.id, patch);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraftName(item.name);
    setDraftQty(item.quantity);
    setDraftLowThreshold(item.lowThreshold ?? 0);
  };

  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={
        isEditing ? null : (
          <>
            <IconButton
              aria-label="edit"
              edge="end"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              edge="end"
              onClick={() => onDelete(item.id)}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )
      }
    >
      {isEditing ? (
        <Stack spacing={2} sx={{ width: "100%", pr: 1, py: 1 }}>
          <TextField
            label="Name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Quantity"
            type="number"
            value={draftQty}
            onChange={(e) => setDraftQty(e.target.value)}
            size="small"
            fullWidth
          />
          {isManager && (
            <TextField
              label="Low threshold"
              type="number"
              value={draftLowThreshold}
              onChange={(e) => setDraftLowThreshold(e.target.value)}
              size="small"
              fullWidth
            />
          )}

          <Stack direction="row" spacing={1}>
            <Button variant="contained" fullWidth onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" fullWidth onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <ListItemText
          primary={item.name}
          secondary={`Quantity: ${item.quantity}`}
          primaryTypographyProps={{ fontWeight: "bold" }}
        />
      )}
    </ListItem>
  );
}
