"use client";

import * as React from "react";
import { useAdminMessages, useMarkMessageRead } from "@/frontend/hooks/admin/useAdminMessages";
import { cn } from "@/frontend/lib/utils";

export function AdminMessagesPage() {
  const [tab, setTab] = React.useState<"all" | "unread">("unread");
  const { data: messages, isLoading } = useAdminMessages(tab === "unread");
  const markRead = useMarkMessageRead();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = messages?.find((m) => m.id === selectedId);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Inbox
        </p>
        <h1 className="mt-2 font-serif text-3xl font-black tracking-tight text-ink">
          Messages
        </h1>
      </div>
      <div className="mb-6 inline-flex gap-1 rounded-md border border-rule bg-white/90 p-1 shadow-sm shadow-ink/5">
        {(["unread", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-9 rounded-sm px-4 text-sm font-semibold capitalize transition-colors",
              tab === t
                ? "bg-primary text-white"
                : "text-muted hover:bg-paper2 hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {isLoading && <p className="text-muted">Loading...</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="divide-y divide-rule/70 rounded-md border border-rule/75 bg-white shadow-soft">
          {messages?.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "w-full p-4 text-left text-sm transition-colors hover:bg-paper2",
                selectedId === m.id && "bg-paper2",
                !m.read && "font-medium"
              )}
              onClick={() => {
                setSelectedId(m.id);
                if (!m.read) markRead.mutate(m.id);
              }}
            >
              <p>{m.name}</p>
              <p className="text-muted truncate">{m.message}</p>
            </button>
          ))}
          {!messages?.length && (
            <p className="p-6 text-muted text-sm">No messages.</p>
          )}
        </div>
        {selected && (
          <div className="rounded-md border border-rule/75 bg-white p-6 shadow-soft">
            <h2 className="font-serif text-lg font-bold">{selected.name}</h2>
            <a
              href={`mailto:${selected.email}`}
              className="text-sm text-primary hover:underline"
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
