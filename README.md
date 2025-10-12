# V_Mach News Aggregation System

A comprehensive news aggregation system that fetches, processes, and stores news articles from various sources with a modern React frontend.

## Features

- **News Fetching**: Automated collection from NewsAPI
- **Content Processing**: Cleaning, validation, and enrichment
- **Web Scraping**: Playwright-based content extraction
- **Database Storage**: SQLite database for article storage
- **Quality Scoring**: Intelligent article quality assessment
- **Deduplication**: Advanced duplicate detection
- **Modern UI**: React-based frontend with Tailwind CSS
- **Career Guidance**: AI-powered career advice system

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone and setup Python dependencies:**
   ```bash
   python setup.py
   ```
   Or manually:
   ```bash
   pip install -r requirements.txt
   playwright install
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your API keys:
     - `VITE_NEWS_API_KEY`: Your NewsAPI key
     - `VITE_OPENAI_API_KEY`: Your OpenAI API key (for career guidance)
     - Other keys as needed

### Running the System

1. **Start the Python backend:**
   ```bash
   python main.py
   ```

2. **Start the Node.js API server:**
   ```bash
   npm run start:api
   ```

3. **Start the React frontend:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - API Server: http://localhost:3001

## Project Structure

```
V_mach-main/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── store/             # State management
├── main.py                # Python backend entry point
├── config.py              # Configuration
├── database.py            # Database operations
├── news_api_client.py     # NewsAPI client
├── processor.py           # Article processing
├── scraper.py             # Web scraping
├── server.js              # Node.js API server
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── setup.py              # Setup script
```

## Configuration

### Python Backend
Edit `config.py` to customize:
- News categories
- API endpoints
- Processing parameters
- Database settings

### Frontend
Environment variables in `.env`:
- `VITE_NEWS_API_KEY`: NewsAPI key
- `VITE_OPENAI_API_KEY`: OpenAI API key
- `PORT`: Server port (default: 3001)

## API Endpoints

- `GET /api/news/:category` - Fetch news by category
- `POST /api/users/:id/profile` - Save user profile
- `POST /api/chat` - Career guidance chat
- `POST /api/ingest` - Knowledge ingestion

## Database

The system uses SQLite for storage. Database is automatically created on first run.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3001 and 5173 are available
2. **API keys**: Make sure all required API keys are set in `.env`
3. **Dependencies**: Run `python setup.py` and `npm install`
4. **Playwright**: Run `playwright install` if scraping fails

### Error Handling

The system includes comprehensive error handling:
- Network errors
- API rate limits
- Database connection issues
- Missing dependencies

## Development

### Adding New Features

1. **Backend**: Add new modules in Python
2. **Frontend**: Add components in `src/components/`
3. **API**: Add endpoints in `server.js`

### Testing

```bash
# Test Python backend
python -m pytest

# Test React components
npm test
```

## Deployment

### Production Setup

1. Set environment variables
2. Build frontend: `npm run build`
3. Run backend: `python main.py`
4. Run API server: `npm run start:api`

### Deploy (Render)
A `render.yaml` is included. Create a new Web Service on Render and set `VITE_NEWS_API_KEY` in environment variables. Build command: `npm install && npm run build`. Publish directory: `dist`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
