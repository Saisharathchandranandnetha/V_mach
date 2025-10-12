#!/usr/bin/env python3
"""
Setup script for V_Mach News Aggregation System
This script helps install dependencies and set up the environment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up V_Mach News Aggregation System...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Install Python dependencies
    print("\n📦 Installing Python dependencies...")
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        print("⚠️  Warning: Could not upgrade pip")
    
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing Python packages"):
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Install Playwright browsers
    print("\n🌐 Installing Playwright browsers...")
    if not run_command(f"{sys.executable} -m playwright install", "Installing Playwright browsers"):
        print("⚠️  Warning: Could not install Playwright browsers")
        print("   You may need to install them manually: playwright install")
    
    # Create .env file if it doesn't exist
    if not Path(".env").exists():
        print("\n📝 Creating .env file...")
        env_content = """# V_Mach Environment Variables
# Copy this file to .env and fill in your actual values

# News API Configuration
VITE_NEWS_API_KEY=your_news_api_key_here

# Server Configuration
PORT=3001

# Career Guidance / Chat Flow Configuration
CAREER_CHAT_FLOW_ENABLED=true

# OpenAI Configuration (for career guidance)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Vector Database Configuration
VITE_PINECONE_API_KEY=your_pinecone_api_key_here
VITE_PINECONE_ENV=your_pinecone_environment

# Graph Database Configuration
VITE_NEO4J_URI=bolt://localhost:7687
VITE_NEO4J_USER=neo4j
VITE_NEO4J_PASSWORD=your_neo4j_password

# Python Backend Configuration
NEWS_API_KEY=your_news_api_key_here
LOG_LEVEL=INFO
DATABASE_PATH=news.db
"""
        try:
            with open(".env", "w") as f:
                f.write(env_content)
            print("✅ .env file created")
        except Exception as e:
            print(f"⚠️  Could not create .env file: {e}")
    else:
        print("✅ .env file already exists")
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your actual API keys")
    print("2. Run 'npm install' to install Node.js dependencies")
    print("3. Run 'npm run dev' to start the frontend")
    print("4. Run 'python main.py' to start the Python backend")
    print("5. Run 'npm run start:api' to start the Node.js API server")

if __name__ == "__main__":
    main()
