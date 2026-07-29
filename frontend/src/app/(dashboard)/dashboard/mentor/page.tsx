'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mentorService, ChatConversation, ChatMessage } from '@/services/mentor.service';
import { ChatComposer } from '@/components/dashboard/mentor/ChatComposer';
import { Bot, User, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MentorPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await mentorService.getConversations();
      if (res.success) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConversationId) {
          setActiveConversationId(res.data[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const fetchMessages = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await mentorService.getConversation(id);
      if (res.success) {
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await mentorService.createConversation({ title: 'New Conversation' });
      if (res.success) {
        setConversations([res.data, ...conversations]);
        setActiveConversationId(res.data.id);
        setMessages([]);
      }
    } catch (error) {
      toast.error('Failed to create conversation');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await mentorService.deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(conversations[0]?.id || null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) {
      // Create one if none exists
      const res = await mentorService.createConversation({ title: content.substring(0, 30) });
      if (res.success) {
        setConversations([res.data, ...conversations]);
        setActiveConversationId(res.data.id);
        await sendAndFetch(res.data.id, content);
      }
      return;
    }
    
    await sendAndFetch(activeConversationId, content);
  };

  const sendAndFetch = async (id: string, content: string) => {
    setIsLoading(true);
    // Optimistic UI
    const tempMsg: ChatMessage = {
      id: 'temp', conversation_id: id, role: 'user', content, created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await mentorService.sendMessage(id, content);
      if (res.success) {
        // Fetch to get exact db state and AI response
        await fetchMessages(id);
      }
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== 'temp'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] border rounded-lg overflow-hidden bg-card">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Button onClick={handleNewConversation} className="w-full gap-2" variant="outline">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md cursor-pointer text-sm group transition-colors",
                activeConversationId === conv.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              )}
              onClick={() => setActiveConversationId(conv.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100" 
                onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-center p-4 text-muted-foreground text-sm">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-background shadow-sm z-10 font-semibold flex items-center justify-between">
          <span>AI Career Mentor</span>
          <span className="text-xs font-normal text-muted-foreground">Powered by ELEVATE</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/5">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold">How can I help your career today?</h2>
              <p className="text-muted-foreground">I can analyze your skills, suggest roadmap steps, or help you prepare for an interview.</p>
              <div className="flex flex-col gap-2 w-full mt-4">
                {['Analyze my current career readiness', 'What should I learn next?', 'Explain my skill gaps'].map(prompt => (
                  <Button key={prompt} variant="outline" onClick={() => handleSendMessage(prompt)}>
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={cn("flex gap-4 max-w-3xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border")}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={cn("px-4 py-3 rounded-2xl whitespace-pre-wrap", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-background border shadow-sm")}>
                {msg.content}
                {msg.provider === 'local' && (
                  <span className="block mt-2 text-xs opacity-70 border-t pt-1 border-current/20">Local Fallback Mode</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatComposer onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
