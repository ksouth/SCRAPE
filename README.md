# SCRAPE

Early-stage scraper and semantic search API for NDIS/NDIA documents. **Not working end to end.** See `archive/README.md` for what was removed and why.

## What's here

- `config/sources.yaml`: sources to scrape, with CSS selectors.
- `scraper/`: base scraper class and a BeautifulSoup website scraper.
- `processor/`: text chunker and embedders.
- `scripts/run_scraper.py`: scrapes the configured sources into embedded Chroma at `./chroma_data`.
- `api/`: FastAPI search service over that collection (`POST /v1/search`).

## Known problems

- The scraper saves only the listing text for each item: no document URL and no document content. PDFs are not fetched.
- `LocalEmbedder` output is discarded; Chroma computes its own embeddings.
- The relevance score (`1 - distance/2`) overstates similarity.
- `requirements.txt` pins `sentence-transformers==2.2.2`, which fails with current `huggingface_hub`.
