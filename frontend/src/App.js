import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import './App.css';

const socket = io("http://localhost:8000");  // Adjust the server URL if needed

const App = () => {
  const canvasRef = useRef(null);

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [ball, setBall] = useState({ x: 300, y: 200, radius: 10, vx: 4, vy: 4 });
  const [paddle1Y, setPaddle1Y] = useState(200);
  const [paddle2Y, setPaddle2Y] = useState(200);
  const [obstacles, setObstacles] = useState([]);

  // WebSocket message handler for receiving game state updates
  useEffect(() => {
    socket.on("gameState", (data) => {
      if (data.player1Score !== undefined) {
        setPlayer1Score(data.player1Score);
      }
      if (data.player2Score !== undefined) {
        setPlayer2Score(data.player2Score);
      }
      if (data.ball) {
        setBall(data.ball);
      }
      if (data.paddle1Y !== undefined) {
        setPaddle1Y(data.paddle1Y);
      }
      if (data.paddle2Y !== undefined) {
        setPaddle2Y(data.paddle2Y);
      }
      if (data.obstacles) {
        setObstacles(data.obstacles);
      }
    });

    return () => {
      socket.off("gameState");
    };
  }, []);

  // Paddle and ball movement with useCallback
  const movePaddle1 = useCallback((e) => {
    if (e.key === "w" && paddle1Y > 0) {
      setPaddle1Y(paddle1Y - 10);
      socket.emit("movePaddle", { paddle1Y: paddle1Y - 10 });
    }
    if (e.key === "s" && paddle1Y < 340) {
      setPaddle1Y(paddle1Y + 10);
      socket.emit("movePaddle", { paddle1Y: paddle1Y + 10 });
    }
  }, [paddle1Y]);

  const movePaddle2 = useCallback((e) => {
    if (e.key === "ArrowUp" && paddle2Y > 0) {
      setPaddle2Y(paddle2Y - 10);
      socket.emit("movePaddle", { paddle2Y: paddle2Y - 10 });
    }
    if (e.key === "ArrowDown" && paddle2Y < 340) {
      setPaddle2Y(paddle2Y + 10);
      socket.emit("movePaddle", { paddle2Y: paddle2Y + 10 });
    }
  }, [paddle2Y]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      movePaddle1(e);
      movePaddle2(e);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [movePaddle1, movePaddle2]);

  // Ball update and game loop with useCallback
  const updateGame = useCallback(() => {
    const updatedBall = { ...ball };
    updatedBall.x += updatedBall.vx;
    updatedBall.y += updatedBall.vy;

    // Ball collisions with walls
    if (updatedBall.y <= 0 || updatedBall.y >= 390) {
      updatedBall.vy = -updatedBall.vy;
    }

    // Ball collisions with paddles
    if (
      updatedBall.x <= 40 &&
      updatedBall.y >= paddle1Y &&
      updatedBall.y <= paddle1Y + 60
    ) {
      updatedBall.vx = -updatedBall.vx;
    }
    if (
      updatedBall.x >= 550 &&
      updatedBall.y >= paddle2Y &&
      updatedBall.y <= paddle2Y + 60
    ) {
      updatedBall.vx = -updatedBall.vx;
    }

    // Ball collisions with obstacles
    obstacles.forEach((obstacle) => {
      if (
        updatedBall.x >= obstacle.x &&
        updatedBall.x <= obstacle.x + 50 &&
        updatedBall.y >= obstacle.y &&
        updatedBall.y <= obstacle.y + 50
      ) {
        updatedBall.vx = -updatedBall.vx;
        updatedBall.vy = -updatedBall.vy;
      }
    });

    // Ball out of bounds (scoring)
    if (updatedBall.x <= 0) {
      socket.emit("score", { playerScored: 2 });
      updatedBall.x = 300;
      updatedBall.y = 200;
      updatedBall.vx = 4;
      updatedBall.vy = 4;
    } else if (updatedBall.x >= 600) {
      socket.emit("score", { playerScored: 1 });
      updatedBall.x = 300;
      updatedBall.y = 200;
      updatedBall.vx = -4;
      updatedBall.vy = 4;
    }

    setBall(updatedBall);
  }, [ball, paddle1Y, paddle2Y, obstacles]);

  // Game rendering
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const drawGame = () => {
      ctx.clearRect(0, 0, 600, 400);
      ctx.fillStyle = "white";

      // Draw paddles
      ctx.fillRect(30, paddle1Y, 10, 60); // Player 1 paddle
      ctx.fillRect(560, paddle2Y, 10, 60); // Player 2 paddle

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw obstacles
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, 50, 50);
      });

      // Draw scores
      ctx.font = "20px Arial";
      ctx.fillText(`Player 1: ${player1Score}`, 10, 30);
      ctx.fillText(`Player 2: ${player2Score}`, 450, 30);
    };

    const gameInterval = setInterval(() => {
      updateGame();
      drawGame();
    }, 1000 / 60);

    return () => clearInterval(gameInterval);
  }, [ball, paddle1Y, paddle2Y, obstacles, player1Score, player2Score, updateGame]);

  return (
    <div className="App">
      <canvas ref={canvasRef} width="600" height="400"></canvas>
    </div>
  );
};

export default App;
