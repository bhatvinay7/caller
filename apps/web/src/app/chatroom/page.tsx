"use client";
import { useState, useRef } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "chat-ui";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function ChatRoomUI() {
  const [roomId, setRoomId] = useState<string>("");
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const joinInputRef = useRef<HTMLInputElement>(null);

  const createRoom = async () => {
    const id = generateRoomId();
    setRoomId(id);
    await navigator.clipboard.writeText(id);
    // toast.success("Room created & copied to clipboard");
  };

  const joinRoom = () => {
    if (!joinRoomId.trim()) {
    //   toast.error("Please enter a room ID");
      return;
    }

    // navigation / socket join logic goes here
    // toast.success(`Joined room ${joinRoomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Chat Rooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Room */}
          <div className="space-y-2">
            <Button className="w-full" onClick={createRoom}>
              Create Room
            </Button>
            {roomId && (
              <Input value={roomId} readOnly className="text-center" />
            )}
          </div>

          {/* Join Room */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                ref={joinInputRef}
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (!joinRoomId.trim()) {
                    // toast.error("Nothing to copy");
                    return;
                  }

                  try {
                    const input = joinInputRef.current;
                    if (input) {
                      input.focus();
                      input.setSelectionRange(0, input.value.length);
                    }

                    await navigator.clipboard.writeText(joinRoomId);
                    // toast.success("Room ID copied");
                  } catch (err) {
                    // toast.error("Copy failed – browser blocked clipboard");
                  }
                }}
              >
                Copy
              </Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={joinRoom}>
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
