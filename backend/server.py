import random
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS  # Import CORS

# Initialize Flask and SocketIO
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins for SocketIO

# Game state variables
game_state = {
    "player1Score": 0,
    "player2Score": 0,
    "ball": {"x": 300, "y": 200, "radius": 10, "vx": 4, "vy": 4},
    "paddle1Y": 200,
    "paddle2Y": 200,
    "obstacles": [
        {"x": random.randint(100, 500), "y": random.randint(100, 300)},
        {"x": random.randint(100, 500), "y": random.randint(100, 300)},
    ],
}

# Helper function to check ball and paddle collisions
def check_collisions():
    ball = game_state["ball"]
    paddle1Y = game_state["paddle1Y"]
    paddle2Y = game_state["paddle2Y"]
    obstacles = game_state["obstacles"]

    # Ball collisions with walls
    if ball["y"] <= 0 or ball["y"] >= 390:
        ball["vy"] = -ball["vy"]

    # Ball collisions with paddles
    if ball["x"] <= 40 and paddle1Y <= ball["y"] <= paddle1Y + 60:
        ball["vx"] = -ball["vx"]
    if ball["x"] >= 560 and paddle2Y <= ball["y"] <= paddle2Y + 60:
        ball["vx"] = -ball["vx"]

    # Ball collisions with obstacles
    for obstacle in obstacles:
        if (
            obstacle["x"] <= ball["x"] <= obstacle["x"] + 50
            and obstacle["y"] <= ball["y"] <= obstacle["y"] + 50
        ):
            ball["vx"] = -ball["vx"]
            ball["vy"] = -ball["vy"]

    # Ball out of bounds (scoring)
    if ball["x"] <= 0:
        game_state["player2Score"] += 1
        reset_ball()
    elif ball["x"] >= 600:
        game_state["player1Score"] += 1
        reset_ball()

# Helper function to reset the ball after scoring
def reset_ball():
    game_state["ball"] = {"x": 300, "y": 200, "radius": 10, "vx": 4, "vy": 4}

# Socket.IO event for handling paddle movement
@socketio.on("movePaddle")
def handle_move_paddle(data):
    if "paddle1Y" in data:
        game_state["paddle1Y"] = data["paddle1Y"]
    if "paddle2Y" in data:
        game_state["paddle2Y"] = data["paddle2Y"]

# Socket.IO event for handling scoring
@socketio.on("score")
def handle_score(data):
    if "playerScored" in data:
        if data["playerScored"] == 1:
            game_state["player1Score"] += 1
        elif data["playerScored"] == 2:
            game_state["player2Score"] += 1
        print(f"Scores updated: Player 1: {game_state['player1Score']}, Player 2: {game_state['player2Score']}")
        socketio.emit("gameState", game_state, broadcast=True)  # Emit game state after scoring

# Socket.IO event for sending game state to clients
@socketio.on("getGameState")
def get_game_state():
    emit("gameState", game_state, broadcast=True)

# Main game loop to update the ball's position
def game_loop():
    game_state["ball"]["x"] += game_state["ball"]["vx"]
    game_state["ball"]["y"] += game_state["ball"]["vy"]
    check_collisions()
    socketio.emit("gameState", game_state, room=None)   # Emit game state to all clients


# Start the game loop as a background task
def start_game_loop():
    while True:
        game_loop()
        socketio.sleep(0.02)  # Simulate 50 FPS

# Start the background task when the server starts
@socketio.on("connect")
def start_game_on_connect():
    socketio.start_background_task(target=start_game_loop)

# Serve the game
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)  # Ensure it's listening on all interfaces (0.0.0.0)
