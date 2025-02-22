import { useState, useRef, useEffect, useContext } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import { ChatMessage, MessageType, Player } from "../../../../shared/types";

interface ChatWidgetProps {
  players: Player[];
  playerId: string;
}

export function ChatWidget({ players, playerId }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    subscribe(MessageType.CHAT_MESSAGE, (newMessage: ChatMessage) => {
      setMessages([...messages, newMessage]);
    });

    return () => unsubscribe(MessageType.CHAT_MESSAGE);
  }, [subscribe, unsubscribe]);

  const sendMessage = () => {
    if (!input.trim()) return;

    send({ type: MessageType.CHAT_MESSAGE, data: input });

    setInput("");
  };

  const getSenderPrefix = (msg: ChatMessage) => {
    if (msg.sender === "server") return null;

    const player = players.find((p) => p.clientId === msg.sender);

    if (!player) throw new Error(`No player with clientId ${msg.sender}`);

    let color = "text-blue-700";

    return (
      <span
        className={
          "font-bold mr-2 " + (player.clientId === playerId ? color : null)
        }
      >
        {player.username}:
      </span>
    );
  };

  return (
    <div className="w-[80%] max-w-[400px] p-4 border rounded-2xl shadow-lg flex flex-col h-96 bg-white text-black">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-center p-1 border-b">
            {getSenderPrefix(msg)}
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex mt-2 border-t pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-l focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="w-[60px] bg-blue-500 hover:bg-blue-600 active:bg-blue-600 rounded-xl text-white ml-4"
        >
          Send
        </button>
      </div>
    </div>
  );
}
