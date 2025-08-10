// hooks/useAssignments.ts
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
  matricNumber: string;
  date: string;
}

export function useAssignments(filters: Filters, page: number, userRole: string | undefined) {
  const [uploads, setUploads] = useState<ISubmission[]>([]);
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(filters.matricNumber && { matricNumber: filters.matricNumber }),
          ...(filters.date && { date: filters.date }),
        });
        const res = await fetch(`/api/assignments?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUploads(data.assignments);
        setTotalPages(data.pages);
        setTotalUploads(data.total);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [page, filters, userRole]);

  return { uploads, totalUploads, totalPages, loading };
}