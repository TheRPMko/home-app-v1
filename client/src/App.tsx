import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import io, { Socket } from "socket.io-client";

import Home from "./routes/Home";

import "./App.css";
import Chat from "./routes/Chat";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://192.168.0.136:8080"
);

function App() {
  const [username, setUsername] = useState<string>("");
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              username={username}
              setUsername={setUsername}
              socket={socket}
            />
          }
        />
        <Route
            path='/chat'
            element={<Chat username={username} socket={socket} />}
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
