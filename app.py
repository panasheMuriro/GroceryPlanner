# spar
"""

using playwright

visit https://www.spar.co.zw/products/department/1/groceries to
https://www.spar.co.zw/products/department/1/groceries?pg=62
get all products on the page

get image =  ul > li > .listing-image
get title = ul > li > .listing-details 
get price = ul > li > .product-links the first div inside

put them into a json file called spar.json

append the products from current page into spar.json like say e.g

 {
    "title": "CROSS N BLACKWELL TANGY MAYONNAISE 750G",
    "image": "https://cdn.spar.co.zw/data/99993453-Thumb.jpg",
    "price": "USD$2.85"
  },
  then when you reach pg=62, close the json array ]
  
"""
import asyncio
import json
import re
import os
from playwright.async_api import async_playwright

async def scrape_spar():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        json_file = "spar.json"
        first_page = True

        # Open file in write mode at first and start the array
        with open(json_file, "w", encoding="utf-8") as f:
            f.write("[\n")
            
        # skipped = [18]

        # Loop over pages 1 → 62
        for pg in range(18, 19):
            url = f"https://www.spar.co.zw/products/department/1/groceries?pg={pg}"
            print(f"Scraping page {pg} ...")
            await page.goto(url, timeout=300000)

            items = page.locator(".product-listing > ul > li")
            count = await items.count()
            print(f"Found {count} products on page {pg}")

            page_products = []

            for i in range(count):
                item = items.nth(i)

                # Image → background-image in .listing-image a
                img_tag = item.locator(".listing-image a")
                style = await img_tag.get_attribute("style")
                img = None
                if style and "background-image" in style:
                    match = re.search(r'url\(["\']?(.*?)["\']?\)', style)
                    if match:
                        img = match.group(1)

                # Title
                title_tag = item.locator(".listing-details")
                title = (await title_tag.inner_text()).strip() if await title_tag.count() > 0 else None

                # Price → first div inside .product-links
                price_tag = item.locator(".product-links div").first
                price = (await price_tag.inner_text()).strip() if await price_tag.count() > 0 else None

                page_products.append({
                    "title": title,
                    "image": img,
                    "price": price
                })

            # Append page products to JSON file
            with open(json_file, "a", encoding="utf-8") as f:
                for idx, product in enumerate(page_products):
                    json.dump(product, f, indent=2, ensure_ascii=False)
                    # Add comma if not the last product on last page
                    if pg != 62 or idx != len(page_products) - 1:
                        f.write(",\n")
                    else:
                        f.write("\n")

        # Close the JSON array
        with open(json_file, "a", encoding="utf-8") as f:
            f.write("]\n")

        print(f"✅ Scraped pages 1-62 into {json_file}")
        await browser.close()

asyncio.run(scrape_spar())
