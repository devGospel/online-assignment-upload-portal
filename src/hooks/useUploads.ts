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
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(filters.studentName && { studentName: filters.studentName }),
          ...(filters.matricNumber && { matricNumber: filters.matricNumber }),
          ...(filters.date && { date: filters.date }),
        });
        const res = await fetch(`/api/assignments?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch uploads: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setUploads(data.assignments);
        setTotalPages(data.pages);
      } catch (error) {
        console.error("Error fetching uploads:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch uploads");
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, [page, filters]);

  return { uploads, totalPages, loading, error };
}