// src/pages/Messages.tsx
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(100),
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch unread counts
  const { data: unreadCountsData = {} } = useQuery({
    queryKey: ['unreadCounts'],
    queryFn: async () => {
      const counts: Record<number, number> = {};
      for (const conversation of conversations) {
        const data = await api.getUnreadMessageCount();
        counts[conversation.id] = data.count;
      }
      return counts;
    },
    enabled: !!user && conversations.length > 0,
    refetchInterval: 10000,
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: number) => api.deleteConversation(conversationId),
    onSuccess: () => {
      refetchConversations();
      setSelectedConversationId(undefined);
    },
  });

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
        <p className="text-gray-600 mt-1">Gérez vos conversations avec les entreprises</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Conversations List - Desktop */}
        <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
            unreadCounts={unreadCountsData}
            currentUserId={user.id}
            isLoading={conversationsLoading}
          />
        </div>

        {/* Mobile: Conversations or Chat */}
        <div className="flex-1 md:hidden bg-white flex flex-col">
          {!selectedConversationId ? (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
              unreadCounts={unreadCountsData}
              currentUserId={user.id}
              isLoading={conversationsLoading}
            />
          ) : (
            selectedConversation && (
              <ChatWindowPage
                conversation={selectedConversation}
                currentUserId={user.id}
                onBack={() => setSelectedConversationId(undefined)}
              />
            )
          )}
        </div>

        {/* Chat Window - Desktop */}
        <div className="hidden md:flex-1 md:flex md:bg-gray-50 md:p-6">
          {selectedConversation ? (
            <ChatWindowDesktop
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-semibold">Sélectionnez une conversation</p>
                <p className="text-sm">Choisissez une conversation pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop Chat Window (full-screen mode)
function ChatWindowDesktop({ conversation, currentUserId }: any) {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm flex flex-col">
      <ChatWindow
        conversation={conversation}
        currentUserId={currentUserId}
        onClose={() => {}}
        position={{ x: 0, y: 0 }}
      />
    </div>
  );
}

// Mobile Chat Window
function ChatWindowPage({ conversation, currentUserId, onBack }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <p className="font-semibold">
            {conversation.participant1_id === currentUserId
              ? conversation.participant2?.full_name
              : conversation.participant1?.full_name}
          </p>
          <p className="text-xs text-gray-500">En ligne</p>
        </div>
      </div>

      {/* Chat Content */}
      <ChatWindow
        conversation={conversation}
        currentUserId={currentUserId}
        onClose={() => {}}
        position={{ x: 0, y: 0 }}
      />
    </div>
  );
}
