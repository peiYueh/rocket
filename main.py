from __future__ import annotations

import json
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from datetime import datetime
from abc import ABC

TARGET_MESSAGE_THRESHOLD = 1000

app = FastAPI()

templates = Jinja2Templates(directory="templates")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.active_users: List[str] = []

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        if websocket not in self.active_connections:
            self.active_connections.append(websocket)
        if username not in self.active_users:
            self.active_users.append(username)

    def disconnect(self, websocket: WebSocket, username: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if username in self.active_users:
            self.active_users.remove(username)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


class Context:
    """
    The Context defines the interface of interest to clients. It also maintains
    a reference to an instance of a State subclass, which represents the current
    state of the Context.
    """

    # A reference to the current state of the Context
    state = None

    def __init__(self, state: State) -> None:
        self.transition_to(state)

    # The Context allows changing the State object at runtime
    def transition_to(self, state: State):
        self.state = state
        self.state.context = self


class State(ABC):
    """
    The base State class declares methods that all Concrete State should
    implement and also provides a backreference to the Context object,
    associated with the State. This backreference can be used by States to
    transition the Context to another State.
    """

    text: str = ""

    @property
    def context(self) -> Context:
        return self._context

    @context.setter
    def context(self, context: Context) -> None:
        self._context = context

    def __init__(self, state_text: str) -> None:
        self.text = state_text

    def __str__(self) -> str:
        return self.text


class EarthState(State):
    def __init__(self) -> None:
        super().__init__("EARTH")


class PausedState(State):
    def __init__(self) -> None:
        super().__init__("PAUSED")


class LaunchingState(State):
    def __init__(self) -> None:
        super().__init__("LAUNCHING")


class ArrivedState(State):
    def __init__(self) -> None:
        super().__init__("ARRIVED")

# username_list = []


# @app.get("/{username}", response_class=HTMLResponse)
# async def get(request: Request, username):
#     # return HTMLResponse(html)
#     if username not in username_list:
#         username_list.append(username)
#     print(username_list)
#     return templates.TemplateResponse("index.html", {"request": request, "username": username})

context = Context(EarthState())
manager = ConnectionManager()

# to keep track how many messages are sent
messages_store: List[dict] = []


@app.get("/")
async def home(request: Request):
    return "Ping"


@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)

    # PM the current system state
    await manager.send_personal_message(json.dumps({"type": "state", "state": context.state.text, "messages_count": len(messages_store)}), websocket)

    # PM the user the whole users list
    await manager.send_personal_message(json.dumps(manager.active_users), websocket)

    # Broadcast someone has joined message
    await manager.broadcast(json.dumps({"type": "announcement", "annoucement_type": "USER_JOINED", "message": f"{username} has joined the room"}))

    try:
        while True:
            # Get current date and time
            datetime_now = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

            # Get the message from client
            data = await websocket.receive_text()

            # Handle special commands
            triggered = await handle_commands(manager, data)
            if triggered:
                continue

            # Skip on heartbeat
            if data == "heartbeat":
                await manager.send_personal_message(json.dumps(manager.active_users), websocket)
                print(f"{datetime_now}: [HEARTBEAT] by {username}")
                continue

            # Construct a message
            msg: dict = {
                "type": "message",
                "username": username,
                "message": data,
                "sent_at": datetime_now
            }

            # Broadcast the message received
            await manager.broadcast(json.dumps(msg))

            # Add message to store
            messages_store.append({"username": username, "message": data})

            # Broadcast a message if it reaches the target
            if len(messages_store) == TARGET_MESSAGE_THRESHOLD:
                context.transition_to(ArrivedState())
                await manager.broadcast(json.dumps({"type": "event", "event": "Arrived"}))

            # Log the message
            print(f"Message count: {len(messages_store)}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, username)
        # dont think that we are using it
        print(f"{username} is disconnected")
        # Broadcast someone has joined message
        await manager.broadcast(json.dumps({"type": "announcement", "annoucement_type": "USER_LEFT", "message": f"{username} has left the room"}))


# This function handles different commands, it returns true
# if one of the commands is triggered
async def handle_commands(manager: ConnectionManager, data: str) -> bool:
    data = data.strip()

    if not data.startswith("!"):
        return False

    if data == "!LAUNCH":
        await manager.broadcast(json.dumps({"type": "event", "event": "Launch"}))
        context.transition_to(LaunchingState())
        return True
    elif data == "!STOP":
        await manager.broadcast(json.dumps({"type": "event", "event": "Stop"}))
        context.transition_to(PausedState())
        return True
    elif data == "!RESET":
        context.transition_to(EarthState())
        messages_store.clear()
        await manager.broadcast(json.dumps({"type": "event", "event": "Reset"}))
        return True
    elif data == "!ARRIVED":
        context.transition_to(ArrivedState())
        await manager.broadcast(json.dumps({"type": "event", "event": "Arrived"}))
        return True

    return False
