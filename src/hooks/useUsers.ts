// hooks/useUsers.ts
import { useState, useEffect } from "react";

interface UseUsersResult {
  totalUsers: number;
  loading: boolean;
  error: Error | null;
}

export function useUsers(userRole: string | undefined): UseUsersResult {
  const [state, setState] = useState<UseUsersResult>({
    totalUsers: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (userRole !== "admin") {
        setState({ totalUsers: 0, loading: false, error: null });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setState({
          totalUsers: data.users?.length || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          totalUsers: 0,
          loading: false,
          error: error instanceof Error ? error : new Error("An unknown error occurred")
        });
      }
    };

    fetchUsers();
  }, [userRole]);

  return state;
}