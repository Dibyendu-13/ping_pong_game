# Pong Game with Obstacles

This project implements a real-time multiplayer Pong game with obstacles. The game is built using Flask for the backend, which serves the game state via Socket.IO, and React for the frontend, where the game is rendered and user interactions are handled.

## Features

- **Multiplayer**: Two players control paddles to play the game.
- **Obstacles**: Random obstacles appear on the field that can bounce the ball.
- **Real-time Updates**: The game state is updated and synced between players using WebSockets (Socket.IO).
- **Score Tracking**: The game keeps track of each player's score.

## Technologies Used

- **Backend**:
  - Flask
  - Flask-SocketIO
  - Flask-CORS
  - Python (for backend logic and game state management)
- **Frontend**:
  - React
  - Socket.IO client
  - HTML5 Canvas (for game rendering)

## Installation

### Backend Setup

1. Clone the repository:

   ```
   git clone <repo-url>
   cd <repo-name>
   ```

2. Install the required dependencies:

```
cd backend
python -m venv myenv
source myenv/bin/activate or .\myenv\Scripts\activate #virtual env
pip install -r requirements.txt
```

3. Run the Flask backend:

```
python3 server.py
```

This will start the server on http://localhost:8000.

Frontend Setup

Navigate to the frontend directory (assuming it's in the same repository):

```
cd frontend
```

Install the necessary dependencies:

```
npm install
```

Run the React app:

```
npm start
```

The frontend should now be running on http://localhost:3000.

CORS and Socket.IO
The backend uses Flask-CORS to enable cross-origin requests from any domain.
Socket.IO is used to manage real-time communication between the server and clients for syncing the game state.

Game Mechanics
Ball Movement: The ball moves continuously, bouncing off walls, paddles, and obstacles.
Paddles: Players can control their paddles using the keys:
Player 1: W (up), S (down)
Player 2: Arrow Up (up), Arrow Down (down)
Obstacles: Random obstacles appear on the field. If the ball collides with an obstacle, it bounces off in the opposite direction.

### Backend Code Breakdown

Game State:

Tracks player scores (player1Score, player2Score)
Ball position (ball)
Paddle positions (paddle1Y, paddle2Y)
Obstacles (obstacles)
Collisions:

Ball collisions with paddles
Ball collisions with obstacles
Wall boundaries (top/bottom)
Socket.IO Events:

movePaddle: Moves the paddle for a player.
score: Handles scoring when the ball passes a player's paddle.
gameState: Sends the updated game state to the clients.

### Frontend Code Breakdown

Canvas Rendering:

Canvas Rendering: The game is rendered on an HTML5 <canvas> element, utilizing the CanvasRenderingContext2d API to draw the paddles, ball, obstacles, and scores.

Game State Management: State is managed using React hooks (useState, useEffect), which allows for dynamic and responsive updates to game variables. Socket.IO facilitates communication by listening for game state updates (such as paddle positions, ball state, scores, and obstacles) and emitting events for actions like paddle movements or score changes.

Paddle Movement:

Player 1 uses the W (up) and S (down) keys to control their paddle.
Player 2 uses the ArrowUp (up) and ArrowDown (down) keys to move their paddle.
To optimize the performance of paddle movement handling, useCallback is used for the paddle movement functions (movePaddle1 and movePaddle2). This ensures that the functions are only redefined when their dependencies (paddle positions) change, preventing unnecessary re-renders and improving efficiency. These callbacks trigger socket emissions, which synchronize the paddle positions across all clients in real-time.

### Ball Logic:

The ball is updated on the frontend and bounces off paddles and obstacles based on the backend calculations.
