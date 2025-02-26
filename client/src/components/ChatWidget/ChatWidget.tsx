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
  const [isDead, setIsDead] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const currentPlayer = players.find((p) => p.clientId === playerId);

    if (!currentPlayer) throw new Error("WTF is going on here.");

    if (currentPlayer.gameData.dead) {
      setIsDead(true);
    } else {
      setIsDead(false);
    }
  }, [players]);

  useEffect(() => {
    subscribe(MessageType.CHAT_MESSAGE, (newMessage: ChatMessage) => {
      setMessages([...messages, newMessage]);
    });

    return () => unsubscribe(MessageType.CHAT_MESSAGE);
  }, [subscribe, unsubscribe]);

  const sendMessage = () => {
    if (!input.trim() || isDead) return;

    send({ type: MessageType.CHAT_MESSAGE, data: input });

    setInput("");
  };

  const formatMessage = (msg: ChatMessage) => {
    const player = players.find((p) => p.clientId === msg.sender);

    let messageColor = "";
    let sender = "";
    let senderIsCurrentClient = "";

    if (msg.sender === "server-error") {
      messageColor = "text-red-500";
    }

    if (player) {
      sender = (player.username as string) + ":";

      if (player.clientId === playerId) senderIsCurrentClient = "text-blue-700";
    }

    return (
      <>
        {sender && (
          <span className={"font-bold mr-2 " + senderIsCurrentClient}>
            {sender}
          </span>
        )}
        <span className={messageColor}>{msg.text}</span>
      </>
    );
  };

  return (
    <div className="w-[80%] max-w-[400px] p-4 border rounded-2xl shadow-lg flex flex-col h-96 bg-white text-black">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-center p-1 border-b">
            {formatMessage(msg)}
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
