'use client';

import { useState, useMemo, useEffect } from 'react';

// Configuration
const CITIES = [
  { name: 'София (Sofia)', ekatte: '68134', stores: ['Kaufland', 'Billa', 'Lidl', 'Fantastico', 'T-Market', 'Hit Max'] },
  { name: 'Пловдив (Plovdiv)', ekatte: '56784', stores: ['Kaufland', 'Billa', 'Lidl', 'Lexi', 'T-Market'] },
  { name: 'Варна (Varna)', ekatte: '10135', stores: ['Kaufland', 'Billa', 'Lidl', 'CBA', 'Bulmag'] },
  { name: 'Бургас (Burgas)', ekatte: '07079', stores: ['Kaufland', 'Billa', 'Lidl', 'Janet', 'Bolero'] },
  { name: 'Русе (Ruse)', ekatte: '63427', stores: ['Kaufland', 'Billa', 'Lidl', 'Paconi'] },
  { name: 'Стара Загора (Stara Zagora)', ekatte: '68850', stores: ['Kaufland', 'Billa', 'Lidl', 'CBA'] },
  { name: 'Плевен (Pleven)', ekatte: '56722', stores: ['Kaufland', 'Billa', 'Lidl', 'Life'] },
  { name: 'Добрич (Dobrich)', ekatte: '72624', stores: ['CBA', 'Kaufland', 'Billa', 'Lidl'] },
  { name: 'Онлайн Доставка (National Online)', ekatte: 'ONLINE', stores: ['eBag', 'Supermag', 'Gladen'] },
];

const CLOUDFRONT_URL = "https://dszn2zk5jvwtg.cloudfront.net";

// Interfaces for our JSON data structure
interface StorePrice {
  Name: string;
  Price: number;
}

interface Product {
  Title: string;
  Normalized: string;
  MinPrice: number;
  StoreCount: number;
  Stores: StorePrice[];
}

export default function Home() {
  const [selectedEkatte, setSelectedEkatte] = useState(CITIES[0].ekatte);
  
  // Database State
  const [dbLoading, setDbLoading] = useState(false);
  const [cityProducts, setCityProducts] = useState<Product[]>([]);
  const [dbError, setDbError] = useState('');

  // Cart & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [results, setResults] = useState<any>(null);

  const currentCity = useMemo(() => CITIES.find(c => c.ekatte === selectedEkatte) || CITIES[0], [selectedEkatte]);

  // --- 1. FETCH THE JSON DATABASE ON CITY CHANGE ---
  useEffect(() => {
    const fetchDatabase = async () => {
      setDbLoading(true);
      setDbError('');
      setCityProducts([]);
      setCart([]); // Clear cart on city change
      setResults(null);
      setSearchQuery('');

      try {
        // Fetches the pre-calculated JSON from your CloudFront CDN
        const response = await fetch(`${CLOUDFRONT_URL}/api/${selectedEkatte}.json`);
        if (!response.ok) throw new Error('Данните за този град все още не са налични.');
        
        const data: Product[] = await response.json();
        setCityProducts(data);
      } catch (err: any) {
        console.error(err);
        setDbError('Базата данни за този град липсва или се обновява.');
      } finally {
        setDbLoading(false);
      }
    };

    fetchDatabase();
  }, [selectedEkatte]);

  // --- 2. LIVE AUTOCOMPLETE SEARCH ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || cityProducts.length === 0) return [];
    
    const query = searchQuery.toLowerCase();
    return cityProducts
      .filter(p => p.Title.toLowerCase().includes(query))
      .slice(0, 8); // Show top 8 results
  }, [searchQuery, cityProducts]);

  const addToCart = (product: Product) => {
    if (!cart.find(item => item.Normalized === product.Normalized)) {
      setCart([...cart, product]);
    }
    setSearchQuery(''); // Reset search after adding
    setResults(null); // Clear old results
  };

  const removeFromCart = (normalizedId: string) => {
    setCart(cart.filter(item => item.Normalized !== normalizedId));
    setResults(null);
  };

  // --- 3. CLIENT-SIDE PRICING ENGINE ---
  const calculatePrices = () => {
    if (cart.length === 0) return;

    let splitTotal = 0;
    const splitBreakdown: any[] = [];
    const storeTotals: Record<string, { total: number; count: number; missing: string[] }> = {};
    const allUniqueStores = new Set<string>();

    // Analyze each product in the cart
    cart.forEach(product => {
      // 1. SPLIT CART (Cheapest overall)
      // Because Python sorted Stores by price, Stores[0] is ALWAYS the cheapest!
      if (product.Stores.length > 0) {
        const bestOption = product.Stores[0];
        splitTotal += bestOption.Price;
        splitBreakdown.push({ item: product.Title, store: bestOption.Name, price: bestOption.Price });
      }

      // 2. SINGLE STORE Tracking
      // Track which stores have this item to find a store that has EVERYTHING
      product.Stores.forEach(storeOpt => {
        allUniqueStores.add(storeOpt.Name);
        if (!storeTotals[storeOpt.Name]) {
          storeTotals[storeOpt.Name] = { total: 0, count: 0, missing: [] };
        }
        storeTotals[storeOpt.Name].total += storeOpt.Price;
        storeTotals[storeOpt.Name].count += 1;
      });
    });

    // Find the cheapest single store that has ALL items in the cart
    let bestSingleStore = null;
    let lowestSingleTotal = Infinity;

    for (const storeName of Array.from(allUniqueStores)) {
      const storeData = storeTotals[storeName];
      
      // If the store has every item in our cart
      if (storeData.count === cart.length) {
        if (storeData.total < lowestSingleTotal) {
          lowestSingleTotal = storeData.total;
          bestSingleStore = { store: storeName, total: storeData.total, missingItems: [] };
        }
      }
    }

    setResults({
      cheapestSinglePhysicalStore: bestSingleStore,
      cheapestSplitCart: { total: splitTotal, breakdown: splitBreakdown }
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="text-center space-y-3 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-blue-700">
            Сравни Цените
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Интелигентна платформа за намиране на най-изгодните хранителни стоки.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Стъпка 1: Локация</h2>
              <select 
                value={selectedEkatte} 
                onChange={(e) => setSelectedEkatte(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
              >
                {CITIES.map(c => <option key={c.ekatte} value={c.ekatte}>{c.name}</option>)}
              </select>

              {dbLoading && <p className="text-xs text-blue-500 mt-2 animate-pulse">Зареждане на актуални цени...</p>}
              {dbError && <p className="text-xs text-red-500 mt-2">{dbError}</p>}
              {cityProducts.length > 0 && <p className="text-xs text-emerald-600 mt-2 font-medium">✓ Заредени {cityProducts.length} продукта</p>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Стъпка 2: Количка</h2>
              
              {/* Live Search Input */}
              <div className="relative mb-4">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Търси продукт (напр. сирене)..." 
                  disabled={dbLoading || cityProducts.length === 0}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50"
                />
                
                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(prod => (
                      <button 
                        key={prod.Normalized}
                        onClick={() => addToCart(prod)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col"
                      >
                        <span className="font-medium text-sm text-slate-800">{prod.Title}</span>
                        <span className="text-xs text-slate-400">
                          Налично в {prod.StoreCount} магазина (от {prod.MinPrice.toFixed(2)} лв.)
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Cart */}
              <div className="min-h-[100px] max-h-[250px] overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-3 mb-6">
                {cart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm italic">Количката е празна</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {cart.map(item => (
                      <div key={item.Normalized} className="bg-white text-slate-700 px-3 py-2 rounded-lg flex justify-between items-center text-sm border border-slate-200 shadow-sm">
                        <span className="font-medium truncate pr-2">{item.Title}</span>
                        <button onClick={() => removeFromCart(item.Normalized)} className="text-slate-300 hover:text-red-500 font-bold px-2">&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={calculatePrices}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 disabled:bg-slate-300 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md"
              >
                Изчисли Най-Ниска Цена
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2">
            {!results && (
              <div className="h-full bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[400px]">
                <p className="text-lg font-medium">Резултатите ще се появят тук</p>
                <p className="text-sm mt-2 max-w-sm">Добавете продукти чрез търсачката и стартирайте калкулацията.</p>
              </div>
            )}

            {results && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Single Store Result */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                  <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-emerald-800">Най-изгоден единичен магазин</h3>
                      <p className="text-xs text-emerald-600 mt-0.5">Всички продукти на едно място</p>
                    </div>
                    {results.cheapestSinglePhysicalStore && (
                      <div className="text-right">
                        <span className="text-3xl font-black text-emerald-700">{results.cheapestSinglePhysicalStore.total.toFixed(2)}</span>
                        <span className="text-emerald-600 font-bold ml-1">лв.</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {results.cheapestSinglePhysicalStore ? (
                      <p className="text-xl font-bold text-slate-800">{results.cheapestSinglePhysicalStore.store}</p>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Няма физически магазин, който да предлага всички продукти едновременно.</p>
                    )}
                  </div>
                </div>

                {/* Split Cart Result */}
                <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                    <h3 className="font-bold text-blue-800">Разделена количка (Абсолютен минимум)</h3>
                    <p className="text-xs text-blue-600 mt-0.5">Ако пазарувате от различни места</p>
                  </div>
                  <div className="p-6">
                    <p className="text-2xl font-black text-slate-900 mb-4">{results.cheapestSplitCart.total.toFixed(2)} лв.</p>
                    <ul className="space-y-3">
                      {results.cheapestSplitCart.breakdown.map((item: any, i: number) => (
                        <li key={i} className="flex flex-col md:flex-row md:justify-between md:items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                          <span className="font-semibold text-slate-800 mb-1 md:mb-0">{item.item}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs px-2 py-1 bg-slate-100 rounded-md text-slate-600">{item.store}</span>
                            <span className="font-bold text-blue-600 w-16 text-right">{item.price.toFixed(2)} лв.</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}