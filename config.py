"""
Configuration file for V_Mach News Aggregation System
Handles API keys, settings, and configuration parameters
"""

import os
from typing import List

def get_news_api_key() -> str:
    """
    Get NewsAPI key from user input or environment variable
    Returns the API key as a string
    """
    # First try to get from environment variable
    api_key = os.getenv('NEWS_API_KEY')
    
    if not api_key:
        print("NewsAPI Key not found in environment variables.")
        print("Please enter your NewsAPI key:")
        api_key = input().strip()
        
        if not api_key:
            raise ValueError("NewsAPI key is required to proceed")
    
    return api_key

# News categories/sources to fetch
NEWS_CATEGORIES: List[str] = [
    'technology',
    'science',
    'business',
    'entertainment'
]

# NewsAPI configuration
NEWS_API_BASE_URL = "https://newsapi.org/v2"
NEWS_API_ENDPOINT = "/top-headlines"

# Scraping configuration
SCRAPING_TIMEOUT = 30  # seconds
SCRAPING_HEADLESS = True

# Database configuration
DATABASE_PATH = "news.db"

# Processing configuration
MIN_DESCRIPTION_LENGTH = 50
MAX_DESCRIPTION_LENGTH = 300
DEDUPLICATION_HASH_LENGTH = 100

# Logging configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# User-Agent for web scraping
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

# Common selectors for article content extraction
ARTICLE_SELECTORS = [
    'article',
    '[role="main"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '#main-content',
    '.content',
    'main'
]

# Image selectors for fallback image extraction
IMAGE_SELECTORS = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    '.article-image img',
    '.post-image img',
    '.entry-image img',
    'img[alt*="article"]',
    'img[alt*="post"]'
]
