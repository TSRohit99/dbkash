import axios from "axios";

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_TTL = 60000; // 1 minute cache
const RATE_LIMIT_INTERVAL = 2400; // 25 requests per minute = 1 request per 2.4 seconds

const cache = new Map();
let lastRequestTime = 0;

const sleep = (ms : number) => new Promise(resolve => setTimeout(resolve, ms));

const getTokenPriceInUSD = async (tokenId : string) => {
  // Check cache
  const cachedData = cache.get(tokenId);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  // Simple rate limiting
  const now = Date.now();
  const timeToWait = RATE_LIMIT_INTERVAL - (now - lastRequestTime);
  if (timeToWait > 0) {
    await sleep(timeToWait);
  }
  lastRequestTime = Date.now();

  try {
    const response = await axios.get(COINGECKO_API_URL, {
      params: {
        ids: tokenId,
        vs_currencies: 'usd',
      }
    });

    const data = response.data[tokenId];
    const result = {
      price: data.usd,
    };

    // Update cache
    cache.set(tokenId, { data: result, timestamp: Date.now() });

    return result;
  } catch (error : any) {
    console.error('Error fetching token price:', error.message);
    return null;
  }
};

export default getTokenPriceInUSD