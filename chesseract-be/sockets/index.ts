import { Server, Socket } from "socket.io";
import registerMatchmakingEvents from "./events/matchmaking.ts";

export default function initializeSocketEvents(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    
    registerMatchmakingEvents(io, socket);
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}