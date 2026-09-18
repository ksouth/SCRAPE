# SCRAPE: Data-Driven Document Search Platform

A complete starter template for building an auto-generated, searchable document database using web scraping, RAG (Retrieval Augmented Generation), and static site generation. Similar to [ndiaaccountability.org](https://ndiaaccountability.org/).

## Architecture

```
Data Sources (websites, PDFs, APIs)
         ↓
   Scraper (fetch documents)
         ↓
   Processor (OCR, chunking, embedding)
         ↓
   Vector Database (indexing)
         ↓
   FastAPI Backend (search API)
         ↓
   Astro Frontend (UI)
         ↓
   Static Site (deployed)
```

## Project Structure

```
SCRAPE/
├── scraper/              # Data collection & parsing
│   ├── base_scraper.py   # Abstract scraper class
│   ├── website_scraper.py # HTML page scraper
│   ├── pdf_scraper.py    # PDF download & processing
│   └── schedulers.py     # Cron job setup
├── processor/            # Document processing pipeline
│   ├── ocr.py            # OCR processing (Tesseract)
│   ├── chunker.py        # Split documents into segments
│   ├── embedder.py       # Generate embeddings
│   └── metadata.py       # Extract metadata
├── api/                  # FastAPI backend
│   ├── main.py          # FastAPI app
│   ├── models.py        # Request/response schemas
│   ├── search.py        # Search logic
│   ├── documents.py     # Document endpoints
│   └── database.py      # Vector DB connection
├── frontend/            # Astro static site (starter)
│   ├── src/pages/
│   ├── src/components/
│   ├── astro.config.mjs
│   └── package.json
├── config/
│   ├── settings.yaml    # Configuration
│   └── sources.yaml     # Data sources to scrape
├── scripts/
│   ├── setup.sh        # Initial setup
│   ├── run_scraper.py  # Run scraper manually
│   └── sync_data.py    # Sync with remote DB
├── .github/workflows/
│   ├── scrape.yml      # Daily scraping workflow
│   └── deploy.yml      # Deploy frontend
├── Dockerfile          # API container
├── docker-compose.yml  # Local dev stack
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
└── README.md          # This file
```

## Quick Start

### 1. Clone & Setup

```bash
# Create your project
git clone <repo> SCRAPE
cd SCRAPE

# Copy environment file
cp .env.example .env

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Install Node dependencies (for frontend)
cd frontend
npm install
cd ..
```

### 2. Configure Data Sources

Edit `config/sources.yaml` to specify what to scrape:

```yaml
sources:
  - name: "Government Website"
    type: "website"
    url: "https://example.gov.au"
    selectors:
      document: ".document"
      title: "h1"
      content: ".content"
    schedule: "0 0 * * *"  # Daily at midnight
    
  - name: "PDF Repository"
    type: "pdf"
    url: "https://example.com/documents"
    pattern: "*.pdf"
    schedule: "0 2 * * *"  # Daily at 2am
```

### 3. Start Vector Database (Docker)

```bash
docker-compose up -d chroma
```

This starts a local Chroma instance for development.

### 4. Run Scraper

```bash
python scripts/run_scraper.py
```

This will:
- Fetch documents from configured sources
- Process documents (OCR, chunking)
- Generate embeddings
- Store in vector database

### 5. Start API Server

```bash
cd api
python -m uvicorn main:app --reload
```

API will be available at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend at `http://localhost:3000`

## Environment Variables

See `.env.example` for all options:

```env
# Vector Database
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Embeddings
EMBEDDING_MODEL=all-MiniLM-L6-v2
USE_OPENAI_EMBEDDINGS=false
OPENAI_API_KEY=

# API
API_HOST=localhost
API_PORT=8000
DEBUG=true

# Frontend
FRONTEND_API_URL=http://localhost:8000
```

## Key Components

### Scraper (`scraper/`)
- **BaseScraper**: Abstract class for custom scrapers
- **WebsiteScraper**: HTML parsing with BeautifulSoup
- **PDFScraper**: PDF extraction with PyPDF2 + Tesseract
- **Schedulers**: Cron integration for automation

Example:
```python
from scraper.website_scraper import WebsiteScraper

scraper = WebsiteScraper(
    url="https://example.com",
    selectors={"content": ".article-body"}
)
documents = scraper.scrape()
```

### Processor (`processor/`)
- **OCRProcessor**: Tesseract OCR for scanned docs
- **Chunker**: Split documents into semantic chunks
- **Embedder**: Generate embeddings (local or OpenAI)
- **MetadataExtractor**: Extract title, date, author, etc.

Example:
```python
from processor.chunker import SemanticChunker
from processor.embedder import LocalEmbedder

chunker = SemanticChunker(chunk_size=512)
embedder = LocalEmbedder("all-MiniLM-L6-v2")

chunks = chunker.chunk(document_text)
embeddings = embedder.embed(chunks)
```

### API (`api/`)
- **FastAPI** server
- **POST /v1/search** - Search documents
- **GET /v1/documents/{id}** - Get single document
- **GET /v1/info** - API info

Example search:
```bash
curl -X POST http://localhost:8000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "disability support",
    "n_results": 10,
    "source_types": ["pdf"]
  }'
```

### Frontend (`frontend/`)
- **Astro** static site generator
- **React** components for interactivity
- **Client-side search** queries the API
- **Responsive design** for mobile/desktop

## Development Workflow

### Adding a New Data Source

1. Edit `config/sources.yaml`
2. Create custom scraper in `scraper/` if needed
3. Test: `python scripts/run_scraper.py --source-name "Your Source"`
4. Commit and push—GitHub Actions runs daily scrapes

### Customizing the Frontend

```bash
cd frontend
# Edit src/pages/index.astro
# Edit src/components/SearchBox.jsx
npm run build  # Generate static site
```

### Deploying

**Frontend**: Deploy `frontend/dist/` to:
- Vercel, Netlify, GitHub Pages
- Traditional web hosting
- Your own server

**API**: Deploy `api/` to:
- Fly.io (recommended, free tier)
- Railway, Heroku, AWS, DigitalOcean
- Docker: `docker build -t scrape-api . && docker run -p 8000:8000 scrape-api`

## Data Processing Pipeline

```
Raw Document
    ↓
[1] Fetch (Scraper)
    - Download from web/API
    - Parse structure
    ↓
[2] OCR (Processor)
    - If PDF/image: Tesseract OCR
    - Extract text
    ↓
[3] Clean
    - Remove formatting
    - Normalize whitespace
    ↓
[4] Chunk
    - Split into ~512 token segments
    - Preserve context
    ↓
[5] Embed
    - Generate embeddings (~384 dims)
    - Local model or OpenAI
    ↓
[6] Index
    - Store in Chroma/Weaviate
    - Add metadata
    ↓
[7] Search
    - Semantic search via vector similarity
    - Return source docs
    ↓
Frontend Display
```

## Performance Tips

1. **Chunking**: Use semantic chunking (keeps related text together)
2. **Embeddings**: Local models are free (all-MiniLM), cloud models are accurate (OpenAI)
3. **Caching**: Store embeddings so you only embed once
4. **Pagination**: Return limited results, paginate in frontend
5. **Indexing**: Update incrementally—only process new/changed docs

## Cost Breakdown (Monthly)

| Component | Free | Paid |
|-----------|------|------|
| Vector DB (Chroma) | Self-hosted | $0-50 |
| Embeddings | Local (free) | $0-50 (OpenAI) |
| API Hosting (Fly.io) | Free tier | $5-20 |
| Frontend Hosting | Vercel/Netlify | Free-$20 |
| **Total** | **$0** | **$0-100** |

## Troubleshooting

### Chroma connection fails
```bash
docker-compose logs chroma
docker-compose down && docker-compose up -d chroma
```

### Scraper timeout
Increase timeout in `config/settings.yaml`:
```yaml
scraper:
  timeout: 30  # seconds
```

### Low search quality
- Try different embedding model
- Adjust chunk size (256-1024)
- Ensure metadata is extracted
- Check query is specific enough

## Resources

- [Astro Docs](https://docs.astro.build)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Chroma Docs](https://docs.trychroma.com)
- [BeautifulSoup Docs](https://www.crummy.com/software/BeautifulSoup/)
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)

## Next Steps

1. **Customize scrapers** for your target sites
2. **Configure embeddings** (local vs OpenAI)
3. **Deploy locally** with docker-compose
4. **Test search** with sample data
5. **Deploy to production** (Fly.io + Vercel)
6. **Set up CI/CD** for automated scraping
7. **Add custom frontend** components

## License

MIT

## Contributing

Pull requests welcome! Areas to help:
- Add new scraper types
- Improve chunking strategies
- Optimize embeddings
- Frontend components
- Documentation

---

**Questions?** Check the GitHub issues or reach out.
