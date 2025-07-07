import { Avatar, Group, Paper, ScrollArea, Text, Box } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

import "./ChatMessages.css";

interface Message {
  message: string;
  username: string;
  timestamp: string;
}

interface ServerToClientEvents {
  receive_message: (data: Message) => void;
}

interface ClientToServerEvents {
  hello?: () => void;
}

interface ChatMessagesProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  currentUsername: string;
}

const MessageBubble = ({ msg }: { msg: Message }) => (
  <Paper
    className="chat-message-paper glass"
    withBorder
    radius="md"
    shadow="xs"
    p="sm"
  >
    <Group className="chat-message-header" align="center" mb="xs">
      <Group align="center">
        <Avatar size="md" color="white" radius="md">
          {msg.username?.[0]?.toUpperCase() ?? "?"}
        </Avatar>
        <Text size="sm" fw={600}>
          {msg.username}
        </Text>
      </Group>
      <Text className="chat-message-timestamp" size="xs">
        {formatDate(msg.timestamp)}
      </Text>
    </Group>
    <Text ta="left">{msg.message}</Text>
  </Paper>
);

const SystemMessage = ({ message }: { message: string }) => (
  <Text className="chat-message-system" fw={600} ta="center">
    - {message} -
  </Text>
);

function formatDate(timestamp: string | number | Date) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString();
}

const ChatMessages = ({ socket, currentUsername }: ChatMessagesProps) => {
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(socket.connected);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Listen for incoming messages & socket connection changes
  useEffect(() => {
    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    console.log("Viewport ref current:", scrollViewportRef.current);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <Box
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        p="xs"
        style={{
          textAlign: "start",
          fontWeight: "bold",
          color: connected ? "green" : "red",
        }}
      >
        <span style={{ color: connected ? "green" : "red", marginRight: 6 }}>
          &#9679;
        </span>
        {connected ? "Connected" : "Disconnected"}
      </Box>

      <ScrollArea
        viewportRef={scrollViewportRef}
        ref={scrollContainerRef}
        className="chat-messages-container glass"
        scrollbarSize={6}
        type="always"
        offsetScrollbars
        scrollHideDelay={500}
        style={{ flex: 1 }}
      >
        {messages.map((msg, index) => {
          const key =
            msg.username === "system"
              ? `system-${index}`
              : `${msg.timestamp}-${msg.username}-${index}`;

          const wrapperClass = `chat-message-wrapper ${
            msg.username === "system"
              ? "system"
              : msg.username === currentUsername
              ? "own"
              : "other"
          }`;

          return (
            <div key={key} className={wrapperClass}>
              {msg.username === "system" ? (
                <SystemMessage message={msg.message} />
              ) : (
                <MessageBubble msg={msg} />
              )}
            </div>
          );
        })}
      </ScrollArea>
    </Box>
  );
};

export default ChatMessages;
