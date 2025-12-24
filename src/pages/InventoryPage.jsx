import {
  Alert,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";
// custom components
import AddItemForm from "../components/AddItemForm";
import DashboardHeader from "../components/DashboardHeader";
import ItemsList from "../components/ItemsList";
import SearchBar from "../components/SearchBar";

// custom hooks
import useCurrentEmployee from "../hooks/useCurrentEmployee";
import useInventory from "../hooks/useInventory";

//services

export default function InventoryPage() {
  //++++++++++ state variables ++++++++++
  const [searchTerm, setSearchTerm] = useState("");

  // ++++++++++ references
  const addItemRef = useRef(null);
  const nameFieldRef = useRef(null);

  // employee/org context
  const { orgId, orgName, isManager, authError, authLoading } =
    useCurrentEmployee();

  // inventory data for this org
  const {
    items,
    loading: inventoryLoading,
    saving,
    error: inventoryError,
    addItem,
    updateItem,
    deleteItem,
  } = useInventory(orgId, isManager, orgName);

  // combine auth + inventory states for display
  const loading = authLoading || inventoryLoading;
  const error = authError || inventoryError;

  // scroll to the Add Item form and focus the first field
  const scrollToAddItem = () => {
    addItemRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      nameFieldRef.current?.focus();
    }, 400);
  };

  //how we show search items
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const hasItems = filteredItems.length > 0;

  return (
    <>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        {/* our header with the buttons */}
        <DashboardHeader onScrollToBottom={scrollToAddItem} />
        {/*  correct title depending on search or not */}
        {searchTerm === "" ? (
          <Typography variant="h4" gutterBottom>
            {orgName ? `${orgName} Inventory` : "Current Invnetory"}
          </Typography>
        ) : (
          <Typography variant="h4" gutterBottom>
            Search results:
          </Typography>
        )}

        {/* our custom search bar */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* items list */}
          <Paper sx={{ mb: 3, p: 2, minHeight: 120 }}>
            {loading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography color="text.secondary">Loading…</Typography>
              </Stack>
            ) : hasItems ? (
              <>
                <ItemsList
                  items={filteredItems}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                  isManager={isManager}
                />

                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Total items: {items.length}
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">No items yet.</Typography>
            )}
          </Paper>
        </Stack>

        {/* custom add items form */}
        <div ref={addItemRef}>
          <AddItemForm onAdd={addItem} nameRef={nameFieldRef} saving={saving} />
        </div>
      </Container>
    </>
  );
}
