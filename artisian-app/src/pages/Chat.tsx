// frontend/src/pages/Chat.tsx
import { useState, useEffect, useRef } from "react";

const C = {
  orange: "#D85A30", orangeLight: "#FAECE7",
  cream: "#FAF8F5", stone50: "#F1EFE8", stone800: "#2C2C2A",
  white: "#ffffff", gray100: "#F5F5F4", gray200: "#E7E5E4",
  gray300: "#D6D3D1", gray400: "#A8A29E", gray500: "#78716C",
  gray600: "#57534E", gray700: "#44403C",
  green50: "#F0FDF4", green800: "#166534",
  blue50: "#EFF6FF", blue700: "#1D4ED8",
};

const outlineBtn: React.CSSProperties = { border: `2px solid ${C.orange}`, color: C.orange, fontWeight: 700, background: C.white, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };

const API = "https://artisan-backend-gbby.onrender.com/api";

interface Conversation { id: number; name: string; role: string; shop_name: string; last_message: string; last_time: string; unread: number; }
interface Message { id: number; sender_id: number; receiver_id: number; message: string; sender_name: string; is_read: number; created_at: string; }
interface ChatUser { id: number; name: string; role: string; shop_name: string; }

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API}/messages/conversations`, { headers });
      if (res.ok) setConversations(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchMessages = async (userId: number) => {
    try {
      const res = await fetch(`${API}/messages/${userId}`, { headers });
      if (res.ok) {
        setMessages(await res.json());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) { console.error(err); }
  };

  const fetchChatUsers = async () => {
    try {
      const res = await fetch(`${API}/messages/users`, { headers });
      if (res.ok) setChatUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const selectConversation = (conv: Conversation | ChatUser) => {
    setSelectedUser(conv);
    setShowNewChat(false);
    fetchMessages(conv.id);
  };

  const sendMsg = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await fetch(`${API}/messages`, {
        method: "POST", headers,
        body: JSON.stringify({ receiver_id: selectedUser.id, message: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages(selectedUser.id);
        fetchConversations();
      }
    } catch (err) { console.error(err); }
  };

  const getTimeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const filteredUsers = chatUsers.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()));

  if (!token) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Please Login</div>
          <a href="/login" style={{ ...outlineBtn, textDecoration: "none", padding: "10px 24px" }}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.gray200}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: C.orange, fontWeight: 700, fontSize: 20, textDecoration: "none" }}>Artisan Co-op</a>
<a href="/" style={{ padding: "6px 16px", border: `1.5px solid ${C.orange}`, borderRadius: 20, color: C.orange, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Home</a>
          <span style={{ fontSize: 14, color: C.gray400 }}>/ Messages</span>
        </div>
        <button onClick={() => { setShowNewChat(true); fetchChatUsers(); }} style={outlineBtn}>+ New Chat</button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar - Conversations */}
        <div style={{ width: 320, background: C.white, borderRight: `1px solid ${C.gray200}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderBottom: `1px solid ${C.gray200}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gray700 }}>Messages</div>
          </div>

          {/* New Chat - User List */}
          {showNewChat && (
            <div style={{ borderBottom: `1px solid ${C.gray200}`, padding: 12 }}>
              <input value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder="Search users..." style={{ width: "100%", border: `1px solid ${C.gray300}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 8 }}>
                {filteredUsers.map((u) => (
                  <div key={u.id} onClick={() => selectConversation(u)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, cursor: "pointer", background: "transparent" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#712B13", flexShrink: 0 }}>{u.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.gray700 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: C.gray400 }}>{u.role}{u.shop_name ? ` \u2014 ${u.shop_name}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: C.gray400 }}>Loading...</div>
            ) : conversations.length === 0 && !showNewChat ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.gray700, marginBottom: 4 }}>No messages yet</div>
                <div style={{ fontSize: 12, color: C.gray400, marginBottom: 12 }}>Start a conversation!</div>
                <button onClick={() => { setShowNewChat(true); fetchChatUsers(); }} style={{ ...outlineBtn, fontSize: 12, padding: "6px 16px" }}>+ New Chat</button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id} onClick={() => selectConversation(conv)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", borderBottom: `0.5px solid ${C.gray100}`, background: selectedUser?.id === conv.id ? C.orangeLight : "transparent" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: selectedUser?.id === conv.id ? C.orange : C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: selectedUser?.id === conv.id ? C.white : "#712B13" }}>{conv.name.charAt(0)}</div>
                    {conv.unread > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: C.orange, color: C.white, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{conv.unread}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: conv.unread > 0 ? 700 : 500, color: C.gray700 }}>{conv.name}</span>
                      <span style={{ fontSize: 11, color: C.gray400 }}>{conv.last_time ? getTimeAgo(conv.last_time) : ""}</span>
                    </div>
                    <div style={{ fontSize: 12, color: conv.unread > 0 ? C.gray700 : C.gray400, fontWeight: conv.unread > 0 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.last_message || "Start chatting..."}</div>
                    <div style={{ fontSize: 10, color: C.gray400 }}>{conv.role}{conv.shop_name ? ` \u2014 ${conv.shop_name}` : ""}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.cream }}>
          {!selectedUser ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.gray700, marginBottom: 8 }}>Select a conversation</div>
                <div style={{ fontSize: 14, color: C.gray400 }}>Choose a chat from the sidebar or start a new one</div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ background: C.white, borderBottom: `1px solid ${C.gray200}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#712B13" }}>{selectedUser.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.gray700 }}>{selectedUser.name}</div>
                  <div style={{ fontSize: 12, color: C.gray400 }}>{selectedUser.role}{selectedUser.shop_name ? ` \u2014 ${selectedUser.shop_name}` : ""}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                    <div>Send the first message!</div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 12 }}>
                        <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                          {!isMe && <div style={{ fontSize: 11, color: C.gray400, marginBottom: 4 }}>{msg.sender_name}</div>}
                          <div style={{
                            background: isMe ? C.orange : C.white,
                            color: isMe ? C.white : C.gray700,
                            padding: "10px 16px",
                            borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            fontSize: 14,
                            lineHeight: 1.5,
                            border: isMe ? "none" : `1px solid ${C.gray200}`,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          }}>{msg.message}</div>
                          <div style={{ fontSize: 10, color: C.gray400, marginTop: 4 }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {isMe && <span style={{ marginLeft: 6 }}>{msg.is_read ? "✓✓" : "✓"}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ background: C.white, borderTop: `1px solid ${C.gray200}`, padding: "12px 24px", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                    placeholder="Type a message..."
                    style={{ flex: 1, border: `1px solid ${C.gray300}`, borderRadius: 24, padding: "10px 18px", fontSize: 14, outline: "none" }}
                  />
                  <button onClick={sendMsg} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 24, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Send</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;