from fastapi import FastAPI, WebSocket
from random import choice, randint
import asyncio
import uvicorn
'''
WARNING 
NOT IN USE
'''

app = FastAPI()

CHANNELS = ["A", "B", "C"]

@app.websocket("/sample")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        await websocket.send_json({
            "channel": choice(CHANNELS),
            "data": randint(1, 10)
            }
        )
        await asyncio.sleep(0.5)

if __name__ == '__main__':
    uvicorn.run(app,host="127.0.0.1", port="8000")