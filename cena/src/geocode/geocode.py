import boto3
import json
import urllib.parse
import urllib.request
import os
import time

dynamodb = boto3.resource('dynamodb')
PRICE_TABLE = os.environ['PRICE_TABLE']
table = dynamodb.Table(PRICE_TABLE)

def handler(event, context):
    for record in event['Records']:
        body = json.loads(record['body'])
        store = body['store']
        city = body['city']
        pk = body['pk']
        
        # 1. Fetch from Nominatim
        # Constructing search query (Store name + City + Bulgaria)
        search_query = f"{store}, {city}, Bulgaria"
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(search_query)}&format=json&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'PriceCompareBG/1.0 (contact@yourdomain.com)'})
        
        time.sleep(1.1) # Strict compliance with OSM 1-req-per-second policy
        
        lat, lng = None, None
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                if data:
                    lat, lng = str(data[0]['lat']), str(data[0]['lon'])
        except Exception as e:
            print(f"Geocoding failed for {search_query}: {e}")
            
        if not lat:
            continue # Exit if no coordinates found
            
        # 2. Update all items for this store in DynamoDB
        # First, query all items in this City/Week
        response = table.query(
            KeyConditionExpression="PK = :pk",
            ExpressionAttributeValues={":pk": pk}
        )
        
        # Filter for the specific store and update
        for item in response.get('Items', []):
            if item.get('StoreName') == store:
                table.update_item(
                    Key={'PK': item['PK'], 'SK': item['SK']},
                    UpdateExpression="SET Lat = :lat, Lng = :lng",
                    ExpressionAttributeValues={':lat': lat, ':lng': lng}
                )
                
    return {"statusCode": 200}