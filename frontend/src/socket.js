import { io } from "socket.io-client";

// Establish WebSocket connection
const socket = io("http://localhost:8080/socket.io");

// Function to send game data to the server
export const sendGameData = (data) => {
  socket.emit("game_data", data);
};

// Function to listen for game state updates from the server
export const listenForGameState = (callback) => {
  socket.on("game_state", callback);
};

// Function to handle WebSocket disconnection
export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
