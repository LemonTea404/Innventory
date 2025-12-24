// TODO: Consider refactoring this hook to read from Supabase Auth + employees
// instead of localStorage, so role/org updates propagate without a re-login.
import { useEffect, useState } from "react";
import { getOrgNameById } from "../services/organizations";

/**
 * Reads "currentEmployee" from localStorage and exposes:
 * - orgId (string | number)
 * - orgName (string | "")
 * - isManager (boolean)
 * - authError (string | null)
 * - authLoading (boolean)
 */
export default function useCurrentEmployee() {
  const [orgId, setOrgId] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);

        const raw = localStorage.getItem("currentEmployee");

        if (!raw) {
          if (alive) {
            setAuthError("No logged-in employee found. Please log in again.");
          }
          return;
        }

        const emp = JSON.parse(raw);

        //debugging :)
        // console.log("currentEmployee from localStorage:", emp);
        // console.log("organizationId from snapshot:", emp.organizationId);

        if (!emp.organizationId) {
          if (alive) {
            setAuthError("Your account is not linked to an organization.");
          }
          return;
        }

        if (!alive) return;

        setOrgId(emp.organizationId);
        setIsManager(emp.role === "Manager");

        //fetch org name from Supabase via service
        const name = await getOrgNameById(emp.organizationId);
        // console.log("getOrgNameById returned:", name);
        if (alive && name) {
          setOrgName(name);
        }
      } catch (e) {
        console.error(e);
        if (alive) {
          setAuthError("Failed to read employee info. Please log in again.");
        }
      } finally {
        if (alive) {
          setAuthLoading(false);
        }
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  return { orgId, orgName, isManager, authError, authLoading };
}
