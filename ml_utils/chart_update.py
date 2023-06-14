import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO


data = {
    'd1': [1, 2, 3, 4, 5, 5, 2, 2, 1],
    'd2': [5, 4, 3, 2, 1],
    'd3': [1, 3, 5, 4, 2],
    'd4': [3, 4, 5, 2, 1]
}

#NOTE: try not to touch
class OnMyWatch:
    watchDirectory = "data/epoch_data.json"

    def __init__(self,data,socketio):
        self.socket = socketio
        self.data = data
        self.observer = Observer()

    def run(self):
        event_handler = Handler(self.data, self.socket)
        self.observer.schedule(
            event_handler, self.watchDirectory, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except:
            self.observer.stop()
            print("Observer Stopped")
        self.observer.join()


class Handler(FileSystemEventHandler):

    def __init__(self,data,socket):
        super().__init__() 
        self.socket = socket
        self.data = data
    #@staticmethod
    def on_any_event(self,event):
        if event.is_directory:
            return None
        elif event.event_type == 'modified':
            #TODO: send update
            print("LOG: Watchdog received modified event - % s." % event.src_path)
            data["d1"].append(4)
            self.socket.emit('update_chart', {'data': data})
            print("LOG: update_chart sent")


def chart_dog(data,socketio):
    watch = OnMyWatch(data,socketio)
    watch.run()
