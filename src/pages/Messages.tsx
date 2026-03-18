import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Contact {
  user_id: string;
  full_name: string;
}

const Messages = () => {
  const { user, schoolId } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", schoolId],
    queryFn: async () => {
      if (!schoolId || !user) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("school_id", schoolId)
        .neq("user_id", user.id);
      return (data ?? []) as Contact[];
    },
    enabled: !!schoolId && !!user,
  });

  const { data: fetchedMessages = [], refetch } = useQuery({
    queryKey: ["messages", selectedContact?.user_id],
    queryFn: async () => {
      if (!selectedContact || !user) return [];
      const { data } = await supabase
        .from("direct_messages" as any)
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.user_id}),and(sender_id.eq.${selectedContact.user_id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      return (data ?? []) as unknown as Message[];
    },
    enabled: !!selectedContact && !!user,
  });

  useEffect(() => {
    setMessages(fetchedMessages);
  }, [fetchedMessages]);

  useEffect(() => {
    if (!user || !selectedContact) return;
    const channel = supabase
      .channel("dm-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedContact.user_id) ||
          (msg.sender_id === selectedContact.user_id && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedContact]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !user || !schoolId) return;
    const { error } = await supabase.from("direct_messages" as any).insert({
      sender_id: user.id,
      receiver_id: selectedContact.user_id,
      content: newMessage.trim(),
      school_id: schoolId,
    } as any);
    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
      refetch();
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Messages</h1>
        <Card className="rounded-xl overflow-hidden shadow-card h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            {/* Contact list */}
            <div className="w-full sm:w-72 border-r border-border flex flex-col bg-muted/30">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {filteredContacts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No contacts found</div>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.user_id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full text-left p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${
                        selectedContact?.user_id === contact.user_id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {contact.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{contact.full_name}</p>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col hidden sm:flex">
              {selectedContact ? (
                <>
                  <div className="h-14 px-4 flex items-center border-b border-border bg-card">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-primary">
                        {selectedContact.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-display font-semibold text-sm">{selectedContact.full_name}</span>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.sender_id === user?.id
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                            <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-border flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Select a contact to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
