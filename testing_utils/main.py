from fastapi import FastAPI, WebSocket
from random import choice, randint
import asyncio
import uvicorn


app = FastAPI()

CHANNELS = ["acc"]


#this works fine
#frontend ist  fucked so this will
#probably be not used
@app.websocket("/sample")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    for i in range(200):
        print("sending")
        #sends random numbers + iter to acc channel
        await websocket.send_json({
            "channel": choice(CHANNELS),
            "data": i +randint(1, 10)
            }
        )
        #await asyncio.sleep(0.5)

if __name__ == '__main__':
    #runs app with ip and socket
    uvicorn.run(app,host="127.0.0.1", port=8000)

