// hooks/useUsers.ts
import { useState, useEffect } from "react";

export function useUsers(userRole: string | undefined) {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (userRole !== "admin") return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTotalUsers(data.users.length);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userRole]);

  return { totalUsers, loading };
}