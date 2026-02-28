#!/bin/bash
echo "Installing Python and Dependencies for NextJS server..."
cd intelligence || exit 1

echo "Installing requirements globally (Cloud environment)..."
# Force global installation in the container so we don't lose packages when venv gets git-ignored
python3 -m pip install -r requirements.txt --break-system-packages || python3 -m pip install -r requirements.txt || echo "FAILED TO INSTALL PYTHON REQUIRES!"

echo "Python setup complete."
