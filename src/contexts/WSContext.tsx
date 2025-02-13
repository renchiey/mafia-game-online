import { useEffect, createContext, ReactNode, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { instanceOfMessage } from "../utils/helper";
import { ChannelInterface, Message } from "../types";

export const WebSocketContext = createContext<any>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const WS_URL = "ws://localhost:8080";
  const channels = useRef<ChannelInterface>({});

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log("websocket opened."),
  });

  const subscribe = (channel: string, callback: any) => {
    channels.current[channel] = callback;
  };

  const unsubscribe = (channel: string) => {
    delete channels.current[channel];
  };

  const send = (message: Message) => {
    sendJsonMessage(message);
  };

  useEffect(() => {
    if (lastJsonMessage && instanceOfMessage(lastJsonMessage)) {
      const { type, data } = lastJsonMessage;

      if (channels.current[type]) channels.current[type](data);
    }
  }, [lastJsonMessage]);

  return (
    <WebSocketContext.Provider value={[subscribe, unsubscribe, send]}>
      {children}
    </WebSocketContext.Provider>
  );
}
