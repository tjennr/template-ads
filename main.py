#!/usr/bin/env python3
import os
import subprocess
import sys
import threading
import time
import requests
from flask import Flask, Response, request

def start_react_dev_server():
    """Start React development server in background"""
    try:
        # Kill any existing React processes
        subprocess.run(['pkill', '-f', 'react-scripts'], check=False)
        time.sleep(3)
        
        # Change to the React directory
        current_dir = os.getcwd()
        react_dir = os.path.join(current_dir, 'typescript-react')
        
        print(f"Starting React development server in {react_dir}")
        
        # Start the React dev server
        process = subprocess.Popen(
            ['npm', 'start'],
            cwd=react_dir,
            env={**os.environ, 'PORT': '3000', 'HOST': '0.0.0.0', 'BROWSER': 'none'},
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Monitor the process
        while True:
            output = process.stdout.readline()
            if output:
                print(output.strip())
            if process.poll() is not None:
                break
        
    except Exception as e:
        print(f"Failed to start React dev server: {e}")

# Start React dev server in background thread
react_thread = threading.Thread(target=start_react_dev_server, daemon=True)
react_thread.start()

# Give React time to start
time.sleep(20)

# Create a Flask proxy app that serves React content
app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def proxy_to_react(path):
    """Proxy all requests to React dev server"""
    try:
        # Build the target URL
        target_url = f'http://localhost:3000/{path}'
        
        # Add query string if present
        if request.query_string:
            target_url += f'?{request.query_string.decode()}'
        
        # Forward the request
        resp = requests.get(
            target_url,
            headers={key: value for key, value in request.headers if key.lower() != 'host'},
            timeout=10
        )
        
        # Create response
        response = Response(
            resp.content,
            status=resp.status_code,
            headers=dict(resp.headers)
        )
        
        # Remove headers that might cause issues
        response.headers.pop('content-encoding', None)
        response.headers.pop('transfer-encoding', None)
        
        return response
        
    except Exception as e:
        return f"Proxy error: {e}", 502

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)