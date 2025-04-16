import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameMessageData } from '../components/GameMessage';

// UUIDを生成する関数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
            id: generateUUID(),
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