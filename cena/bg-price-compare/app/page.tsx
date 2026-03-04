'use client';

import { useState, useMemo, useEffect } from 'react';

const CLOUDFRONT_URL = "https://dszn2zk5jvwtg.cloudfront.net";

interface StorePrice { Name: string; Price: number; }
interface Product { Title: string; Normalized: string; MinPrice: number; StoreCount: number; Stores: StorePrice[]; }
interface CityMeta { name: string; ekatte: string; stores: string[]; }
interface CartItem { product: Product; quantity: number; }

export default function Home() {
  const [availableCities, setAvailableCities] = useState<CityMeta[]>([]);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [selectedEkatte, setSelectedEkatte] = useState('');
  
  const [dbLoading, setDbLoading] = useState(false);
  const [cityProducts, setCityProducts] = useState<Product[]>([]);
  const [dbError, setDbError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]); 
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch(`${CLOUDFRONT_URL}/cities_meta.json`);
        if (!response.ok) throw new Error('Неуспешно зареждане на локациите.');
        const data: CityMeta[] = await response.json();
        setAvailableCities(data);
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

  useEffect(() => {
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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || cityProducts.length === 0) return [];
    const query = searchQuery.toLowerCase();
    return cityProducts
      .filter(p => p.Title.toLowerCase().includes(query))
      .slice(0, 8); 
  }, [searchQuery, cityProducts]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.Normalized === product.Normalized);
    if (existing) {
      setCart(cart.map(item => 
        item.product.Normalized === product.Normalized 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setSearchQuery(''); 
    setResults(null); 
  };

  const updateQuantity = (normalizedId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.Normalized === normalizedId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
    setResults(null); 
  };

  const removeFromCart = (normalizedId: string) => {
    setCart(cart.filter(item => item.product.Normalized !== normalizedId));
    setResults(null);
  };

  const calculatePrices = () => {
    if (cart.length === 0) return;

    let splitTotal = 0;
    const splitBreakdown: any[] = [];
    const storeTotals: Record<string, { total: number; count: number }> = {};
    const allUniqueStores = new Set<string>();

    cart.forEach(cartItem => {
      const { product, quantity } = cartItem; 

      if (product.Stores.length > 0) {
        const bestOption = product.Stores[0];
        const itemTotal = bestOption.Price * quantity; 
        
        splitTotal += itemTotal;
        splitBreakdown.push({ 
          item: product.Title, 
          qty: quantity,
          store: bestOption.Name, 
          price: bestOption.Price,
          total: itemTotal
        });
      }

      product.Stores.forEach(storeOpt => {
        allUniqueStores.add(storeOpt.Name);
        if (!storeTotals[storeOpt.Name]) {
          storeTotals[storeOpt.Name] = { total: 0, count: 0 };
        }
        storeTotals[storeOpt.Name].total += (storeOpt.Price * quantity); 
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-bold animate-pulse">Инициализиране...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
        
        <header className="text-center space-y-2 py-4 lg:py-6">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-blue-700">
            Къде е най-евтиното?
          </h1>
          <p className="text-base lg:text-lg text-slate-500 max-w-2xl mx-auto px-2">
            Интелигентна платформа за намиране на най-изгодните хранителни стоки.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-slate-200 transition-all">
              <h2 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 lg:mb-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span>
                Локация
              </h2>
              
              <select 
                value={selectedEkatte} 
                onChange={(e) => setSelectedEkatte(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 text-base appearance-none cursor-pointer hover:border-blue-400 transition-colors"
              >
                <option value="" disabled>-- Изберете град --</option>
                {availableCities.map(c => <option key={c.ekatte} value={c.ekatte}>{c.name}</option>)}
              </select>

              {dbLoading && <p className="text-xs text-blue-500 mt-3 animate-pulse font-medium">Зареждане на актуални цени...</p>}
              {dbError && <p className="text-xs text-red-500 mt-3 font-medium bg-red-50 p-2 rounded-lg">{dbError}</p>}
              {!selectedEkatte && !dbLoading && (
                <p className="text-xs text-slate-500 mt-3">Моля, изберете град, за да заредите цените.</p>
              )}
              
              {/* FIXED: Horizontal scrollable store list to prevent vertical bloat */}
              {currentCity && !dbLoading && cityProducts.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-600">Налични магазини:</p>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{cityProducts.length} продукта</span>
                  </div>
                  
                  {/* Tailwind native horizontal scroll with hidden scrollbar styling */}
                  <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {currentCity.stores.map(store => (
                      <span key={store} className="px-3 py-1.5 bg-white whitespace-nowrap text-slate-700 text-xs font-semibold rounded-lg shadow-sm border border-slate-200 shrink-0">
                        {store}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 lg:mb-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-500 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">2</span>
                Количка
              </h2>
              
              <div className="relative mb-5 z-40">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={selectedEkatte ? "Търси продукт (напр. сирене)..." : "Първо изберете град..."}
                    disabled={dbLoading || cityProducts.length === 0}
                    className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  
                  {/* Quick clear button */}
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {searchResults.map(prod => (
                      <button 
                        key={prod.Normalized}
                        onClick={() => addToCart(prod)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors flex flex-col active:bg-blue-100"
                      >
                        <span className="font-semibold text-sm text-slate-800">{prod.Title}</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[11px] text-slate-500 font-medium">В {prod.StoreCount} магазина</span>
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded">от {prod.MinPrice.toFixed(2)} €</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* FIXED: Bulletproof Flexbox for Cart Items */}
              <div className="min-h-[120px] max-h-[45vh] overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-2 lg:p-3 mb-5 lg:mb-6 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center text-slate-400 py-8 opacity-60">
                     <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                     <span className="text-sm italic">Количката е празна</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {cart.map(item => (
                      <div key={item.product.Normalized} className="bg-white px-3 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 border border-slate-200 shadow-sm transition-all hover:border-blue-200 group">
                        
                        {/* THE FIX: flex-1 and min-w-0 prevent text from pushing the buttons out! */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-800 truncate" title={item.product.Title}>
                            {item.product.Title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Най-ниска цена: <span className="text-slate-600">{item.product.MinPrice.toFixed(2)} €</span></p>
                        </div>
                        
                        {/* CONTROLS: shrink-0 ensures it never gets squished */}
                        <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100 self-start sm:self-auto">
                           <button onClick={() => updateQuantity(item.product.Normalized, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded text-slate-600 font-bold hover:bg-slate-100 active:scale-95 transition-all">-</button>
                           <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.product.Normalized, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded text-slate-600 font-bold hover:bg-slate-100 active:scale-95 transition-all">+</button>
                           <div className="w-px h-5 bg-slate-200 mx-1"></div>
                           <button onClick={() => removeFromCart(item.product.Normalized)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Премахни">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={calculatePrices}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 disabled:bg-slate-300 text-white p-4 rounded-xl font-bold text-base lg:text-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Изчисли Най-Ниска Цена
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2">
            {!results && (
              <div className="h-full bg-white/60 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 lg:p-12 text-center text-slate-400 min-h-[300px] lg:min-h-[400px]">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-lg font-semibold text-slate-500">Очаквам данни за калкулация</p>
                <p className="text-sm mt-2 max-w-sm">Добавете продукти чрез търсачката, изберете количества и натиснете бутона за изчисление.</p>
              </div>
            )}

            {results && (
              <div className="space-y-5 lg:space-y-6 animate-fade-in-up">
                
                {/* Single Store Strategy */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                  <div className="bg-slate-50 px-5 lg:px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm lg:text-base">Най-изгоден единичен магазин</h3>
                      <p className="text-[11px] lg:text-xs text-slate-500 mt-0.5">Всички продукти закупени от едно място</p>
                    </div>
                    {results.cheapestSinglePhysicalStore && (
                      <div className="text-right">
                        <span className="text-2xl lg:text-3xl font-black text-slate-800">{results.cheapestSinglePhysicalStore.total.toFixed(2)}</span>
                        <span className="text-slate-500 font-bold ml-1">€</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 lg:p-6">
                    {results.cheapestSinglePhysicalStore ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        </div>
                        <p className="text-lg lg:text-xl font-bold text-slate-800">{results.cheapestSinglePhysicalStore.store}</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <p className="text-sm text-orange-800">Няма физически магазин, който да предлага абсолютно всички търсени продукти едновременно. Ще се наложи да посетите повече от един обект.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Split Cart Strategy */}
                <div className="bg-white rounded-2xl shadow-md border-2 border-blue-500 overflow-hidden relative">
                  {/* Badge for savings! */}
                  {results.cheapestSinglePhysicalStore && (results.cheapestSinglePhysicalStore.total - results.cheapestSplitCart.total > 0) && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] lg:text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                      Спестявате {(results.cheapestSinglePhysicalStore.total - results.cheapestSplitCart.total).toFixed(2)} €
                    </div>
                  )}
                  
                  <div className="bg-blue-50 px-5 lg:px-6 py-4 border-b border-blue-100">
                    <h3 className="font-bold text-blue-800 text-sm lg:text-base flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Абсолютен минимум
                    </h3>
                    <p className="text-[11px] lg:text-xs text-blue-600 mt-0.5">Разделена количка (пазаруване от най-евтините места)</p>
                  </div>
                  <div className="p-5 lg:p-6">
                    <p className="text-3xl lg:text-4xl font-black text-slate-900 mb-5 lg:mb-6">{results.cheapestSplitCart.total.toFixed(2)} <span className="text-blue-600">€</span></p>
                    <ul className="space-y-3 lg:space-y-4">
                      {results.cheapestSplitCart.breakdown.map((item: any, i: number) => (
                        <li key={i} className="flex flex-col md:flex-row md:justify-between md:items-center text-sm border-b border-slate-100 pb-3 lg:pb-2 last:border-0 last:pb-0">
                          <span className="font-semibold text-slate-800 mb-2 md:mb-0 pr-2">
                            {item.qty > 1 && <span className="text-blue-600 font-black mr-2 bg-blue-50 px-1.5 py-0.5 rounded">{item.qty}x</span>}
                            {item.item}
                          </span>
                          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
                            <span className="text-[11px] px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-bold shrink-0 shadow-sm border border-slate-200">{item.store}</span>
                            <span className="font-black text-slate-800 w-16 text-right shrink-0">{item.total.toFixed(2)} €</span>
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