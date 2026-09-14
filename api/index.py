import sys
import os

# Add the src directory to the Python path so lcx can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from lcx.main import app

# Vercel requires the ASGI app to be named `app` and exposed here
