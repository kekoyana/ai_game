import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameMessageData } from '../components/GameMessage';

interface MessageState {
  messages: GameMessageData[];
}

type MessageAction =
  | { type: 'ADD_MESSAGE'; payload: Omit<GameMessageData, 'id' | 'timestamp'> }
  | { type: 'CLEAR_MESSAGES' };

const initialState: MessageState = {
  messages: []
};

const MessageContext = createContext<{
  state: MessageState;
  addMessage: (message: Omit<GameMessageData, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
} | undefined>(undefined);

function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.payload,
            id: crypto.randomUUID(),
            timestamp: Date.now()
          }
        ].slice(-50) // 最新の50件のみを保持
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
    default:
      return state;
  }
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  const addMessage = useCallback((message: Omit<GameMessageData, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  return (
    <MessageContext.Provider value={{ state, addMessage, clearMessages }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}