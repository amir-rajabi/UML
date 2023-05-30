import streamlit as st
import aiohttp
from collections import deque, defaultdict
from functools import partial

#port to listen to
WS_CONN = "ws://localhost:8000/sample"


#@st.cache_resource
async def consumer(_graphs, window_size, _status):
    windows = defaultdict(partial(deque, [0]*window_size, maxlen=window_size))

    async with aiohttp.ClientSession(trust_env = True) as session:
        #displays status
        _status.subheader(f"Connecting to {WS_CONN}")
        async with session.ws_connect(WS_CONN) as websocket:
            _status.subheader(f"Connected to: {WS_CONN}")
            async for message in websocket:
                #receives data
                data = message.json()

                #takes the message and plots it
                windows[data["channel"]].append(data["data"])
                for channel, graph in _graphs.items():
                    channel_data = {channel: windows[channel]}
                    if channel == "acc":
                        graph.line_chart(channel_data)
