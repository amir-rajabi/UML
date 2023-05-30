import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
from consumer_utils import consumer
import asyncio

from time import sleep
import zmq


#not usedful; only for simulation
def long_fn():
    sleep(slider_value)

#communicate with backend through zmq
def send_msg(msg, receiver: str = "tcp://localhost:5555"):
    print("Connecting to server…")
    socket = context.socket(zmq.REQ)
    socket.connect(receiver)
    socket.send_json(msg)
    reply = socket.recv()
    print(reply)
    socket.close()

#TODO: in the future will likly not send duration 
#but data structure of parameter adjustments
def send_text_message(text_message, duration):
    send_msg(dict(task_description=text_message, duration=duration))

def interrupt():
    send_msg("Interrupt")


#TODO: outsource this to separate files
def page1():
    st.header("Page 1")
    st.write("This is the content for page 1.")

def page2():
    st.header("Page 2")
    st.write("This is the content for page 2.")

def page3():
    st.header("Page 3")
    st.write("This is the content for page 3.")


#has to be before css
st.set_page_config(layout="wide")

#imports custom css code
#currently makes the app not scrollable
with open('style.css') as f:
    st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)




#init and layout
context = zmq.Context()
page = "Page 1"
col1, col2, col3 = st.columns([8,4,1])

with col3:
    #TODO: formating 

    st.header("Pages")

    #page buttons
    p1 = st.button("Page 1")
    p2 = st.button("Page 2")
    p3 = st.button("Page 3")
    if p1:
        page = "Page 1"
    if p2:
        page = "Page 2"
    if p3:
        page = "Page 3"


with col2:

    #updates if page buttons are
    #pressed on col3
    if page == "Page 1":
        page1()
    elif page == "Page 2":
        page2()
    elif page == "Page 3":
        page3()
    con1 = st.container()
    but1, but2, but3 = st.columns([1,1,1])

    #TODO: formating
    run = but1.button("Run Training")
    interrupt = but2.button("Interrupt Training")
    revert = but3.button("Revert")
    
    #doesn't work
    #if ( (p1 or p2 or p3) and not run):
    #    st.stop()

    #sends messages to real backend
    #was not fully finished and is now 
    #abandoned because it will not work
    #because of other things
    #if run:
        #send_text_message("run", 1)

#tries to connect to backend with consumer function
#defined in consumer_utils
#gets a dictionary of states sent by backend
#and can plot it on multple graphs

#has major problems since every button press
#will reset the graph/this entire sequence = VERY BAD
#@st.cache_resource
def run_col1(window_size, _status, selected_channels):
    
    if(len(selected_channels) != 0):
        columns = [col.empty() for col in st.columns(len(selected_channels))]
        arg1 = dict(zip(selected_channels, columns))
        #st.write("waiting for input")
        asyncio.run(consumer(arg1, window_size, _status))


with col1:
    
    #old test plot
    #st.header("Graph")
    #fig, ax = plt.subplots()
    #x = np.linspace(0, 10, 100)
    #y = np.sin(x)
    #ax.plot(x, y)
    #ax.set_xlabel("X")
    #ax.set_ylabel("Y")
    #ax.set_title("Graph")
    #st.pyplot(fig)

    window_size = 20
    #status of the connection (can be removed in the future)
    status = st.empty()
    #select what info to plot (should be removed in the future)
    selected_channels = st.multiselect("Select Channels[DO NOT SELECT LOSS]", ["acc","loss"], default=["acc"])

    #starts listening to signals on port 8000 once run is pressed on col2 
    if run:
        run_col1(window_size, status, selected_channels)
    
