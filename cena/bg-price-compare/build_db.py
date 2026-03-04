import csv
import json
import os
import glob
import re

DATA_DIR = './data'
OUTPUT_DIR = './public/api'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Map EKATTE codes to human-readable names for the frontend
EKATTE_NAMES = {
    "68134": "София (Sofia)",
    "56784": "Пловдив (Plovdiv)",
    "10135": "Варна (Varna)",
    "07079": "Бургас (Burgas)",
    "63427": "Русе (Ruse)",
    "68850": "Стара Загора (Stara Zagora)",
    "56722": "Плевен (Pleven)",
    "72624": "Добрич (Dobrich)",
    "ONLINE": "Онлайн Доставка (National Online)"
}

def programmatic_normalization(raw_name):
    name = raw_name.lower()
    name = re.sub(r'(\d+)\s*(кг|килограма|kg)', lambda m: f"{int(m.group(1))*1000}гр", name)
    name = re.sub(r'(\d+)\s*(гр|грама|g|gr)', r'\1гр', name)
    name = re.sub(r'(\d+)\s*(л|литра|l)', lambda m: f"{int(m.group(1))*1000}мл", name)
    name = re.sub(r'(\d+)\s*(мл|милилитра|ml)', r'\1мл', name)
    
    stopwords = ['кутия', 'вакуум', 'опаковка', 'бр', 'парче', 'кен', 'бутилка', 'пвц', 'стъкло', 'плик', 'мрежа']
    for word in stopwords:
        name = re.sub(rf'\b{word}\b', '', name)
        
    name = re.sub(r'[^а-яa-z0-9\s]', ' ', name)
    words = [w for w in name.split() if w]
    words.sort()
    return "_".join(words)

def build_database():
    city_data = {}
    city_metadata = {} # Tracks dynamic stores per city
    
    search_pattern = os.path.join(DATA_DIR, '**/*.csv')
    csv_files = glob.glob(search_pattern, recursive=True)
    
    if not csv_files:
        print(f"No CSV files found in {DATA_DIR}")
        return

    csv_files.sort()

    for filepath in csv_files:
        print(f"Processing: {filepath}")
        with open(filepath, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                city_ekatte = row.get('Населено място', '').strip()
                store = row.get('Търговски обект', '').strip()
                prod_name = row.get('Наименование на продукта', '')
                
                if not prod_name or not city_ekatte: 
                    continue
                    
                is_online = (store == "Онлайн")
                city_key = "ONLINE" if is_online else city_ekatte
                norm_name = programmatic_normalization(prod_name)
                
                try:
                    price = float(row.get('Цена в промоция', 0) or row.get('Цена на дребно', 0) or 0)
                except ValueError: continue
                
                if price == 0: continue
                
                # 1. TRACK METADATA (Dynamic Stores)
                if city_key not in city_metadata:
                    city_name = EKATTE_NAMES.get(city_key, f"Град ({city_key})") # Fallback for unknown cities
                    city_metadata[city_key] = {"name": city_name, "ekatte": city_key, "stores": set()}
                
                city_metadata[city_key]["stores"].add(store)
                
                # 2. TRACK PRODUCT DATA
                if city_key not in city_data:
                    city_data[city_key] = {}
                    
                if norm_name not in city_data[city_key]:
                    city_data[city_key][norm_name] = {
                        "Title": prod_name,
                        "Normalized": norm_name,
                        "Stores": {}
                    }
                    
                city_data[city_key][norm_name]["Stores"][store] = price

    # Write the individual City JSON files
    for city_ekatte, products in city_data.items():
        for prod_key in products:
            store_dict = products[prod_key]["Stores"]
            store_list = [{"Name": k, "Price": v} for k, v in store_dict.items()]
            store_list.sort(key=lambda x: x["Price"])
            
            products[prod_key]["Stores"] = store_list
            products[prod_key]["MinPrice"] = store_list[0]["Price"] if store_list else 0
            products[prod_key]["StoreCount"] = len(store_list)
            
        output_data = list(products.values())
        output_path = os.path.join(OUTPUT_DIR, f"{city_ekatte}.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, separators=(',', ':'))

    # Write the Global Manifest JSON file
    manifest_list = []
    for meta in city_metadata.values():
        manifest_list.append({
            "name": meta["name"],
            "ekatte": meta["ekatte"],
            "stores": sorted(list(meta["stores"])) # Convert set to sorted list
        })
    
    # Sort manifest so ONLINE is usually last, and cities are alphabetical
    manifest_list.sort(key=lambda x: (x["ekatte"] == "ONLINE", x["name"]))
    
    manifest_path = os.path.join(OUTPUT_DIR, "cities_meta.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest_list, f, ensure_ascii=False)
        
    print(f"Generated Manifest: cities_meta.json ({len(manifest_list)} active locations)")

if __name__ == "__main__":
    build_database()