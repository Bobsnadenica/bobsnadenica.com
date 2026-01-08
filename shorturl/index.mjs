import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;
const DOMAIN = process.env.DOMAIN_URL;

const generateId = () => randomBytes(4).toString("hex");

export const handler = async (event) => {
  const { rawPath, requestContext, body } = event;
  const method = requestContext.http.method;

  // 1. Handle Redirect (GET /xyz)
  if (method === "GET") {
    const shortId = rawPath.substring(1); 
    if (!shortId || shortId === "favicon.ico") return { statusCode: 404 };

    try {
      const data = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { shortId }
      }));

      if (!data.Item) return { statusCode: 404, body: "Not Found" };

      return {
        statusCode: 301,
        headers: { Location: data.Item.longUrl }
      };
    } catch (e) {
      console.error(e);
      return { statusCode: 500 };
    }
  }

  // 2. Handle Creation (POST /create)
  if (method === "POST" && rawPath === "/create") {
    try {
      const { url } = JSON.parse(body);
      if (!url) return { statusCode: 400, body: "Missing URL" };

      const shortId = generateId();
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { shortId, longUrl: url, createdAt: Date.now() }
      }));

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortUrl: `${DOMAIN}/${shortId}` })
      };
    } catch (e) {
      console.error(e);
      return { statusCode: 500, body: e.message };
    }
  }

  return { statusCode: 400 };
};