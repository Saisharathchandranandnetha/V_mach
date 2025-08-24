"""
Main orchestrator for V_Mach News Aggregation System
Coordinates the entire workflow: fetch, process, and store articles
"""

import logging
import sys
from datetime import datetime
from typing import List, Dict

# Import our modules
import config
from news_api_client import create_news_api_client
from processor import process_articles
from database import init_db, store_articles, NewsDatabase

# Set up logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT,
    handlers=[
        logging.FileHandler('news_aggregator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class NewsAggregator:
    """Main orchestrator for the news aggregation system"""
    
    def __init__(self):
        self.api_client = None
        self.start_time = None
        self.stats = {
            'total_fetched': 0,
            'total_processed': 0,
            'total_stored': 0,
            'categories_processed': [],
            'errors': []
        }
        
    def run(self):
        """Run the complete news aggregation workflow"""
        try:
            self.start_time = datetime.now()
            logger.info("=" * 60)
            logger.info("Starting V_Mach News Aggregation System")
            logger.info(f"Start time: {self.start_time}")
            logger.info("=" * 60)
            
            # Step 1: Initialize database
            logger.info("Step 1: Initializing database...")
            init_db()
            
            # Step 2: Initialize API client
            logger.info("Step 2: Initializing NewsAPI client...")
            self.api_client = create_news_api_client()
            
            # Step 3: Fetch articles from all categories
            logger.info("Step 3: Fetching articles from NewsAPI...")
            api_articles = self._fetch_all_articles()
            
            if not api_articles:
                logger.warning("No articles fetched from NewsAPI")
                return
                
            # Step 4: Process and enrich articles
            logger.info("Step 4: Processing and enriching articles...")
            processed_articles = self._process_articles(api_articles)
            
            if not processed_articles:
                logger.warning("No articles processed successfully")
                return
                
            # Step 5: Store articles in database
            logger.info("Step 5: Storing articles in database...")
            stored_count = self._store_articles(processed_articles)
            
            # Step 6: Generate final report
            logger.info("Step 6: Generating final report...")
            self._generate_report(stored_count)
            
        except KeyboardInterrupt:
            logger.info("Process interrupted by user")
        except Exception as e:
            logger.error(f"Unexpected error in main workflow: {str(e)}")
            self.stats['errors'].append(str(e))
        finally:
            self._cleanup()
            
    def _fetch_all_articles(self) -> List[Dict]:
        """
        Fetch articles from all configured categories
        
        Returns:
            List of articles from NewsAPI
        """
        try:
            all_articles = []
            
            for category in config.NEWS_CATEGORIES:
                logger.info(f"Fetching articles for category: {category}")
                
                try:
                    articles = self.api_client.fetch_news_from_api(
                        category=category,
                        page_size=50  # Reasonable page size
                    )
                    
                    logger.info(f"Fetched {len(articles)} articles for {category}")
                    all_articles.extend(articles)
                    self.stats['categories_processed'].append(category)
                    
                except Exception as e:
                    error_msg = f"Error fetching {category}: {str(e)}"
                    logger.error(error_msg)
                    self.stats['errors'].append(error_msg)
                    continue
                    
            self.stats['total_fetched'] = len(all_articles)
            logger.info(f"Total articles fetched: {len(all_articles)}")
            
            return all_articles
            
        except Exception as e:
            logger.error(f"Error in fetch_all_articles: {str(e)}")
            return []
            
    def _process_articles(self, api_articles: List[Dict]) -> List[Dict]:
        """
        Process articles: clean, validate, enrich, and deduplicate
        
        Args:
            api_articles: Articles from NewsAPI
            
        Returns:
            Processed articles
        """
        try:
            logger.info(f"Processing {len(api_articles)} articles...")
            
            processed_articles = process_articles(api_articles)
            
            self.stats['total_processed'] = len(processed_articles)
            logger.info(f"Successfully processed {len(processed_articles)} articles")
            
            return processed_articles
            
        except Exception as e:
            logger.error(f"Error in process_articles: {str(e)}")
            return []
            
    def _store_articles(self, processed_articles: List[Dict]) -> int:
        """
        Store processed articles in the database
        
        Args:
            processed_articles: Processed articles to store
            
        Returns:
            Number of articles successfully stored
        """
        try:
            logger.info(f"Storing {len(processed_articles)} articles...")
            
            stored_count = store_articles(processed_articles)
            
            self.stats['total_stored'] = stored_count
            logger.info(f"Successfully stored {stored_count} new articles")
            
            return stored_count
            
        except Exception as e:
            logger.error(f"Error in store_articles: {str(e)}")
            return 0
            
    def _generate_report(self, stored_count: int):
        """Generate and log the final report"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        logger.info("=" * 60)
        logger.info("V_Mach News Aggregation - Final Report")
        logger.info("=" * 60)
        logger.info(f"Duration: {duration}")
        logger.info(f"Categories processed: {', '.join(self.stats['categories_processed'])}")
        logger.info(f"Articles fetched from API: {self.stats['total_fetched']}")
        logger.info(f"Articles processed: {self.stats['total_processed']}")
        logger.info(f"New articles stored: {stored_count}")
        
        # Get database statistics
        try:
            with NewsDatabase() as db:
                stats = db.get_statistics()
                logger.info(f"Total articles in database: {stats['total_articles']}")
                logger.info(f"Average quality score: {stats['average_quality_score']}")
                logger.info(f"Category distribution: {stats['category_stats']}")
        except Exception as e:
            logger.error(f"Error getting database statistics: {str(e)}")
            
        if self.stats['errors']:
            logger.warning(f"Errors encountered: {len(self.stats['errors'])}")
            for error in self.stats['errors']:
                logger.warning(f"  - {error}")
                
        logger.info("=" * 60)
        logger.info("News aggregation completed successfully!")
        logger.info("=" * 60)
        
    def _cleanup(self):
        """Cleanup resources"""
        try:
            if self.api_client:
                # API client doesn't need explicit cleanup
                pass
            logger.info("Cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")


def main():
    """Main entry point"""
    try:
        # Create and run the aggregator
        aggregator = NewsAggregator()
        aggregator.run()
        
    except Exception as e:
        logger.error(f"Fatal error in main: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
