import os, json, time, concurrent.futures, re
from pathlib import Path
from huggingface_hub import InferenceClient

API_KEY = os.environ.get("HF_API_KEY", "")
if not API_KEY:
    raise ValueError("Set HF_API_KEY env var")
MODEL = "black-forest-labs/FLUX.1-schnell"
PROVIDER = "nscale"
OUTPUT_DIR = Path("public/images/articles")
MAX_WORKERS = 4
DATA_DIR = Path("public/data")

client = InferenceClient(provider=PROVIDER, api_key=API_KEY)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def make_prompt(title, excerpt, category):
    topic = category or "gaming"
    short = (excerpt or title)[:200]
    return f"High-quality game art, {topic} theme: {short}. Detailed environment, vibrant colors, professional lighting, 4k quality, digital art, no text, no watermark"

def slug_to_filename(slug, idx):
    safe = re.sub(r'[^a-z0-9-]', '', slug.lower())[:60]
    return f"{idx:04d}-{safe}.jpg"

def process_article(article, idx, total):
    slug = article.get("slug", f"article-{idx}")
    filename = slug_to_filename(slug, idx)
    out_path = OUTPUT_DIR / filename
    if out_path.exists():
        print(f"[{idx}/{total}] SKIP (exists): {article['title'][:50]}...")
        article["featuredImage"] = f"/images/articles/{filename}"
        return article

    prompt = make_prompt(article.get("title", ""), article.get("excerpt", ""), article.get("categoryName", ""))
    try:
        image = client.text_to_image(prompt, model=MODEL)
        image = image.resize((1200, 675))
        image.save(out_path, quality=85)
        article["featuredImage"] = f"/images/articles/{filename}"
        print(f"[{idx}/{total}] OK: {article['title'][:50]}... ({out_path.name})")
    except Exception as e:
        print(f"[{idx}/{total}] FAIL: {article['title'][:50]}... {e}")
        article["featuredImage"] = article.get("featuredImage", "")
    return article

def main():
    files = sorted(DATA_DIR.glob("articles-*.json"))
    all_articles = []
    for f in files:
        with open(f) as fh:
            data = json.load(fh)
            all_articles.extend((f, a) for a in data)

    total = len(all_articles)
    print(f"Total articles: {total}")
    start = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {}
        for idx, (filepath, article) in enumerate(all_articles, 1):
            future = executor.submit(process_article, article, idx, total)
            futures[future] = (filepath, article)

        for future in concurrent.futures.as_completed(futures):
            filepath, _ = futures[future]
            try:
                future.result()
            except Exception as e:
                print(f"Error: {e}")

    # Group updated articles back by file and save
    file_groups = {}
    for filepath, article in all_articles:
        file_groups.setdefault(filepath, []).append(article)

    for filepath, articles in file_groups.items():
        with open(filepath, "w") as fh:
            json.dump(articles, fh, indent=2, ensure_ascii=False)
        print(f"Saved: {filepath.name} ({len(articles)} articles)")

    elapsed = time.time() - start
    print(f"\nDone! {total} articles in {elapsed:.1f}s ({elapsed/total:.1f}s per article)")

if __name__ == "__main__":
    main()
