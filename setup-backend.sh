#!/bin/bash

# RepoRecon Backend Setup Script
# This script sets up the Python environment and installs dependencies

set -e  # Exit on error

echo "🚀 RepoRecon Backend Setup"
echo "=========================="
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✓ Python $PYTHON_VERSION found"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📥 Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env with your GitHub token and SMEE URL"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your GitHub token and SMEE URL"
echo "2. Activate the virtual environment: source venv/bin/activate"
echo "3. Start the backend: python3 -m uvicorn backend.main:app --reload --port 8000"
echo ""
