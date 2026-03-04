import boto3
import csv
import json
import os
import urllib.parse
import re
from datetime import datetime, timedelta

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')
bedrock = boto3.client('bedrock-runtime')

PRICE_TABLE = os.environ['PRICE_TABLE']
DICT_TABLE = os.environ['DICT_TABLE']
SQS_URL = os.environ['SQS_URL']

price_table = dynamodb.Table(PRICE_TABLE)
dict_table = dynamodb.Table(DICT_TABLE)

product_cache = {}
stores_sent_to_sqs = set()

def fallback_normalization(raw_name):
    """A better fallback that cleans Bulgarian strings if AI fails."""
    name = raw_name.lower()
    # Remove special characters, keep only cyrillic, latin, numbers, and spaces
    name = re.sub(r'[^а-яa-z0-9\s]', '', name)
    # Replace multiple spaces with a single underscore
    name = re.sub(r'\s+', '_', name).strip('_')
    return name

def normalize_with_ai(raw_name):
    """Uses Bedrock to standardize product names strictly in Bulgarian."""
    if raw_name in product_cache:
        return product_cache[raw_name]
        
    response = dict_table.get_item(Key={'RawName': raw_name})
    if 'Item' in response:
        norm_name = response['Item']['NormalizedName']
        product_cache[raw_name] = norm_name
        return norm_name
        
    # NEW PROMPT: Strictly enforce Bulgarian Cyrillic
    prompt = f"""Extract the brand, product type, flavor/variant, and weight/volume from this Bulgarian product name: '{raw_name}'.
    
    CRITICAL RULES:
    1. Keep all words in Bulgarian Cyrillic (DO NOT translate to English. "сирене" stays "сирене", not "cheese").
    2. Format the output strictly as lowercase snake_case (e.g., марка_вид_вкус_грамаж).
    3. Use only Cyrillic letters, numbers, and underscores.
    4. Do not output any introductory text, just the formatted string."""
    
    try:
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 50,
            "messages": [{"role": "user", "content": prompt}]
        })
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            contentType='application/json',
            accept='application/json',
            body=body
        )
        response_body = json.loads(response.get('body').read())
        norm_name = response_body['content'][0]['text'].strip()
        
        # Failsafe: If Claude randomly outputs English letters, use the fallback
        if not re.search('[а-яА-Я]', norm_name) and re.search('[а-яА-Я]', raw_name):
             norm_name = fallback_normalization(raw_name)
        
        dict_table.put_item(Item={'RawName': raw_name, 'NormalizedName': norm_name})
        product_cache[raw_name] = norm_name
        return norm_name
        
    except Exception as e:
        print(f"Bedrock failed for {raw_name}: {e}")
        return fallback_normalization(raw_name)

def handler(event, context):
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    
    current_week = datetime.now().strftime("%Y-%W")
    ttl_date = int((datetime.now() + timedelta(days=14)).timestamp())
    
    response = s3.get_object(Bucket=bucket, Key=key)
    lines = response['Body'].read().decode('utf-8-sig').splitlines() # -sig handles CSV byte order marks
    reader = csv.DictReader(lines)
    
    with price_table.batch_writer() as batch:
        for row in reader:
            city = row.get('Населено място', '').strip()
            store = row.get('Търговски обект', '').strip()
            prod_name = row.get('Наименование на продукта', '')
            store_code = row.get('Код на продукта', '')
            
            # Skip empty rows
            if not prod_name: continue
            
            norm_name = normalize_with_ai(prod_name)
            is_online = (store == "Онлайн")
            pk_prefix = "ONLINE" if is_online else city
            pk = f"CITY#{pk_prefix}#WEEK#{current_week}"
            sk = f"PROD#{norm_name}#STORE#{store_code}"
            
            store_key = f"{city}::{store}"
            if not is_online and store_key not in stores_sent_to_sqs:
                sqs.send_message(
                    QueueUrl=SQS_URL,
                    MessageBody=json.dumps({"city": city, "store": store, "pk": pk})
                )
                stores_sent_to_sqs.add(store_key)
            
            item = {
                'PK': pk, 'SK': sk,
                'OriginalName': prod_name, 'NormalizedName': norm_name,
                'Category': row.get('Категория', ''),
                'RetailPrice': float(row.get('Цена на дребно', 0) or 0),
                'PromoPrice': float(row.get('Цена в промоция', 0) or row.get('Цена на дребно', 0) or 0),
                'StoreName': store, 'IsOnline': is_online,
                'ExpirationDate': ttl_date
            }
            batch.put_item(Item=item)
            
    return {"statusCode": 200, "body": "Ingestion Complete"}