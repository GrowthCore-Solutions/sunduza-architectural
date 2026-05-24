"use client";

import * as React from "react";
import { Inbox, Mail, MessageSquare } from "lucide-react";
import {
  useAdminMessages,
  useMarkMessageRead,
} from "@/frontend/hooks/admin/useAdminMessages";

function formatRelative(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatFull(date: Date | string): string {
  return new Date(date).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminMessagesPage() {
  const [tab, setTab] = React.useState<"unread" | "all">("unread");
  const { data: messages, isLoading } = useAdminMessages(tab === "unread");
  const markRead = useMarkMessageRead();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Effective selection falls back to the first message when nothing has been
  // explicitly picked — derived in render, no effect-driven state churn.
  const effectiveSelectedId = selectedId ?? messages?.[0]?.id ?? null;
  const selected = messages?.find((m) => m.id === effectiveSelectedId);
  const unreadCount = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-page-head-eyebrow">Inbox</p>
          <h1 className="admin-page-head-title">
            Contact<br />
            <em>messages.</em>
          </h1>
          <p className="admin-page-head-sub">
            Notes from the contact form. Click any message to open it &mdash;
            unread ones are marked as read automatically.
          </p>
        </div>
      </header>

      <div className="admin-filter-bar">
        <div className="admin-tabs">
          <button
            type="button"
            className="admin-tab"
            data-active={tab === "unread"}
            onClick={() => setTab("unread")}
          >
            Unread
            {tab === "unread" && unreadCount > 0 && (
              <span className="admin-tab-count">{unreadCount}</span>
            )}
          </button>
          <button
            type="button"
            className="admin-tab"
            data-active={tab === "all"}
            onClick={() => setTab("all")}
          >
            All messages
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="admin-list-empty">
          <span className="admin-list-empty-icon">
            <MessageSquare size={18} strokeWidth={1.75} />
          </span>
          <p>Loading messages…</p>
        </div>
      )}

      {!isLoading && (!messages || messages.length === 0) && (
        <div
          className="admin-list-empty"
          style={{
            background: "#fff",
            border: "1px dashed var(--color-rule)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="admin-list-empty-icon">
            <Inbox size={18} strokeWidth={1.75} />
          </span>
          <p>
            {tab === "unread"
              ? "Inbox zero. Nicely done."
              : "No messages yet."}
          </p>
        </div>
      )}

      {!isLoading && messages && messages.length > 0 && (
        <div className="admin-inbox">
          <div className="admin-inbox-list scroll-fade-y" role="listbox">
            {messages.map((m) => (
              <button
                key={m.id}
                type="button"
                className="admin-inbox-row"
                data-active={effectiveSelectedId === m.id}
                data-unread={!m.read}
                onClick={() => {
                  setSelectedId(m.id);
                  if (!m.read) markRead.mutate(m.id);
                }}
                role="option"
                aria-selected={effectiveSelectedId === m.id}
              >
                <div className="admin-inbox-row-head">
                  <span className="admin-inbox-row-name">
                    {!m.read && (
                      <span
                        className="admin-inbox-row-unread-dot"
                        aria-hidden="true"
                      />
                    )}
                    {m.name}
                  </span>
                  <span className="admin-inbox-row-date">
                    {formatRelative(m.createdAt)}
                  </span>
                </div>
                <p className="admin-inbox-row-preview">{m.message}</p>
              </button>
            ))}
          </div>

          {selected ? (
            <article className="admin-inbox-detail">
              <header className="admin-inbox-detail-head">
                <div>
                  <h2 className="admin-inbox-detail-title">{selected.name}</h2>
                  <p className="admin-inbox-detail-contact">
                    <Mail
                      size={11}
                      style={{
                        display: "inline",
                        verticalAlign: "-1px",
                        marginRight: "0.35rem",
                      }}
                      aria-hidden="true"
                    />
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                    {" · "}
                    {formatFull(selected.createdAt)}
                  </p>
                </div>
                <a
                  href={`mailto:${selected.email}?subject=Re: your enquiry`}
                  className="admin-card-link"
                >
                  Reply by email
                </a>
              </header>
              <div className="admin-inbox-detail-body">{selected.message}</div>
            </article>
          ) : (
            <div className="admin-inbox-empty">
              <span className="admin-list-empty-icon">
                <MessageSquare size={18} strokeWidth={1.75} />
              </span>
              <p>Select a message to read it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
