// src/pages/Login.jsx
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);

      // 1) Sign in with Supabase Auth
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

      if (signInError) {
        // Common message from Supabase is "Invalid login credentials"
        throw signInError;
      }

      const user = signInData.user;
      if (!user) {
        throw new Error("Login succeeded, but no user was returned.");
      }

      // 2) Optionally load employee profile for RBAC / org scoping
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("first_name, last_name, role, organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (employeeError && employeeError.code !== "PGRST116") {
        // PGRST116 = no rows found for maybeSingle
        throw employeeError;
      }

      // 3) Store a lightweight "current employee" snapshot for later use
      if (employee) {
        const currentEmployee = {
          id: user.id,
          email: user.email,
          firstName: employee.first_name,
          lastName: employee.last_name,
          role: employee.role,
          organizationId: employee.organization_id,
        };
        localStorage.setItem(
          "currentEmployee",
          JSON.stringify(currentEmployee)
        );
      } else {
        // If there is no employee row, we still let them in for now,
        // but it might be something to handle later.
        console.warn(
          "Logged in user has no matching employees row. Check signup flow."
        );
      }

      // 4) Navigate to the main inventory dashboard
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      // Show a friendly message if possible
      if (
        err?.message &&
        err.message.toLowerCase().includes("invalid login credentials")
      ) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Something went wrong while logging in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </Typography>
    </Container>
  );
}
