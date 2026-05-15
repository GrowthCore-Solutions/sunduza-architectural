"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export function useAdminMessages(all = false) {
  return useQuery({
    queryKey: ["admin", "messages", all],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/messages${all ? "?all=true" : ""}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error("Failed to load messages");
      return json.data as { messages: AdminMessage[]; total: number };
    },
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/admin/messages/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error("Mark read failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "messages"] }),
  });
}
