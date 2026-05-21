"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ContactMessageRow } from "@/types/db";
import type { ApiSuccess } from "@/src/client/lib/api-types";

export function useAdminMessages(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ["admin", "messages", { unreadOnly }],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<ContactMessageRow[]>>("/api/admin/messages", {
        params: unreadOnly ? { unread: "true" } : undefined,
      });
      return res.data;
    },
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiSuccess<ContactMessageRow>>("/api/admin/messages", { id, read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });
    },
  });
}
