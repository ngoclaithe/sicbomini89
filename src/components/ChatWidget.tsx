"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { connectChatSocket, disconnectChatSocket, getChatSocket } from "@/lib/chatSocket";
import { Send, MessageCircle, X } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  ts: number;
}

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(0);
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const username = useMemo(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) return JSON.parse(u).username || "Khách";
    } catch {}
    return "Khách";
  }, []);

  const [allowed, setAllowed] = useState<boolean>(false);

  // Check token and auth status on mount and when dependencies change
  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // Enable/disable chat based on auth status and page
  useEffect(() => {
    if (!isClient) return;

    // Disable chat if no token (user not logged in) or on admin pages
    if (!token || pathname?.startsWith('/admin')) {
      setAllowed(false);
      disconnectChatSocket();
      return;
    }

    setAllowed(true);
  }, [token, pathname, isClient]);

  useEffect(() => {
    // Only setup socket if chat is allowed
    if (!allowed) return;

    const sock = connectChatSocket();

    const onMessage = (payload: any) => {
      const msg: ChatMessage = {
        id: payload.id || `${payload.user}-${payload.ts || Date.now()}`,
        user: payload.user || "Ẩn danh",
        text: payload.text || "",
        ts: payload.ts || Date.now(),
      };
      setMessages((prev) => [...prev.slice(-99), msg]);
    };

    const onOnline = (count: number) => setOnline(count || 0);

    sock.on("chat:message", onMessage);
    sock.on("message", onMessage);
    sock.on("chat:online", onOnline);
    sock.on("online", onOnline);

    return () => {
      sock.off("chat:message", onMessage);
      sock.off("message", onMessage);
      sock.off("chat:online", onOnline);
      sock.off("online", onOnline);
      disconnectChatSocket();
    };
  }, [allowed]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const payload = { user: username, text };
    const sock = getChatSocket();
    sock.emit("chat:send", payload);
    sock.emit("sendMessage", payload);
    setInput("");
  };

  // Don't render chat widget if not allowed (not logged in or on admin page)
  if (!allowed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-2 sm:hidden"
        aria-label="Mở chat"
      >
        <MessageCircle className="w-5 h-5" />
        Chat ({online})
      </button>

      {/* Panel */}
      <div
        className={`${
          open ? "" : "hidden sm:block"
        } w-[92vw] sm:w-80 md:w-96 max-h-[60vh] sm:max-h-[70vh] rounded-xl overflow-hidden border border-primary/30 bg-gray-900/95 backdrop-blur shadow-2xl`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div className="font-semibold">Trò chuyện</div>
          <div className="text-xs text-gray-400">Đang online: {online}</div>
        </div>

        <div className="p-3 space-y-2 overflow-y-auto max-h-[46vh] sm:max-h-[52vh]">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-semibold text-primary mr-2">{m.user}:</span>
              <span className="text-gray-200 break-words">{m.text}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm">Chưa có tin nhắn</div>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 border-t border-gray-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={send}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            aria-label="Gửi"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
