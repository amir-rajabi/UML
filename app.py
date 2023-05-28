import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

from time import sleep
import zmq


#long_fn, send_msg, send_message, interrupt
#are copied from the original app.py file
def long_fn():
    sleep(slider_value)


def send_msg(msg, receiver: str = "tcp://localhost:5555"):
    print("Connecting to server…")
    socket = context.socket(zmq.REQ)
    socket.connect(receiver)
    socket.send_json(msg)
    reply = socket.recv()
    print(reply)
    socket.close()


def send_text_message():
    send_msg(dict(task_description=text_message, duration=slider_value))


def interrupt():
    send_msg("Interrupt")


#outsource this to separate files
def page1():
    st.header("Page 1")
    st.write("This is the content for page 1.")

def page2():
    st.header("Page 2")
    st.write("This is the content for page 2.")

def page3():
    st.header("Page 3")
    st.write("This is the content for page 3.")


st.set_page_config(layout="wide")
#imports custom css code
#currently makes the app not scrollable
with open('style.css') as f:
    st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)


context = zmq.Context()

page = "Page 1"
col1, col2, col3 = st.columns([5,4,1])

with col1:
    st.header("Graph")
    fig, ax = plt.subplots()
    x = np.linspace(0, 10, 100)
    y = np.sin(x)
    ax.plot(x, y)
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_title("Graph")
    st.pyplot(fig)


with col2:
    #does not work (yet)
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

with col3:
    #TODO: formating 

    #TODO: make this change page on col2
    # does not work yet
    st.header("Pages")
    if st.button("Page 1"):
        page = "Page 1"
    if st.button("Page 2"):
        page = "Page 2"
    if st.button("Page 3"):
        page = "Page 3"

