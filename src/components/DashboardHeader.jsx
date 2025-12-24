// components/DashboardHeader.jsx
import { Button, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function DashboardHeader({ onScrollToBottom }) {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("currentEmployee");
    setLoggedIn(!!raw);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("currentEmployee");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      {/* Left: Add item only if logged in */}
      {loggedIn ? (
        <Button
          variant="text"
          onClick={onScrollToBottom}
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 500,
            color: "primary.main",
            padding: 0,
            minWidth: "unset",
          }}
        >
          Add item
        </Button>
      ) : (
        <div /> // keeps spacing consistent
      )}

      {/* Right: Login OR Logout */}
      {loggedIn ? (
        <Button
          variant="outlined"
          size="small"
          onClick={handleLogout}
          sx={{
            textTransform: "none",
            fontSize: "0.9rem",
            px: 1.5,
          }}
        >
          Logout
        </Button>
      ) : (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/login")}
          sx={{
            textTransform: "none",
            fontSize: "0.9rem",
            px: 1.5,
          }}
        >
          Login
        </Button>
      )}
    </Stack>
  );
}
