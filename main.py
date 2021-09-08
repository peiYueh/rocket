from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.requests import Request

app = FastAPI()

templates = Jinja2Templates(directory="templates")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()
username_list = []
@app.get("/{username}", response_class=HTMLResponse)
async def get(request: Request, username): 
    #return HTMLResponse(html)
    if username not in username_list:
        username_list.append(username)
    print(username_list)
    return templates.TemplateResponse("index.html", {"request": request, "username": username})

# to keep track how many messages are sent
message = []

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{data}")
            message.append(".")
            print(len(message))
            # broadcast a message when it reaches a specific number
            if len(message) == 10:
                await manager.broadcast("YAYYAY")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # dont think that we are using it
        #await manager.broadcast(f"Client #{client_id} left the chat")