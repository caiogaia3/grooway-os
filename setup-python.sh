#!/bin/bash
# Exit on any error so the build fails gracefully instead of silently!
set -e

echo "======================================"
echo "[*] INSTALLING PYTHON INTELLIGENCE ENV"
echo "======================================"

cd intelligence

echo "1. Checking Python version:"
python3 -V || (echo "Python3 is not installed!" && exit 1)

echo "2. Creating isolated virtual environment explicitly named intelligent_env..."
python3 -m venv intelligent_env

echo "3. Upgrading PIP..."
./intelligent_env/bin/pip install --upgrade pip

echo "4. Installing requirement libraries..."
# We run without `|| echo` so it throws an error and kills the build if it fails finding a package (ex: requests)
./intelligent_env/bin/pip install -r requirements.txt

echo "======================================"
echo "[+] PYTHON SETUP COMPLETE"
echo "======================================"
