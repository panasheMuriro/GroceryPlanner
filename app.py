# spar
"""

using playwright

visit https://www.spar.co.zw/products/department/1/groceries

get all products on the page

get image =  ul > li > .listing-image
get title = ul > li > .listing-details 
get price = ul > li > .product-links the first div inside


put them into a json file called spar.json
"""
import asyncio
import json
import re
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # change to False to watch
        page = await browser.new_page()
        await page.goto("https://www.spar.co.zw/products/department/1/groceries", timeout=60000)

        products = []

        # Select all products
        items = page.locator(".product-listing > ul > li")
        count = await items.count()
        
        print(f"Found {count} products")

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

            products.append({
                "title": title,
                "image": img,
                "price": price
            })

        # Save to spar.json
        with open("spar.json", "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)

        print(f"✅ Scraped {len(products)} products into spar.json")

        await browser.close()

asyncio.run(run())
