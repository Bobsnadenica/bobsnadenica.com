'use client';

import { useState } from 'react';

// Hardcoded EKATTE codes for major Bulgarian cities
const CITIES = [
  { name: 'София (Sofia)', ekatte: '68134' },
  { name: 'Пловдив (Plovdiv)', ekatte: '56784' },
  { name: 'Варна (Varna)', ekatte: '10135' },
  { name: 'Бургас (Burgas)', ekatte: '07079' },
];

const API_ENDPOINT = "https://4vovgd5ry9.execute-api.eu-west-2.amazonaws.com/calculate";

export default function Home() {
  const [city, setCity] = useState(CITIES[0].ekatte);
  const [cart, setCart] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const addToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    // Lowercase and format as snake_case to mimic the AI normalized format for testing
    const formattedItem = newItem.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cart.includes(formattedItem)) {
      setCart([...cart, formattedItem]);
    }
    setNewItem('');
  };

  const removeFromCart = (itemToRemove: string) => {
    setCart(cart.filter(item => item !== itemToRemove));
  };

  const calculatePrices = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, cityEkatte: city }),
      });

      if (!response.ok) throw new Error('Failed to fetch from API Gateway');
      
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError('Error connecting to the pricing engine. Ensure your API Gateway is live and CORS is enabled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-600">🛒 BG Price Compare</h1>
          <p className="text-gray-500">Find the cheapest groceries in your city.</p>
        </header>

        {/* Control Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          {/* City Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">1. Select your city</label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {CITIES.map(c => (
                <option key={c.ekatte} value={c.ekatte}>{c.name}</option>
              ))}
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* Cart Builder */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">2. Build your cart</label>
            <p className="text-xs text-gray-400 mb-4">Tip: Try adding test products like "mlyako_1kg" or "shokolad_milka"</p>
            
            <form onSubmit={addToCart} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Product name..." 
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                Add
              </button>
            </form>

            {/* Cart Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {cart.map(item => (
                <div key={item} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm border border-blue-100">
                  {item}
                  <button onClick={() => removeFromCart(item)} className="text-blue-400 hover:text-blue-800 font-bold">&times;</button>
                </div>
              ))}
              {cart.length === 0 && <span className="text-gray-400 text-sm italic">Cart is empty</span>}
            </div>

            {/* Submit Action */}
            <button 
              onClick={calculatePrices}
              disabled={cart.length === 0 || loading}
              className="w-full bg-green-500 disabled:bg-gray-300 text-white p-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-sm"
            >
              {loading ? 'Calculating Best Prices...' : '3. Find Lowest Price'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Your Optimal Options</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Option A: Single Physical Store */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-green-100">
                <h3 className="font-bold text-lg text-green-700 mb-1">Cheapest Single Store</h3>
                <p className="text-xs text-gray-500 mb-4">Buy everything in one trip.</p>
                {results.cheapestSinglePhysicalStore ? (
                  <>
                    <p className="text-3xl font-black text-gray-900 mb-1">{results.cheapestSinglePhysicalStore.total.toFixed(2)} лв.</p>
                    <p className="text-sm font-semibold text-gray-700">{results.cheapestSinglePhysicalStore.store}</p>
                    {results.cheapestSinglePhysicalStore.missingItems?.length > 0 && (
                      <p className="text-xs text-red-500 mt-2">Missing: {results.cheapestSinglePhysicalStore.missingItems.join(', ')}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-4">No single physical store has these items.</p>
                )}
              </div>

              {/* Option B: Split Cart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-blue-700 mb-1">Split Cart (Absolute Cheapest)</h3>
                <p className="text-xs text-gray-500 mb-4">Buy items across multiple stores.</p>
                {results.cheapestSplitCart?.total > 0 ? (
                  <>
                    <p className="text-3xl font-black text-gray-900 mb-2">{results.cheapestSplitCart.total.toFixed(2)} лв.</p>
                    <ul className="text-xs space-y-2">
                      {results.cheapestSplitCart.breakdown.map((item: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-gray-100 pb-1">
                          <span className="font-medium truncate pr-2">{item.item}</span>
                          <span className="text-gray-600">@ {item.store} ({item.price} лв.)</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-4">Items not found in any store.</p>
                )}
              </div>

              {/* Option C: Online Delivery */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-purple-700 mb-1">Online Alternatives</h3>
                <p className="text-xs text-gray-500 mb-4">Delivered to your door.</p>
                {results.cheapestOnlineStore ? (
                  <>
                    <p className="text-3xl font-black text-gray-900 mb-1">{results.cheapestOnlineStore.total.toFixed(2)} лв.</p>
                    <p className="text-sm font-semibold text-gray-700">{results.cheapestOnlineStore.store}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-4">No online stores have these items.</p>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}