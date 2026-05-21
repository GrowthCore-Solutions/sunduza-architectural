"use client";

import * as React from "react";
import { useAdminMessages, useMarkMessageRead } from "@/src/client/hooks/admin/useAdminMessages";
import { cn } from "@/lib/utils";

export function AdminMessagesPage() {
  const [tab, setTab] = React.useState<"all" | "unread">("unread");
  const { data: messages, isLoading } = useAdminMessages(tab === "unread");
  const markRead = useMarkMessageRead();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = messages?.find((m) => m.id === selectedId);

  return (
    <div>
      <h1 className="font-serif text-2xl font-black mb-6">Messages</h1>
      <div className="flex gap-2 mb-6">
        {(["unread", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-sm capitalize",
              tab === t
                ? "bg-[--color-primary] text-white"
                : "border border-[--color-rule] text-[--color-muted]"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {isLoading && <p className="text-[--color-muted]">Loading…</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-sm border border-[--color-rule] bg-white divide-y">
          {messages?.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "w-full text-left p-4 text-sm hover:bg-[--color-paper2]",
                selectedId === m.id && "bg-[--color-paper2]",
                !m.read && "font-medium"
              )}
              onClick={() => {
                setSelectedId(m.id);
                if (!m.read) markRead.mutate(m.id);
              }}
            >
              <p>{m.name}</p>
              <p className="text-[--color-muted] truncate">{m.message}</p>
            </button>
          ))}
          {!messages?.length && (
            <p className="p-6 text-[--color-muted] text-sm">No messages.</p>
          )}
        </div>
        {selected && (
          <div className="rounded-sm border border-[--color-rule] bg-white p-6">
            <h2 className="font-serif text-lg font-bold">{selected.name}</h2>
            <a
              href={`mailto:${selected.email}`}
              className="text-sm text-[--color-primary] hover:underline"
            >
              {selected.email}
            </a>
            <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
              {selected.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
