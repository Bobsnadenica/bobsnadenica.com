const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const PRICE_TABLE = process.env.PRICE_TABLE;

// Helper to calculate the current year-week matching the Python ingestion script
function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((now.getDay() + 1 + days) / 7);
    return `${now.getFullYear()}-${week.toString().padStart(2, '0')}`;
}

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const { cartItems, cityEkatte } = body;

        if (!cartItems || !Array.isArray(cartItems) || !cityEkatte) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing cartItems or cityEkatte" }) };
        }

        const currentWeek = getCurrentWeek();
        const physicalPk = `CITY#${cityEkatte}#WEEK#${currentWeek}`;
        const onlinePk = `CITY#ONLINE#WEEK#${currentWeek}`;

        // Fetch Physical Stores for City
        const physicalRes = await docClient.send(new QueryCommand({
            TableName: PRICE_TABLE,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: { ":pk": physicalPk }
        }));

        // Fetch Online Stores
        const onlineRes = await docClient.send(new QueryCommand({
            TableName: PRICE_TABLE,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: { ":pk": onlinePk }
        }));

        const allProducts = [...(physicalRes.Items || []), ...(onlineRes.Items || [])];

        // --- PRICING ENGINE ALGORITHM ---
        const physicalStores = {};
        const onlineStores = {};

        allProducts.forEach(prod => {
            if (prod.IsOnline) {
                if (!onlineStores[prod.StoreName]) onlineStores[prod.StoreName] = [];
                onlineStores[prod.StoreName].push(prod);
            } else {
                if (!physicalStores[prod.StoreName]) physicalStores[prod.StoreName] = [];
                physicalStores[prod.StoreName].push(prod);
            }
        });

        const findBestSingleStore = (storeGroup) => {
            let bestStore = null;
            let lowestTotal = Infinity;

            for (const [storeName, products] of Object.entries(storeGroup)) {
                let storeTotal = 0;
                const foundItems = new Set();

                cartItems.forEach(cartItem => {
                    const matches = products.filter(p => p.NormalizedName === cartItem);
                    if (matches.length > 0) {
                        const bestPrice = Math.min(...matches.map(m => m.PromoPrice));
                        storeTotal += bestPrice;
                        foundItems.add(cartItem);
                    }
                });

                const missing = cartItems.filter(item => !foundItems.has(item));
                
                // Prioritize finding the whole cart. Adjust logic here if partial carts are acceptable.
                if (missing.length === 0 && storeTotal < lowestTotal) {
                    lowestTotal = storeTotal;
                    // Grab coordinates from the first product in this store for map display
                    const locData = products[0]; 
                    bestStore = { 
                        store: storeName, total: storeTotal, missingItems: missing, 
                        lat: locData.Lat, lng: locData.Lng 
                    };
                }
            }
            return bestStore;
        };

        // Split Cart Logic
        let splitTotal = 0;
        const splitBreakdown = [];
        
        cartItems.forEach(cartItem => {
            const physicalMatches = (physicalRes.Items || []).filter(p => p.NormalizedName === cartItem);
            if (physicalMatches.length > 0) {
                physicalMatches.sort((a, b) => a.PromoPrice - b.PromoPrice);
                const cheapest = physicalMatches[0];
                splitTotal += cheapest.PromoPrice;
                splitBreakdown.push({ item: cartItem, store: cheapest.StoreName, price: cheapest.PromoPrice, lat: cheapest.Lat, lng: cheapest.Lng });
            }
        });

        const result = {
            cheapestSinglePhysicalStore: findBestSingleStore(physicalStores),
            cheapestOnlineStore: findBestSingleStore(onlineStores),
            cheapestSplitCart: { total: splitTotal, breakdown: splitBreakdown }
        };

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error("Engine Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};