"use client";

import * as React from "react";
import { Mail, MailOpen, Phone } from "lucide-react";
import { Button } from "@/src/client/components/ui/button";
import { Skeleton } from "@/src/client/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminMessages, useMarkMessageRead } from "@/src/client/hooks/use-admin-messages";

export default function AdminMessagesPage() {
  const [showAll, setShowAll] = React.useState(false);
  const { data, isLoading } = useAdminMessages(showAll);
  const markRead = useMarkMessageRead();
  const messages = data?.messages ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[--color-ink]">Messages</h1>
          <p className="text-[--color-muted] mt-1">Contact form enquiries · {data?.total ?? 0} {showAll ? "total" : "unread"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Unread Only" : "Show All"}
        </Button>
      </div>

      {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        : messages.length === 0 ? (
          <div className="rounded-sm border border-[--color-rule] bg-[--color-paper2] p-16 text-center">
            <MailOpen className="h-12 w-12 mx-auto text-[--color-rule] mb-3" />
            <p className="text-[--color-muted]">{showAll ? "No messages yet." : "No unread messages."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("rounded-sm border bg-white p-5 transition-opacity", !msg.read && "border-l-4 border-l-[--color-primary]", msg.read && "opacity-70")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {msg.read ? <MailOpen className="h-4 w-4 text-[--color-muted] shrink-0" /> : <Mail className="h-4 w-4 text-[--color-primary] shrink-0" />}
                      <h3 className="font-semibold text-[--color-ink]">{msg.name}</h3>
                      <span className="text-xs text-[--color-muted]">{new Date(msg.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[--color-muted] mb-2">
                      <a href={`mailto:${msg.email}`} className="hover:text-[--color-primary]">{msg.email}</a>
                      {msg.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{msg.phone}</span>}
                    </div>
                    <p className="text-sm text-[--color-muted] leading-relaxed">{msg.message}</p>
                  </div>
                  {!msg.read && (
                    <Button size="sm" variant="outline" onClick={() => markRead.mutate(msg.id)} disabled={markRead.isPending} className="shrink-0">
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
