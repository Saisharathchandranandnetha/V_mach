"""
Data Processor for V_Mach News Aggregation System
Handles cleaning, validation, and deduplication of articles
"""

import hashlib
import logging
from typing import List, Dict, Optional, Set
from datetime import datetime
import re
import config
from scraper import scrape_article

# Set up logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL), format=config.LOG_FORMAT)
logger = logging.getLogger(__name__)

class ArticleProcessor:
    """Processor for cleaning, validating, and deduplicating articles"""
    
    def __init__(self):
        self.seen_hashes: Set[str] = set()
        self.processed_count = 0
        self.scraped_count = 0
        
    def process_articles(self, api_articles: List[Dict]) -> List[Dict]:
        """
        Process articles from NewsAPI, enrich with scraping, and deduplicate
        
        Args:
            api_articles: List of articles from NewsAPI
            
        Returns:
            List of processed, enriched, and deduplicated articles
        """
        logger.info(f"Processing {len(api_articles)} articles from NewsAPI")
        
        processed_articles = []
        self.seen_hashes.clear()
        
        for article in api_articles:
            try:
                processed_article = self._process_single_article(article)
                if processed_article:
                    processed_articles.append(processed_article)
                    self.processed_count += 1
            except Exception as e:
                logger.error(f"Error processing article '{article.get('title', 'Unknown')}': {str(e)}")
                continue
                
        logger.info(f"Successfully processed {len(processed_articles)} articles")
        logger.info(f"Scraped {self.scraped_count} articles for enrichment")
        
        return processed_articles
        
    def _process_single_article(self, article: Dict) -> Optional[Dict]:
        """
        Process a single article: clean, validate, enrich, and deduplicate
        
        Args:
            article: Raw article dictionary
            
        Returns:
            Processed article dictionary or None if invalid/duplicate
        """
        # Basic validation
        if not self._is_valid_article(article):
            logger.debug(f"Skipping invalid article: {article.get('title', 'Unknown')}")
            return None
            
        # Clean the article data
        cleaned_article = self._clean_article(article)
        
        # Check for duplicates
        article_hash = self._generate_article_hash(cleaned_article)
        if article_hash in self.seen_hashes:
            logger.debug(f"Skipping duplicate article: {cleaned_article['title']}")
            return None
            
        self.seen_hashes.add(article_hash)
        
        # Enrich with scraping if needed
        enriched_article = self._enrich_article(cleaned_article)
        
        # Add processing metadata
        final_article = self._add_metadata(enriched_article)
        
        return final_article
        
    def _is_valid_article(self, article: Dict) -> bool:
        """
        Check if an article has the minimum required fields
        
        Args:
            article: Article dictionary to validate
            
        Returns:
            True if article is valid
        """
        required_fields = ['title', 'url']
        
        for field in required_fields:
            if not article.get(field):
                return False
                
        # Check if title is not too short
        title = article.get('title', '').strip()
        if len(title) < 10:
            return False
            
        # Check if URL is valid
        url = article.get('url', '').strip()
        if not url.startswith(('http://', 'https://')):
            return False
            
        return True
        
    def _clean_article(self, article: Dict) -> Dict:
        """
        Clean and normalize article data
        
        Args:
            article: Raw article dictionary
            
        Returns:
            Cleaned article dictionary
        """
        cleaned = {}
        
        # Clean title
        title = article.get('title', '').strip()
        title = re.sub(r'\s+', ' ', title)  # Remove extra whitespace
        title = re.sub(r'[^\w\s\-.,!?()]', '', title)  # Remove special characters
        cleaned['title'] = title
        
        # Clean description
        description = article.get('description', '').strip()
        if description:
            description = re.sub(r'\s+', ' ', description)
            description = re.sub(r'[^\w\s\-.,!?()]', '', description)
            # Limit description length
            if len(description) > config.MAX_DESCRIPTION_LENGTH:
                description = description[:config.MAX_DESCRIPTION_LENGTH].rsplit(' ', 1)[0] + '...'
        cleaned['description'] = description
        
        # Clean URL
        cleaned['url'] = article.get('url', '').strip()
        
        # Clean source
        source = article.get('source', '').strip()
        if source:
            source = re.sub(r'\s+', ' ', source)
        cleaned['source'] = source or 'Unknown'
        
        # Clean image URL
        image_url = article.get('image_url', '').strip()
        if image_url and not image_url.startswith(('http://', 'https://')):
            image_url = None
        cleaned['image_url'] = image_url
        
        # Keep other fields
        cleaned['published_at'] = article.get('published_at')
        cleaned['collected_via'] = article.get('collected_via', 'NewsAPI')
        cleaned['category'] = article.get('category')
        
        return cleaned
        
    def _generate_article_hash(self, article: Dict) -> str:
        """
        Generate a unique hash for article deduplication
        
        Args:
            article: Article dictionary
            
        Returns:
            Hash string for deduplication
        """
        # Create a string from title and description for hashing
        title = article.get('title', '').lower()
        description = article.get('description', '').lower()
        
        # Use first part of description for hash
        description_part = description[:config.DEDUPLICATION_HASH_LENGTH]
        
        # Create hash string
        hash_string = f"{title}|{description_part}"
        
        # Generate SHA-256 hash
        return hashlib.sha256(hash_string.encode('utf-8')).hexdigest()
        
    def _enrich_article(self, article: Dict) -> Dict:
        """
        Enrich article with scraped data if needed
        
        Args:
            article: Article dictionary to enrich
            
        Returns:
            Enriched article dictionary
        """
        enriched = article.copy()
        
        # Check if we need to scrape for better description
        needs_scraping = (
            not article.get('description') or 
            len(article.get('description', '')) < config.MIN_DESCRIPTION_LENGTH or
            not article.get('image_url')
        )
        
        if needs_scraping:
            logger.info(f"Enriching article: {article['title']}")
            
            try:
                scraped_data = scrape_article(article['url'])
                
                if scraped_data:
                    self.scraped_count += 1
                    
                    # Use scraped content for description if needed
                    if not article.get('description') or len(article.get('description', '')) < config.MIN_DESCRIPTION_LENGTH:
                        full_content = scraped_data.get('full_content', '')
                        if full_content:
                            # Create a better description from scraped content
                            description = self._create_description_from_content(full_content)
                            if description:
                                enriched['description'] = description
                                enriched['full_content'] = full_content
                                
                    # Use scraped image if needed
                    if not article.get('image_url'):
                        scraped_image = scraped_data.get('image_url')
                        if scraped_image:
                            enriched['image_url'] = scraped_image
                            
            except Exception as e:
                logger.error(f"Error enriching article {article['title']}: {str(e)}")
                
        return enriched
        
    def _create_description_from_content(self, content: str) -> str:
        """
        Create a description from scraped content
        
        Args:
            content: Full scraped content
            
        Returns:
            Description string
        """
        if not content:
            return ""
            
        # Clean the content
        content = re.sub(r'\s+', ' ', content.strip())
        
        # Take the first few sentences
        sentences = re.split(r'[.!?]+', content)
        description = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Minimum sentence length
                description += sentence + ". "
                if len(description) >= config.MIN_DESCRIPTION_LENGTH:
                    break
                    
        # Limit to maximum length
        if len(description) > config.MAX_DESCRIPTION_LENGTH:
            description = description[:config.MAX_DESCRIPTION_LENGTH].rsplit(' ', 1)[0] + '...'
            
        return description.strip()
        
    def _add_metadata(self, article: Dict) -> Dict:
        """
        Add processing metadata to article
        
        Args:
            article: Article dictionary
            
        Returns:
            Article with metadata added
        """
        metadata = article.copy()
        
        # Add processing timestamp
        metadata['processed_at'] = datetime.now()
        
        # Add word count
        title_words = len(article.get('title', '').split())
        description_words = len(article.get('description', '').split())
        metadata['word_count'] = title_words + description_words
        
        # Add content quality score
        metadata['quality_score'] = self._calculate_quality_score(article)
        
        return metadata
        
    def _calculate_quality_score(self, article: Dict) -> float:
        """
        Calculate a quality score for the article
        
        Args:
            article: Article dictionary
            
        Returns:
            Quality score (0.0 to 1.0)
        """
        score = 0.0
        
        # Title quality
        title = article.get('title', '')
        if len(title) > 20:
            score += 0.2
        if len(title) > 50:
            score += 0.1
            
        # Description quality
        description = article.get('description', '')
        if description:
            score += 0.3
            if len(description) > 100:
                score += 0.2
                
        # Image quality
        if article.get('image_url'):
            score += 0.2
            
        # Source quality
        source = article.get('source', '').lower()
        trusted_sources = ['reuters', 'ap', 'bbc', 'cnn', 'techcrunch', 'wired', 'ars technica']
        if any(trusted in source for trusted in trusted_sources):
            score += 0.1
            
        # Content enrichment
        if article.get('full_content'):
            score += 0.1
            
        return min(score, 1.0)


def process_articles(api_articles: List[Dict]) -> List[Dict]:
    """
    Convenience function to process articles
    
    Args:
        api_articles: List of articles from NewsAPI
        
    Returns:
        List of processed articles
    """
    processor = ArticleProcessor()
    return processor.process_articles(api_articles)


if __name__ == "__main__":
    # Test the processor
    test_articles = [
        {
            'title': 'Test Article',
            'description': 'This is a test description',
            'url': 'https://example.com/test',
            'source': 'Test Source',
            'published_at': datetime.now(),
            'collected_via': 'NewsAPI'
        }
    ]
    
    processed = process_articles(test_articles)
    print(f"Processed {len(processed)} articles")
    for article in processed:
        print(f"- {article['title']} (Score: {article['quality_score']:.2f})")
