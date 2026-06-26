import os, json, time, re, requests, concurrent.futures
from pathlib import Path
from PIL import Image
from io import BytesIO

CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "580b5cb60a803c5aab8d003b05850e12")
if not CF_API_TOKEN:
    raise ValueError("Set CF_API_TOKEN env var")

MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0"
API_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/{MODEL}"
HEADERS = {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}

OUTPUT_DIR = Path("public/images/articles")
DATA_DIR = Path("public/data")
MAX_WORKERS = 4
RATE_LIMIT_DELAY = 0.5

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def make_prompt(title, excerpt, category):
    topic = (category or "gaming").lower().replace("-", " ")
    short = (excerpt or title)[:200]
    return f"High-quality game art, {topic} theme: {short}. Detailed environment, vibrant colors, professional lighting, digital art, no text, no watermark"

def slug_to_filename(slug, idx):
    safe = re.sub(r'[^a-z0-9-]', '', slug.lower())[:60]
    return f"{idx:04d}-{safe}.jpg"

def generate_image(prompt):
    body = {"prompt": prompt, "width": 1024, "height": 576}
    r = requests.post(API_URL, json=body, headers=HEADERS, timeout=180)
    r.raise_for_status()
    return r.content

def process_article(article, idx, total):
    slug = article.get("slug", f"article-{idx}")
    filename = slug_to_filename(slug, idx)
    out_path = OUTPUT_DIR / filename
    if out_path.exists():
        article["featuredImage"] = f"/images/articles/{filename}"
        return None

    prompt = make_prompt(article.get("title", ""), article.get("excerpt", ""), article.get("categoryName", ""))
    try:
        img_data = generate_image(prompt)
        img = Image.open(BytesIO(img_data))
        img = img.resize((1200, 675), Image.LANCZOS)
        img.save(out_path, quality=85)
        article["featuredImage"] = f"/images/articles/{filename}"
        print(f"[{idx}/{total}] OK: {article['title'][:50]}... ({out_path.name})")
    except Exception as e:
        print(f"[{idx}/{total}] FAIL: {article['title'][:50]}... {e}")
        article["featuredImage"] = article.get("featuredImage", "")
    time.sleep(RATE_LIMIT_DELAY)
    return article

def main():
    files = sorted(DATA_DIR.glob("articles-*.json"))
    all_articles = []
    for f in files:
        with open(f) as fh:
            data = json.load(fh)
            all_articles.extend((f, a) for a in data)

    total = len(all_articles)
    existing_images = len(list(OUTPUT_DIR.glob("*.jpg")))
    print(f"Total: {total}, Existing images: {existing_images}, To generate: {total - existing_images}")
    start = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {}
        for idx, (filepath, article) in enumerate(all_articles, 1):
            filename = slug_to_filename(article.get("slug", f"article-{idx}"), idx)
            if (OUTPUT_DIR / filename).exists():
                article["featuredImage"] = f"/images/articles/{filename}"
                continue
            future = executor.submit(process_article, article, idx, total)
            futures[future] = (filepath, article)

        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error: {e}")

    file_groups = {}
    for filepath, article in all_articles:
        file_groups.setdefault(filepath, []).append(article)

    for filepath, articles in file_groups.items():
        with open(filepath, "w") as fh:
            json.dump(articles, fh, indent=2, ensure_ascii=False)

    elapsed = time.time() - start
    final_count = len(list(OUTPUT_DIR.glob("*.jpg")))
    gen_count = final_count - existing_images
    print(f"\nDone! Generated {gen_count} new images, total: {final_count}, in {elapsed:.1f}s ({elapsed/max(gen_count,1):.1f}s/img)")

if __name__ == "__main__":
    main()
