import streamlit as st
import aiohttp
from collections import deque, defaultdict
from functools import partial

WS_CONN = "ws://localhost:8000/sample"

def my_hash_func(delta_generator):
    return hash(delta_generator._id)

def my_aio_hash_func(client_session):
    return hash(client_session._session_id)

@st.cache(hash_funcs={st.delta_generator.DeltaGenerator: my_hash_func, aiohttp.ClientSession: my_aio_hash_func})
async def consumer(graphs, window_size, status):
    windows = defaultdict(partial(deque, [0]*window_size, maxlen=window_size))

    async with aiohttp.ClientSession(trust_env = True) as session:
        status.subheader(f"Connecting to {WS_CONN}")
        async with session.ws_connect(WS_CONN) as websocket:
            status.subheader(f"Connected to: {WS_CONN}")
            async for message in websocket:
                data = message.json()

                windows[data["channel"]].append(data["data"])

                for channel, graph in graphs.items():
                    channel_data = {channel: windows[channel]}
                    if channel == "acc":
                        graph.line_chart(channel_data)
