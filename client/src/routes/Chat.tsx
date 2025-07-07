// Chat.tsx
import type { Socket } from "socket.io-client";
import ChatMessages from "../components/ChatMessages/ChatMessages";
import ChatBox from "../components/ChatBox/ChatBox";

interface ChatProps {
  username: string;
  socket: Socket;
}

const Chat = ({ username, socket }: ChatProps) => {
  return (
    <>
      Yo {username}!<div className="user-list">Map users here</div>
      <ChatMessages socket={socket} currentUsername={username} />
      <ChatBox socket={socket} username={username} />
    </>
  );
};

export default Chat;
