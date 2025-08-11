import { useState, useEffect } from "react";

interface ISubmission {
  student_name: string;
  id: number;
  matric_number: string;
  level: string;
  course_code: string;
  file_url: string;
  uploaded_at: string;
}

interface Filters {
  studentName?: string;
  matricNumber?: string;
  date?: string;
}

interface UseAssignmentsResult {
  uploads: ISubmission[];
  totalUploads: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
}

export function useAssignments(
  filters: Filters, 
  page: number, 
  userRole: string | undefined
): UseAssignmentsResult {
  const [state, setState] = useState<UseAssignmentsResult>({
    uploads: [],
    totalUploads: 0,
    totalPages: 1,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(filters.matricNumber && { matricNumber: filters.matricNumber }),
          ...(filters.date && { date: filters.date }),
          ...(userRole === "admin" && filters.studentName && { studentName: filters.studentName })
        });

        const res = await fetch(`/api/assignments?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setState({
          uploads: data.assignments || [],
          totalUploads: data.total || 0,
          totalPages: data.pages || 1,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          uploads: [],
          totalUploads: 0,
          totalPages: 1,
          loading: false,
          error: error instanceof Error ? error : new Error("An unknown error occurred")
        });
      }
    };

    fetchAssignments();
  }, [page, filters, userRole]);

  return state;
}