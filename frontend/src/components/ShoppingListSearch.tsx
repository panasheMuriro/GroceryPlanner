import React, { useState } from "react";
import Fuse from "fuse.js";
import products from "../../../results.json"; // your products file

type Product = {
  title: string;
  image: string;
  price: string; // format: "USD$0.46"
};

const ShoppingListSearch: React.FC = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);

  const fuse = new Fuse(products, {
    keys: ["title"],
    threshold: 0.3, // lower = stricter matching
  });

  const handleSearch = () => {
    const items = input.split(",").map((i) => i.trim()).filter(Boolean);
    const matched: Product[] = [];
    let sum = 0;

    items.forEach((item) => {
      const result = fuse.search(item);
      if (result.length > 0) {
        const product = result[0].item as Product;
        matched.push(product);

        // parse price "USD$0.46" → 0.46
        const numPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));
        if (!isNaN(numPrice)) sum += numPrice;
      }
    });

    setResults(matched);
    setTotal(sum);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Shopping List Planner</h2>

      <input
        type="text"
        placeholder="Enter items e.g. flour, margarine, salt"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />

      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Search
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Matches</h3>
          <ul className="space-y-2">
            {results.map((p, idx) => (
              <li
                key={idx}
                className="flex items-center space-x-4 border p-2 rounded-lg"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-gray-600">{p.price}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold text-lg">
            Total: USD${total.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListSearch;
