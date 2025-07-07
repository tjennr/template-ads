#!/usr/bin/env python3
import os
import subprocess
import sys
import threading
import time
import requests
from flask import Flask, Response, request

# Create a Flask app that serves React build files
app = Flask(__name__, static_folder='typescript-react/build/static', static_url_path='/static')

@app.route('/')
def index():
    try:
        with open('typescript-react/build/index.html', 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "React build not found. Building now...", 500

@app.route('/<path:path>')
def catch_all(path):
    # For React Router - serve index.html for all non-static routes
    try:
        with open('typescript-react/build/index.html', 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "React build not found", 404

@app.route('/manifest.json')
def manifest():
    try:
        with open('typescript-react/build/manifest.json', 'r') as f:
            return Response(f.read(), mimetype='application/json')
    except FileNotFoundError:
        return "Manifest not found", 404

@app.route('/test')
def test():
    with open('test.html', 'r') as f:
        return f.read()

@app.route('/debug')
def debug():
    with open('debug.html', 'r') as f:
        return f.read()

def build_react_app():
    """Build React app for production"""
    try:
        os.chdir('typescript-react')
        print("Building React app...")
        result = subprocess.run(['npm', 'run', 'build'], check=True, capture_output=True, text=True)
        print("React app built successfully!")
        os.chdir('..')
        return True
    except Exception as e:
        print(f"Failed to build React app: {e}")
        return False

# Build React app on startup
build_react_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
