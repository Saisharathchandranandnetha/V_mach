"""
Web Scraper for V_Mach News Aggregation System
Uses Playwright to scrape article content and images when NewsAPI data is incomplete
"""

import asyncio
import logging
from typing import Dict, Optional, Tuple
from playwright.async_api import async_playwright, Browser, Page
import config
from urllib.parse import urljoin, urlparse
import re

# Set up logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL), format=config.LOG_FORMAT)
logger = logging.getLogger(__name__)

class ArticleScraper:
    """Scraper for extracting article content and images using Playwright"""
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.timeout = config.SCRAPING_TIMEOUT * 1000  # Convert to milliseconds
        self.user_agent = config.USER_AGENT
        
    async def __aenter__(self):
        """Async context manager entry"""
        await self._init_browser()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self._close_browser()
        
    async def _init_browser(self):
        """Initialize the browser"""
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=config.SCRAPING_HEADLESS,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            )
            logger.info("Browser initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize browser: {str(e)}")
            raise
            
    async def _close_browser(self):
        """Close the browser and cleanup"""
        try:
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
            logger.info("Browser closed successfully")
        except Exception as e:
            logger.error(f"Error closing browser: {str(e)}")
            
    async def scrape_article(self, url: str) -> Optional[Dict]:
        """
        Scrape an article URL to extract content and images
        
        Args:
            url: The article URL to scrape
            
        Returns:
            Dictionary with 'full_content' and 'image_url' or None if failed
        """
        if not self.browser:
            logger.error("Browser not initialized")
            return None
            
        try:
            logger.info(f"Scraping article: {url}")
            
            # Create a new page
            page = await self.browser.new_page()
            page.set_default_timeout(self.timeout)
            
            # Set user agent
            await page.set_extra_http_headers({
                'User-Agent': self.user_agent
            })
            
            # Navigate to the URL
            await page.goto(url, wait_until='domcontentloaded')
            
            # Extract content and image
            content = await self._extract_content(page)
            image_url = await self._extract_image(page, url)
            
            await page.close()
            
            if content or image_url:
                result = {
                    'full_content': content,
                    'image_url': image_url
                }
                logger.info(f"Successfully scraped article: {len(content) if content else 0} chars, image: {bool(image_url)}")
                return result
            else:
                logger.warning(f"No content or image found for: {url}")
                return None
                
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return None
            
    async def _extract_content(self, page: Page) -> Optional[str]:
        """
        Extract the main article content from the page
        
        Args:
            page: Playwright page object
            
        Returns:
            Extracted text content or None
        """
        try:
            # Try different selectors to find the main content
            for selector in config.ARTICLE_SELECTORS:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        # Get text content
                        text = await element.inner_text()
                        if text and len(text.strip()) > 100:  # Minimum content length
                            # Clean the text
                            cleaned_text = self._clean_text(text)
                            if len(cleaned_text) > 100:
                                logger.debug(f"Found content using selector: {selector}")
                                return cleaned_text
                except Exception as e:
                    logger.debug(f"Selector {selector} failed: {str(e)}")
                    continue
                    
            # Fallback: try to get all text from the page
            try:
                body = await page.query_selector('body')
                if body:
                    text = await body.inner_text()
                    cleaned_text = self._clean_text(text)
                    if len(cleaned_text) > 200:
                        return cleaned_text[:2000]  # Limit length
            except Exception as e:
                logger.debug(f"Body text extraction failed: {str(e)}")
                
            return None
            
        except Exception as e:
            logger.error(f"Error extracting content: {str(e)}")
            return None
            
    async def _extract_image(self, page: Page, base_url: str) -> Optional[str]:
        """
        Extract the main image from the page
        
        Args:
            page: Playwright page object
            base_url: Base URL for resolving relative image URLs
            
        Returns:
            Image URL or None
        """
        try:
            # First try meta tags for social media images
            for selector in config.IMAGE_SELECTORS[:2]:  # og:image and twitter:image
                try:
                    element = await page.query_selector(selector)
                    if element:
                        image_url = await element.get_attribute('content')
                        if image_url and self._is_valid_image_url(image_url):
                            logger.debug(f"Found image using meta tag: {selector}")
                            return self._resolve_url(image_url, base_url)
                except Exception as e:
                    logger.debug(f"Meta image selector {selector} failed: {str(e)}")
                    continue
                    
            # Try to find the largest image on the page
            try:
                images = await page.query_selector_all('img')
                best_image = None
                max_area = 0
                
                for img in images:
                    try:
                        src = await img.get_attribute('src')
                        if not src or not self._is_valid_image_url(src):
                            continue
                            
                        # Get image dimensions
                        width = await img.get_attribute('width')
                        height = await img.get_attribute('height')
                        
                        if width and height:
                            area = int(width) * int(height)
                            if area > max_area:
                                max_area = area
                                best_image = src
                        else:
                            # If no dimensions, check if it's a reasonable size
                            if not best_image and 'article' in (await img.get_attribute('alt') or '').lower():
                                best_image = src
                                
                    except Exception as e:
                        logger.debug(f"Error processing image: {str(e)}")
                        continue
                        
                if best_image:
                    logger.debug(f"Found best image with area: {max_area}")
                    return self._resolve_url(best_image, base_url)
                    
            except Exception as e:
                logger.debug(f"Image extraction failed: {str(e)}")
                
            return None
            
        except Exception as e:
            logger.error(f"Error extracting image: {str(e)}")
            return None
            
    def _clean_text(self, text: str) -> str:
        """
        Clean and normalize extracted text
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
            
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common unwanted elements
        text = re.sub(r'Advertisement|Advertise|Subscribe|Newsletter|Sign up|Follow us', '', text, flags=re.IGNORECASE)
        
        # Remove multiple periods
        text = re.sub(r'\.{2,}', '.', text)
        
        # Remove multiple spaces
        text = re.sub(r' +', ' ', text)
        
        return text.strip()
        
    def _is_valid_image_url(self, url: str) -> bool:
        """
        Check if a URL is a valid image URL
        
        Args:
            url: URL to check
            
        Returns:
            True if valid image URL
        """
        if not url:
            return False
            
        # Check for common image extensions
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        url_lower = url.lower()
        
        return any(ext in url_lower for ext in image_extensions)
        
    def _resolve_url(self, url: str, base_url: str) -> str:
        """
        Resolve relative URLs to absolute URLs
        
        Args:
            url: URL to resolve
            base_url: Base URL for resolution
            
        Returns:
            Absolute URL
        """
        if not url:
            return ""
            
        # If already absolute, return as is
        if url.startswith(('http://', 'https://')):
            return url
            
        # Resolve relative URL
        return urljoin(base_url, url)


async def scrape_article_async(url: str) -> Optional[Dict]:
    """
    Convenience function to scrape a single article
    
    Args:
        url: Article URL to scrape
        
    Returns:
        Scraped data dictionary or None
    """
    async with ArticleScraper() as scraper:
        return await scraper.scrape_article(url)


def scrape_article(url: str) -> Optional[Dict]:
    """
    Synchronous wrapper for scraping articles
    
    Args:
        url: Article URL to scrape
        
    Returns:
        Scraped data dictionary or None
    """
    try:
        return asyncio.run(scrape_article_async(url))
    except Exception as e:
        logger.error(f"Error in synchronous scrape: {str(e)}")
        return None


if __name__ == "__main__":
    # Test the scraper
    test_url = "https://techcrunch.com/2024/01/15/ai-startup-funding/"
    result = scrape_article(test_url)
    if result:
        print(f"Content length: {len(result.get('full_content', ''))}")
        print(f"Image URL: {result.get('image_url', 'None')}")
    else:
        print("Scraping failed")
