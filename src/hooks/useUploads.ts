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
  studentName: string;
  matricNumber: string;
  date: string;
}

export function useUploads(filters: Filters, page: number) {
  const [uploads, setUploads] = useState<ISubmission[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Create URLSearchParams and properly handle all parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");
        
        // Always include all filters, even if empty
        params.append("studentName", filters.studentName);
        params.append("matricNumber", filters.matricNumber);
        params.append("date", filters.date);

        // Debug: Log the actual URL being requested
        console.log(`Fetching: /api/assignments?${params.toString()}`);

        const res = await fetch(`/api/assignments?${params.toString()}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch uploads: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        // Validate response structure
        if (!data || !Array.isArray(data.assignments)) {
          throw new Error("Invalid data format received from server");
        }

        setUploads(data.assignments);
        setTotalPages(data.pages || 1);
      } catch (error) {
        console.error("Error fetching uploads:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch uploads");
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, [page, filters.studentName, filters.matricNumber, filters.date]); // More granular dependencies

  return { uploads, totalPages, loading, error };
}