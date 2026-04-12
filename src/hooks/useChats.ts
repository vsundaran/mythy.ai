import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserChats, fetchChatDetails, sendChatMessage, deleteMultipleChats, IChat } from '../services/chat.service';

export const useUserChats = () => {
  return useQuery<IChat[], Error>({
    queryKey: ['chats'],
    queryFn: fetchUserChats,
  });
};

export const useChatDetails = (chatId: string) => {
  return useQuery<IChat, Error>({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChatDetails(chatId),
    enabled: !!chatId,
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ question, chatId }: { question: string; chatId?: string }) =>
      sendChatMessage(question, chatId),
    onSuccess: (data, variables) => {
      // Invalidate the chat list so it reflects the new updated time / last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      // If we are currently in a specific chat, invalidate its details to fetch new msg
      if (variables.chatId || data.chatId) {
        queryClient.invalidateQueries({ queryKey: ['chat', variables.chatId || data.chatId] });
      }
    },
  });
};

export const useDeleteChats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatIds: string[]) => deleteMultipleChats(chatIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
