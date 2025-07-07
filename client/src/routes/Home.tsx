// Home.tsx
import { Button, Paper, TextInput, Title } from "@mantine/core";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router";
import type { Socket } from "socket.io-client";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  join_chat: (data: { username: string }) => void;
}

interface HomeProps {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

const Home = ({ username, setUsername, socket }: HomeProps) => {
  const navigate = useNavigate();

  const joinChat = () => {
    if (username !== "") {
      socket.emit("join_chat", { username });
      navigate("/chat");
    }
  };

  return (
    <div>
      <Paper shadow="sm" p="xl">
        <Title order={1}>Welcome home!</Title>
        <TextInput
          mt="md"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button
          mt="md"
          variant="filled"
          color="indigo"
          fullWidth
          onClick={joinChat}
        >
          Enter
        </Button>
      </Paper>
    </div>
  );
};

export default Home;
