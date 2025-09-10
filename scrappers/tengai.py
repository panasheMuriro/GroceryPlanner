from bs4 import BeautifulSoup
import requests
import json

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}

# Categories and their page ranges
categories = {
    "dry-groceries": 7,
    "butchery": 2,
    "drinks": 3,
    "fruit-veg": 2,
    "health-beauty": 3
}

products = []

for category, max_pages in categories.items():
    for page in range(1, max_pages + 1):
        url = f"https://tengaionline.com/?product_cat={category}&paged={page}&per_page=24"
        print(f"Scraping: {url}")

        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Failed to fetch {url}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")

        # Each product wrapper contains top (image) and bottom (title, price)
        for product in soup.select(".product-wrapper"):
            # Image
            img_tag = product.select_one(".product-element-top > .product-image-link > img")
            img = img_tag["src"] if img_tag and img_tag.has_attr("src") else None

            # Title
            title_tag = product.select_one(".product-element-bottom .wd-entities-title a")
            title = title_tag.get_text(strip=True) if title_tag else None

            # Price
            price_tag = product.select_one(".product-element-bottom .wrap-price")
            price = price_tag.get_text(strip=True) if price_tag else None

            products.append({
                "category": category,
                "title": title,
                "image": img,
                "price": price
            })

# Save results to a JSON file
with open("results.json", "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"✅ Scraping complete! {len(products)} products saved to results.json")
