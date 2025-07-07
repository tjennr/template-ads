#!/usr/bin/env python3
import os
import subprocess
import sys
import time

# Start React development server
try:
    os.chdir('typescript-react')
    # Set environment for external access
    os.environ['PORT'] = '5000'
    os.environ['HOST'] = '0.0.0.0'
    subprocess.run(['npm', 'start'], check=True)
except Exception as e:
    print(f"Failed to start React app: {e}")
    # Fallback to Flask app
    os.chdir('..')
    from app import app
    app.run(host='0.0.0.0', port=5000, debug=True)
