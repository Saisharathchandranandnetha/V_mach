"""
NewsAPI Client for V_Mach News Aggregation System
Handles fetching news articles from NewsAPI with error handling
"""

import requests
import logging
from typing import List, Dict, Optional
from datetime import datetime
import config

# Set up logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL), format=config.LOG_FORMAT)
logger = logging.getLogger(__name__)

class NewsAPIClient:
    """Client for interacting with NewsAPI"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = config.NEWS_API_BASE_URL
        self.endpoint = config.NEWS_API_ENDPOINT
        
    def fetch_news_from_api(self, category: str = None, country: str = 'us', page_size: int = 100) -> List[Dict]:
        """
        Fetch news articles from NewsAPI
        
        Args:
            category: News category (e.g., 'technology', 'science')
            country: Country code for news (default: 'us')
            page_size: Number of articles to fetch (max 100)
            
        Returns:
            List of article dictionaries with standardized format
        """
        try:
            # Prepare request parameters
            params = {
                'apiKey': self.api_key,
                'country': country,
                'pageSize': min(page_size, 100)  # NewsAPI max is 100
            }
            
            if category:
                params['category'] = category
                
            url = f"{self.base_url}{self.endpoint}"
            
            logger.info(f"Fetching news from NewsAPI for category: {category or 'general'}")
            
            # Make the API request
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'ok':
                logger.error(f"NewsAPI returned error: {data.get('message', 'Unknown error')}")
                return []
                
            articles = data.get('articles', [])
            logger.info(f"Successfully fetched {len(articles)} articles from NewsAPI")
            
            # Transform articles to standardized format
            processed_articles = []
            for article in articles:
                processed_article = self._process_article(article, category)
                if processed_article:
                    processed_articles.append(processed_article)
                    
            logger.info(f"Processed {len(processed_articles)} valid articles")
            return processed_articles
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching news: {str(e)}")
            return []
    
    def _process_article(self, article: Dict, category: str = None) -> Optional[Dict]:
        """
        Process a raw article from NewsAPI into standardized format
        
        Args:
            article: Raw article dictionary from NewsAPI
            category: Category of the article
            
        Returns:
            Processed article dictionary or None if invalid
        """
        try:
            # Extract basic information
            title = article.get('title', '').strip()
            description = article.get('description', '').strip()
            url = article.get('url', '').strip()
            
            # Skip articles without essential data
            if not title or not url:
                logger.debug(f"Skipping article with missing title or URL: {title[:50]}...")
                return None
                
            # Extract source information
            source = article.get('source', {})
            source_name = source.get('name', 'Unknown') if source else 'Unknown'
            
            # Extract image URL
            image_url = None
            if article.get('urlToImage'):
                image_url = article['urlToImage'].strip()
                
            # Parse published date
            published_at = None
            if article.get('publishedAt'):
                try:
                    published_at = datetime.fromisoformat(article['publishedAt'].replace('Z', '+00:00'))
                except ValueError:
                    logger.warning(f"Could not parse date: {article['publishedAt']}")
                    
            # Create standardized article format
            processed_article = {
                'title': title,
                'description': description,
                'url': url,
                'source': source_name,
                'published_at': published_at,
                'image_url': image_url,
                'collected_via': 'NewsAPI',
                'category': category,
                'raw_data': article  # Keep original data for reference
            }
            
            return processed_article
            
        except Exception as e:
            logger.error(f"Error processing article: {str(e)}")
            return None
    
    def fetch_all_categories(self) -> List[Dict]:
        """
        Fetch news from all configured categories
        
        Returns:
            List of all articles from all categories
        """
        all_articles = []
        
        for category in config.NEWS_CATEGORIES:
            logger.info(f"Fetching articles for category: {category}")
            articles = self.fetch_news_from_api(category=category)
            all_articles.extend(articles)
            
        logger.info(f"Total articles fetched from all categories: {len(all_articles)}")
        return all_articles


def create_news_api_client() -> NewsAPIClient:
    """
    Factory function to create a NewsAPI client with API key
    
    Returns:
        Configured NewsAPIClient instance
    """
    api_key = config.get_news_api_key()
    return NewsAPIClient(api_key)


if __name__ == "__main__":
    # Test the client
    client = create_news_api_client()
    articles = client.fetch_news_from_api(category='technology', page_size=10)
    print(f"Fetched {len(articles)} technology articles")
    for article in articles[:3]:
        print(f"- {article['title']}")
