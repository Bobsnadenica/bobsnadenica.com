import csv
import json
import os
import glob
import re

# Folders
DATA_DIR = './data'
OUTPUT_DIR = './public/api'

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def programmatic_normalization(raw_name):
    """Normalizes string using regex, keeping everything in Bulgarian Cyrillic."""
    name = raw_name.lower()
    
    # 1. Standardize weights/volumes to Bulgarian metrics (гр / мл)
    name = re.sub(r'(\d+)\s*(кг|килограма|kg)', lambda m: f"{int(m.group(1))*1000}гр", name)
    name = re.sub(r'(\d+)\s*(гр|грама|g|gr)', r'\1гр', name)
    name = re.sub(r'(\d+)\s*(л|литра|l)', lambda m: f"{int(m.group(1))*1000}мл", name)
    name = re.sub(r'(\d+)\s*(мл|милилитра|ml)', r'\1мл', name)
    
    # 2. Remove common unnecessary packaging words that mess up matching
    stopwords = ['кутия', 'вакуум', 'опаковка', 'бр', 'парче', 'кен', 'бутилка', 'пвц', 'стъкло', 'плик', 'мрежа']
    for word in stopwords:
        name = re.sub(rf'\b{word}\b', '', name)
        
    # 3. Strip special characters, keep only cyrillic, latin (for brands like Milka), and numbers
    name = re.sub(r'[^а-яa-z0-9\s]', ' ', name)
    
    # 4. Sort words alphabetically for consistent matching
    # Example: "сирене краве 1000гр" and "краве сирене 1000гр" both become "1000гр_краве_сирене"
    words = [w for w in name.split() if w]
    words.sort()
    
    return "_".join(words)

def build_database():
    city_data = {}
    
    search_pattern = os.path.join(DATA_DIR, '**/*.csv')
    csv_files = glob.glob(search_pattern, recursive=True)
    
    if not csv_files:
        print(f"No CSV files found in any subdirectories of {DATA_DIR}")
        return

    # Sort files chronologically so newer prices overwrite older ones
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
                except ValueError:
                    continue
                
                if price == 0:
                    continue
                
                # Structure the data
                if city_key not in city_data:
                    city_data[city_key] = {}
                    
                if norm_name not in city_data[city_key]:
                    city_data[city_key][norm_name] = {
                        "Title": prod_name, # Keeps the original clean title for the UI
                        "Normalized": norm_name,
                        "Stores": {}
                    }
                    
                # Store the price under the Store Name. Overwrites older data automatically.
                city_data[city_key][norm_name]["Stores"][store] = price

    # Format the output JSON per city
    for city_ekatte, products in city_data.items():
        
        for prod_key in products:
            # Convert stores dictionary to a list
            store_dict = products[prod_key]["Stores"]
            store_list = [{"Name": k, "Price": v} for k, v in store_dict.items()]
            
            # Sort stores so the cheapest is ALWAYS first in the array
            store_list.sort(key=lambda x: x["Price"])
            
            products[prod_key]["Stores"] = store_list
            
            # Add helper variables for the frontend to easily display "Best Price" and "Compare X Stores"
            products[prod_key]["MinPrice"] = store_list[0]["Price"] if store_list else 0
            products[prod_key]["StoreCount"] = len(store_list)
            
        output_data = list(products.values())
        output_path = os.path.join(OUTPUT_DIR, f"{city_ekatte}.json")
        
        # Save JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, separators=(',', ':'))
            
        file_size = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Created {output_path} ({len(output_data)} products) - {file_size:.2f} MB")

if __name__ == "__main__":
    print("Starting database build...")
    build_database()
    print("Done!")