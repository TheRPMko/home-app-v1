import { useState, type ChangeEvent } from "react";
import { Socket } from "socket.io-client";
import { Button, Group, TextInput } from "@mantine/core";

interface ServerToClientEvents {
  receive_message: (data: {
    message: string;
    username: string;
    timestamp: number;
  }) => void;
}

interface ClientToServerEvents {
  send_message: (data: {
    username: string;
    message: string;
    timestamp: number;
  }) => void;
}

interface SendMessageProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  username: string;
}

const ChatBox = ({ socket, username }: SendMessageProps) => {
  const [message, setMessage] = useState<string>("");

  const sendMessage = () => {
    if (message.trim() !== "") {
      const timestamp = Date.now();

      socket.emit("send_message", {
        username,
        message,
        timestamp,
      });

      setMessage("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Group grow>
      <TextInput
        placeholder="Message..."
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={sendMessage} disabled={message.trim() === ""}>
        Send Message
      </Button>
    </Group>
  );
};

export default ChatBox;
