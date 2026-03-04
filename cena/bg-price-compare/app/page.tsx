'use client';

import { useState, useMemo } from 'react';

// 1. Robust Configuration Matrix
// This maps cities to their EKATTE codes and the store chains currently operating/ingested there.
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

const API_ENDPOINT = "https://4vovgd5ry9.execute-api.eu-west-2.amazonaws.com/calculate";

export default function Home() {
  const [selectedEkatte, setSelectedEkatte] = useState(CITIES[0].ekatte);
  const [cart, setCart] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  // Dynamically find the currently selected city object to display its stores
  const currentCity = useMemo(() => {
    return CITIES.find(c => c.ekatte === selectedEkatte) || CITIES[0];
  }, [selectedEkatte]);

  const addToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    // Format input to match the AI snake_case format for exact matching
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
        body: JSON.stringify({ cartItems: cart, cityEkatte: selectedEkatte }),
      });

      if (!response.ok) throw new Error('Възникна грешка при връзката със сървъра (API Error).');
      
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError('Неуспешна връзка с ценовата база данни. Моля, опитайте по-късно.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="text-center space-y-3 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-blue-700">
            Сравни Цените
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Интелигентна платформа за намиране на най-изгодните хранителни стоки във вашия град.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Step 1: City Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Стъпка 1: Локация</h2>
              
              <select 
                value={selectedEkatte} 
                onChange={(e) => {
                  setSelectedEkatte(e.target.value);
                  setResults(null); // Reset results if city changes
                }}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
              >
                {CITIES.map(c => (
                  <option key={c.ekatte} value={c.ekatte}>{c.name}</option>
                ))}
              </select>

              {/* Dynamic Stores Display */}
              <div className="mt-5 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-3">
                  Налични магазини в {currentCity.name.split(' ')[0]}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentCity.stores.map(store => (
                    <span key={store} className="px-2.5 py-1 bg-white text-blue-700 text-xs font-bold rounded-md shadow-sm border border-blue-200">
                      {store}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Cart Builder */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Стъпка 2: Продукти</h2>
              
              <form onSubmit={addToCart} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Въведете продукт..." 
                  className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <button type="submit" className="bg-slate-800 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-sm text-sm">
                  Добави
                </button>
              </form>

              {/* Active Cart Items */}
              <div className="min-h-[100px] max-h-[250px] overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-3 mb-6">
                {cart.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm italic">
                    Количката е празна
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cart.map(item => (
                      <div key={item} className="bg-white text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border border-slate-200 shadow-sm group">
                        <span className="font-medium">{item}</span>
                        <button onClick={() => removeFromCart(item)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button 
                onClick={calculatePrices}
                disabled={cart.length === 0 || loading}
                className="w-full relative group overflow-hidden bg-blue-600 disabled:bg-slate-300 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Изчисляване...
                  </span>
                ) : 'Търси Най-Ниска Цена'}
              </button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3 mb-6">
                <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            {!results && !error && !loading && (
              <div className="h-full bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center text-slate-400 min-h-[400px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
                <p className="text-lg font-medium">Резултатите ще се появят тук</p>
                <p className="text-sm mt-2 max-w-sm">Добавете продукти в количката и стартирайте търсенето, за да сравните цените.</p>
              </div>
            )}

            {results && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Single Store Result */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                  <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        Най-изгоден единичен магазин
                      </h3>
                      <p className="text-xs text-emerald-600 mt-0.5">Купете всичко с едно ходене</p>
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
                      <div>
                        <p className="text-lg font-bold text-slate-800 mb-2">{results.cheapestSinglePhysicalStore.store}</p>
                        {results.cheapestSinglePhysicalStore.missingItems?.length > 0 && (
                          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs font-bold text-red-700 mb-1">Липсващи продукти:</p>
                            <p className="text-xs text-red-600">{results.cheapestSinglePhysicalStore.missingItems.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Нито един физически магазин не предлага всички търсени продукти едновременно.</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Split Cart Result */}
                  <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                     <div className="bg-blue-50 px-5 py-4 border-b border-blue-100">
                        <h3 className="font-bold text-blue-800">Разделена количка</h3>
                        <p className="text-xs text-blue-600 mt-0.5">Абсолютният минимум (обикаляне)</p>
                     </div>
                     <div className="p-5">
                       {results.cheapestSplitCart?.total > 0 ? (
                          <>
                            <p className="text-2xl font-black text-slate-900 mb-4">{results.cheapestSplitCart.total.toFixed(2)} лв.</p>
                            <ul className="space-y-3">
                              {results.cheapestSplitCart.breakdown.map((item: any, i: number) => (
                                <li key={i} className="flex flex-col text-sm border-b border-slate-100 pb-2 last:border-0">
                                  <span className="font-semibold text-slate-800">{item.item}</span>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">{item.store}</span>
                                    <span className="font-bold text-blue-600">{item.price.toFixed(2)} лв.</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </>
                       ) : (
                         <p className="text-sm text-slate-500 italic">Продуктите не бяха открити.</p>
                       )}
                     </div>
                  </div>

                  {/* Online Result */}
                  <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                     <div className="bg-purple-50 px-5 py-4 border-b border-purple-100">
                        <h3 className="font-bold text-purple-800">Онлайн алтернатива</h3>
                        <p className="text-xs text-purple-600 mt-0.5">Доставка до врата</p>
                     </div>
                     <div className="p-5">
                       {results.cheapestOnlineStore ? (
                          <>
                            <p className="text-2xl font-black text-slate-900 mb-2">{results.cheapestOnlineStore.total.toFixed(2)} лв.</p>
                            <p className="font-bold text-slate-800">{results.cheapestOnlineStore.store}</p>
                          </>
                       ) : (
                         <p className="text-sm text-slate-500 italic">Нито един онлайн магазин не предлага тези продукти.</p>
                       )}
                     </div>
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