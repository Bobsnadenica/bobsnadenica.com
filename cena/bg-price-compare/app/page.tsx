'use client';

import { useState, useMemo, useEffect } from 'react';

const CLOUDFRONT_URL = "https://dszn2zk5jvwtg.cloudfront.net";

interface StorePrice { Name: string; Price: number; }
interface Product { Title: string; Normalized: string; MinPrice: number; StoreCount: number; Stores: StorePrice[]; }
interface CityMeta { name: string; ekatte: string; stores: string[]; }

export default function Home() {
  // --- DYNAMIC METADATA STATE ---
  const [availableCities, setAvailableCities] = useState<CityMeta[]>([]);
  const [manifestLoading, setManifestLoading] = useState(true);
  
  // Set default to empty string so NO city is auto-loaded
  const [selectedEkatte, setSelectedEkatte] = useState('');
  
  // Database State
  const [dbLoading, setDbLoading] = useState(false);
  const [cityProducts, setCityProducts] = useState<Product[]>([]);
  const [dbError, setDbError] = useState('');

  // Cart & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [results, setResults] = useState<any>(null);

  // --- 1. INITIAL LOAD: FETCH ONLY THE MANIFEST ---
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch(`${CLOUDFRONT_URL}/cities_meta.json`);
        if (!response.ok) throw new Error('Неуспешно зареждане на локациите.');
        const data: CityMeta[] = await response.json();
        
        setAvailableCities(data);
        // REMOVED the auto-select logic. It now waits for the user.
      } catch (err) {
        console.error("Manifest Error:", err);
      } finally {
        setManifestLoading(false);
      }
    };
    fetchManifest();
  }, []);

  const currentCity = useMemo(() => {
    return availableCities.find(c => c.ekatte === selectedEkatte) || null;
  }, [selectedEkatte, availableCities]);

  // --- 2. FETCH SPECIFIC CITY DATA ONLY ON CHANGE ---
  useEffect(() => {
    // If no city is selected (default state), do absolutely nothing.
    if (!selectedEkatte) return;

    const fetchDatabase = async () => {
      setDbLoading(true);
      setDbError('');
      setCityProducts([]);
      setCart([]); 
      setResults(null);
      setSearchQuery('');

      try {
        const response = await fetch(`${CLOUDFRONT_URL}/${selectedEkatte}.json`);
        if (!response.ok) throw new Error('Данните за този град все още не са налични.');
        
        const data: Product[] = await response.json();
        setCityProducts(data);
      } catch (err: any) {
        setDbError('Базата данни за този град липсва или се обновява.');
      } finally {
        setDbLoading(false);
      }
    };
    fetchDatabase();
  }, [selectedEkatte]);


  // --- 3. LIVE AUTOCOMPLETE SEARCH ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || cityProducts.length === 0) return [];
    const query = searchQuery.toLowerCase();
    return cityProducts
      .filter(p => p.Title.toLowerCase().includes(query))
      .slice(0, 8); 
  }, [searchQuery, cityProducts]);

  const addToCart = (product: Product) => {
    if (!cart.find(item => item.Normalized === product.Normalized)) {
      setCart([...cart, product]);
    }
    setSearchQuery(''); 
    setResults(null); 
  };

  const removeFromCart = (normalizedId: string) => {
    setCart(cart.filter(item => item.Normalized !== normalizedId));
    setResults(null);
  };

  // --- 4. CLIENT-SIDE PRICING ENGINE ---
  const calculatePrices = () => {
    if (cart.length === 0) return;

    let splitTotal = 0;
    const splitBreakdown: any[] = [];
    const storeTotals: Record<string, { total: number; count: number }> = {};
    const allUniqueStores = new Set<string>();

    cart.forEach(product => {
      if (product.Stores.length > 0) {
        const bestOption = product.Stores[0];
        splitTotal += bestOption.Price;
        splitBreakdown.push({ item: product.Title, store: bestOption.Name, price: bestOption.Price });
      }

      product.Stores.forEach(storeOpt => {
        allUniqueStores.add(storeOpt.Name);
        if (!storeTotals[storeOpt.Name]) {
          storeTotals[storeOpt.Name] = { total: 0, count: 0 };
        }
        storeTotals[storeOpt.Name].total += storeOpt.Price;
        storeTotals[storeOpt.Name].count += 1;
      });
    });

    let bestSingleStore = null;
    let lowestSingleTotal = Infinity;

    for (const storeName of Array.from(allUniqueStores)) {
      const storeData = storeTotals[storeName];
      if (storeData.count === cart.length) {
        if (storeData.total < lowestSingleTotal) {
          lowestSingleTotal = storeData.total;
          bestSingleStore = { store: storeName, total: storeData.total };
        }
      }
    }

    setResults({
      cheapestSinglePhysicalStore: bestSingleStore,
      cheapestSplitCart: { total: splitTotal, breakdown: splitBreakdown }
    });
  };

  if (manifestLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-blue-500 font-bold animate-pulse">Инициализиране на платформата...</p></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="text-center space-y-3 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-blue-700">Сравни Цените</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Интелигентна платформа за намиране на най-изгодните хранителни стоки.</p>
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
                {/* ADDED: Default disabled option prompting user to select a city */}
                <option value="" disabled>-- Изберете град --</option>
                {availableCities.map(c => <option key={c.ekatte} value={c.ekatte}>{c.name}</option>)}
              </select>

              {dbLoading && <p className="text-xs text-blue-500 mt-3 animate-pulse">Зареждане на актуални цени...</p>}
              {dbError && <p className="text-xs text-red-500 mt-3">{dbError}</p>}
              {!selectedEkatte && !dbLoading && (
                <p className="text-xs text-slate-500 mt-3">Моля, изберете град, за да заредите цените.</p>
              )}
              
              {/* DYNAMIC STORE LISTING */}
              {currentCity && !dbLoading && cityProducts.length > 0 && (
                <div className="mt-5 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-3">
                    Налични магазини ({currentCity.stores.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentCity.stores.map(store => (
                      <span key={store} className="px-2 py-1 bg-white text-blue-700 text-[10px] font-bold rounded shadow-sm border border-blue-200">
                        {store}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-emerald-600 mt-3 font-medium border-t border-blue-100 pt-2">✓ Заредени {cityProducts.length} продукта</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Стъпка 2: Количка</h2>
              
              <div className="relative mb-4">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={selectedEkatte ? "Търси продукт (напр. сирене)..." : "Първо изберете град..."}
                  disabled={dbLoading || cityProducts.length === 0}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(prod => (
                      <button 
                        key={prod.Normalized}
                        onClick={() => addToCart(prod)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col"
                      >
                        <span className="font-medium text-sm text-slate-800">{prod.Title}</span>
                        <span className="text-xs text-slate-400">Налично в {prod.StoreCount} магазина (от {prod.MinPrice.toFixed(2)} лв.)</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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