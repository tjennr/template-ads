#!/usr/bin/env python3
import os
import subprocess
import sys
import threading
import time
import requests
from flask import Flask, Response, request

# Create a Flask proxy app that serves React content
app = Flask(__name__)

@app.route('/')
def index():
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        return Response(response.content, mimetype=response.headers.get('content-type', 'text/html'))
    except Exception as e:
        return f"Error connecting to React dev server: {e}", 500

@app.route('/<path:path>')
def proxy(path):
    try:
        # Forward the request to React dev server
        url = f'http://localhost:3000/{path}'
        if request.query_string:
            url += f'?{request.query_string.decode()}'
        
        response = requests.get(url, timeout=5)
        
        # Get the proper content type
        content_type = response.headers.get('content-type', 'text/html')
        
        # Return the response with proper headers
        return Response(response.content, 
                       status=response.status_code,
                       mimetype=content_type)
    except Exception as e:
        return f"Error connecting to React dev server: {e}", 500

@app.route('/manifest.json')
def manifest():
    try:
        response = requests.get('http://localhost:3000/manifest.json', timeout=5)
        return Response(response.content, 
                       status=response.status_code,
                       mimetype='application/json')
    except Exception as e:
        return f"Error: {e}", 500

@app.route('/test')
def test():
    with open('test.html', 'r') as f:
        return f.read()

@app.route('/debug')
def debug():
    with open('debug.html', 'r') as f:
        return f.read()

def start_react_dev_server():
    """Start React development server in background"""
    try:
        os.chdir('typescript-react')
        os.environ['PORT'] = '3000'
        os.environ['HOST'] = '0.0.0.0'
        os.environ['BROWSER'] = 'none'
        
        print("Starting React development server on port 3000...")
        subprocess.run(['npm', 'start'], check=False)
    except Exception as e:
        print(f"Failed to start React dev server: {e}")

# Start React dev server in background thread
react_thread = threading.Thread(target=start_react_dev_server, daemon=True)
react_thread.start()

# Give React time to start
time.sleep(5)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
