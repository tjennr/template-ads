#!/usr/bin/env python3
import os
import subprocess
import sys
import threading
import time
from flask import Flask, redirect

# Create a simple Flask proxy app
app = Flask(__name__)

@app.route('/')
def index():
    return redirect('http://localhost:3000', code=302)

@app.route('/<path:path>')
def proxy(path):
    return redirect(f'http://localhost:3000/{path}', code=302)

def start_react_server():
    """Start React development server in background"""
    try:
        os.chdir('typescript-react')
        os.environ['PORT'] = '3000'
        os.environ['HOST'] = '0.0.0.0'
        os.environ['BROWSER'] = 'none'
        
        print("Starting React development server on port 3000...")
        subprocess.run(['npm', 'start'], check=False)
    except Exception as e:
        print(f"Failed to start React app: {e}")

# Start React server in background thread
react_thread = threading.Thread(target=start_react_server, daemon=True)
react_thread.start()

# Give React time to start
time.sleep(5)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
