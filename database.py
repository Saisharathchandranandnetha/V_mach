"""
Database module for V_Mach News Aggregation System
Handles SQLite database operations for storing and retrieving articles
"""

import sqlite3
import logging
from typing import List, Dict, Optional
from datetime import datetime
import config

# Set up logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL), format=config.LOG_FORMAT)
logger = logging.getLogger(__name__)

class NewsDatabase:
    """Database handler for news articles"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or config.DATABASE_PATH
        self.connection = None
        
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
        
    def connect(self):
        """Connect to the database"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            self.connection.row_factory = sqlite3.Row  # Enable dict-like access
            logger.info(f"Connected to database: {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise
            
    def close(self):
        """Close the database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
            
    def init_db(self):
        """Initialize the database with required tables"""
        try:
            cursor = self.connection.cursor()
            
            # Create articles table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    url TEXT UNIQUE NOT NULL,
                    source TEXT,
                    image_url TEXT,
                    published_at TIMESTAMP,
                    processed_at TIMESTAMP,
                    collected_via TEXT,
                    category TEXT,
                    full_content TEXT,
                    word_count INTEGER,
                    quality_score REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_url ON articles(url)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON articles(category)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_published_at ON articles(published_at)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_quality_score ON articles(quality_score)')
            
            self.connection.commit()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise
            
    def store_article(self, article: Dict) -> bool:
        """
        Store an article in the database
        
        Args:
            article: Article dictionary to store
            
        Returns:
            True if stored successfully, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            
            # Check if article already exists
            if self.check_if_article_exists(article['url']):
                logger.debug(f"Article already exists: {article['title']}")
                return False
                
            # Prepare data for insertion
            data = {
                'title': article.get('title', ''),
                'description': article.get('description', ''),
                'url': article.get('url', ''),
                'source': article.get('source', 'Unknown'),
                'image_url': article.get('image_url'),
                'published_at': article.get('published_at'),
                'processed_at': article.get('processed_at'),
                'collected_via': article.get('collected_via', 'NewsAPI'),
                'category': article.get('category'),
                'full_content': article.get('full_content'),
                'word_count': article.get('word_count', 0),
                'quality_score': article.get('quality_score', 0.0)
            }
            
            # Insert the article
            cursor.execute('''
                INSERT INTO articles (
                    title, description, url, source, image_url, published_at,
                    processed_at, collected_via, category, full_content,
                    word_count, quality_score
                ) VALUES (
                    :title, :description, :url, :source, :image_url, :published_at,
                    :processed_at, :collected_via, :category, :full_content,
                    :word_count, :quality_score
                )
            ''', data)
            
            self.connection.commit()
            logger.debug(f"Stored article: {article['title']}")
            return True
            
        except sqlite3.IntegrityError as e:
            logger.warning(f"Integrity error storing article: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error storing article: {str(e)}")
            return False
            
    def check_if_article_exists(self, url: str) -> bool:
        """
        Check if an article with the given URL already exists
        
        Args:
            url: Article URL to check
            
        Returns:
            True if article exists, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT COUNT(*) FROM articles WHERE url = ?', (url,))
            count = cursor.fetchone()[0]
            return count > 0
        except Exception as e:
            logger.error(f"Error checking article existence: {str(e)}")
            return False
            
    def get_articles(self, category: str = None, limit: int = 100, offset: int = 0) -> List[Dict]:
        """
        Retrieve articles from the database
        
        Args:
            category: Filter by category (optional)
            limit: Maximum number of articles to return
            offset: Number of articles to skip
            
        Returns:
            List of article dictionaries
        """
        try:
            cursor = self.connection.cursor()
            
            if category:
                cursor.execute('''
                    SELECT * FROM articles 
                    WHERE category = ? 
                    ORDER BY published_at DESC, quality_score DESC
                    LIMIT ? OFFSET ?
                ''', (category, limit, offset))
            else:
                cursor.execute('''
                    SELECT * FROM articles 
                    ORDER BY published_at DESC, quality_score DESC
                    LIMIT ? OFFSET ?
                ''', (limit, offset))
                
            rows = cursor.fetchall()
            articles = []
            
            for row in rows:
                article = dict(row)
                # Convert timestamp strings back to datetime objects
                for field in ['published_at', 'processed_at', 'created_at']:
                    if article.get(field):
                        try:
                            article[field] = datetime.fromisoformat(article[field])
                        except ValueError:
                            pass
                articles.append(article)
                
            logger.debug(f"Retrieved {len(articles)} articles")
            return articles
            
        except Exception as e:
            logger.error(f"Error retrieving articles: {str(e)}")
            return []
            
    def get_article_by_url(self, url: str) -> Optional[Dict]:
        """
        Get a specific article by URL
        
        Args:
            url: Article URL
            
        Returns:
            Article dictionary or None if not found
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT * FROM articles WHERE url = ?', (url,))
            row = cursor.fetchone()
            
            if row:
                article = dict(row)
                # Convert timestamp strings back to datetime objects
                for field in ['published_at', 'processed_at', 'created_at']:
                    if article.get(field):
                        try:
                            article[field] = datetime.fromisoformat(article[field])
                        except ValueError:
                            pass
                return article
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving article by URL: {str(e)}")
            return None
            
    def get_article_count(self, category: str = None) -> int:
        """
        Get the total number of articles in the database
        
        Args:
            category: Filter by category (optional)
            
        Returns:
            Number of articles
        """
        try:
            cursor = self.connection.cursor()
            
            if category:
                cursor.execute('SELECT COUNT(*) FROM articles WHERE category = ?', (category,))
            else:
                cursor.execute('SELECT COUNT(*) FROM articles')
                
            count = cursor.fetchone()[0]
            return count
            
        except Exception as e:
            logger.error(f"Error getting article count: {str(e)}")
            return 0
            
    def delete_old_articles(self, days_old: int = 30) -> int:
        """
        Delete articles older than specified days
        
        Args:
            days_old: Delete articles older than this many days
            
        Returns:
            Number of articles deleted
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                DELETE FROM articles 
                WHERE published_at < datetime('now', '-{} days')
            '''.format(days_old))
            
            deleted_count = cursor.rowcount
            self.connection.commit()
            
            logger.info(f"Deleted {deleted_count} old articles")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error deleting old articles: {str(e)}")
            return 0
            
    def get_statistics(self) -> Dict:
        """
        Get database statistics
        
        Returns:
            Dictionary with statistics
        """
        try:
            cursor = self.connection.cursor()
            
            # Total articles
            cursor.execute('SELECT COUNT(*) FROM articles')
            total_articles = cursor.fetchone()[0]
            
            # Articles by category
            cursor.execute('''
                SELECT category, COUNT(*) as count 
                FROM articles 
                GROUP BY category 
                ORDER BY count DESC
            ''')
            category_stats = dict(cursor.fetchall())
            
            # Average quality score
            cursor.execute('SELECT AVG(quality_score) FROM articles')
            avg_quality = cursor.fetchone()[0] or 0.0
            
            # Articles by collection method
            cursor.execute('''
                SELECT collected_via, COUNT(*) as count 
                FROM articles 
                GROUP BY collected_via
            ''')
            collection_stats = dict(cursor.fetchall())
            
            return {
                'total_articles': total_articles,
                'category_stats': category_stats,
                'average_quality_score': round(avg_quality, 2),
                'collection_stats': collection_stats
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {}


def init_db():
    """Initialize the database"""
    with NewsDatabase() as db:
        db.init_db()


def store_articles(articles: List[Dict]) -> int:
    """
    Store multiple articles in the database
    
    Args:
        articles: List of article dictionaries
        
    Returns:
        Number of articles successfully stored
    """
    stored_count = 0
    
    with NewsDatabase() as db:
        for article in articles:
            if db.store_article(article):
                stored_count += 1
                
    logger.info(f"Stored {stored_count} new articles")
    return stored_count


if __name__ == "__main__":
    # Test the database
    init_db()
    
    # Test statistics
    with NewsDatabase() as db:
        stats = db.get_statistics()
        print("Database Statistics:")
        print(f"Total articles: {stats['total_articles']}")
        print(f"Average quality score: {stats['average_quality_score']}")
        print(f"Category stats: {stats['category_stats']}")
