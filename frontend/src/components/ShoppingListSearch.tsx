import React, { useState } from "react";
import Fuse from "fuse.js";
import products from "../../../results.json";

type Product = {
  title: string;
  image: string;
  price: string; // format: "USD$0.46"
};

type ResultGroup = {
  query: string;
  options: Product[];
};

const ShoppingListSearch: React.FC = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ResultGroup[]>([]);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [selected, setSelected] = useState<{ [key: number]: Product }>({});
  const [total, setTotal] = useState<number>(0);

  const fuse = new Fuse(products, {
    keys: ["title"],
    threshold: 0.3,
  });

  const calculateTotal = (selection: { [key: number]: Product }) => {
    return Object.values(selection).reduce((sum, p) => {
      const numPrice = parseFloat(p.price.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(numPrice) ? 0 : numPrice);
    }, 0);
  };

  const handleSearch = () => {
    const items = input
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const allMatches: ResultGroup[] = [];
    const initialSelected: { [key: number]: Product } = {};

    items.forEach((item, idx) => {
      const results = fuse.search(item, { limit: 5 });
      if (results.length > 0) {
        const options = results.map((r) => r.item as Product);

        // 1️⃣ Exact word match anywhere in title
        let bestMatch = options.find((p) => {
          const titleWords = p.title.toLowerCase().split(/\s+/);
          return titleWords.includes(item.toLowerCase());
        });

        // 2️⃣ Starts with fallback
        if (!bestMatch) {
          bestMatch = options.find((p) =>
            p.title.toLowerCase().startsWith(item.toLowerCase())
          );
        }

        // 3️⃣ Fuse top result fallback
        if (!bestMatch) bestMatch = options[0];

        allMatches.push({ query: item, options });
        initialSelected[idx] = bestMatch!;
      }
    });

    setResults(allMatches);
    setSelected(initialSelected);
    setExpanded({});
    setTotal(calculateTotal(initialSelected));
  };

  const handleSelectAlternative = (groupIdx: number, product: Product) => {
    const newSelected = { ...selected, [groupIdx]: product };
    setSelected(newSelected);
    setTotal(calculateTotal(newSelected));
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 text-center flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#457b9d] to-[#1d3557] bg-clip-text text-transparent mb-12">
        🛒 Shopping List Planner
      </h1>

      <input
        type="text"
        placeholder="Enter items e.g. flour, margarine, salt"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full border-2 p-2 rounded-lg border-[#1d3557]"
      />

      <button
        onClick={handleSearch}
        className="bg-[#e63946] text-white px-12 py-3 rounded-full"
      >
        Search
      </button>

      {results.length > 0 && (
        <div className="space-y-4 w-full">
          <h3 className="text-lg font-semibold">Matches</h3>
          {results.map((group, idx) => {
            const selectedProduct = selected[idx];
            const others = group.options.filter(
              (p) => p.title !== selectedProduct.title
            );
            const isOpen = expanded[idx] || false;

            return (
              <div
                key={idx}
                className="shadow-sm p-3 rounded-lg text-left bg-white"
              >
                <p className="font-medium mb-2">Search: {group.query}</p>

                {/* Selected product */}
                <div className="flex items-center space-x-4 p-2 rounded-lg">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedProduct.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedProduct.price}
                    </p>
                  </div>
                </div>

                {/* Toggle button */}
                {others.length > 0 && (
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [idx]: !isOpen }))
                    }
                    className="mt-2 text-sm text-green-600 hover:underline"
                  >
                    {isOpen ? "Hide alternatives" : "See similar items"}
                  </button>
                )}

                {/* Alternative matches */}
                {isOpen && (
                  <ul className="mt-2 space-y-2">
                    {others.map((p, j) => (
                      <li
                        key={j}
                        className="flex items-center space-x-4 p-2 rounded-lg border cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectAlternative(idx, p)}
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-10 h-10 object-contain"
                        />
                        <div>
                          <p className="text-sm">{p.title}</p>
                          <p className="text-xs text-gray-600">{p.price}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="text-right font-bold text-xl text-green-800">
            Total: USD${total.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListSearch;
