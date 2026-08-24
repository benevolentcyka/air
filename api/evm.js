// Keeps the Etherscan API key server-side.
//
// The page is static and its source is public, so the key can never live in
// index.html. It lives in the ETHERSCAN_API_KEY environment variable and only
// this function ever sees it. The treasury address is hardcoded so the endpoint
// cannot be used as an open relay for someone else's queries against our quota.

const TREASURY = '0x5B3EDA91c4D2989F6e256095fF27230196149E57';

// Etherscan V2: one key, many chains.
const CHAINS = { 1: 'Ethereum', 8453: 'Base', 42161: 'Arbitrum', 10: 'Optimism' };

module.exports = async (req, res) => {
  const chainid = Number(req.query && req.query.chainid);
  if (!CHAINS[chainid]) {
    return res.status(400).json({ status: '0', message: 'unsupported chain' });
  }

  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) {
    // Not configured is not an error worth shouting about: the page falls back
    // to keyless public explorers on its own.
    return res.status(503).json({ status: '0', message: 'no key configured' });
  }

  const url = 'https://api.etherscan.io/v2/api'
    + '?chainid=' + chainid
    + '&module=account&action=txlist'
    + '&address=' + TREASURY
    + '&sort=desc&page=1&offset=60'
    + '&apikey=' + encodeURIComponent(key);

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!upstream.ok) {
      return res.status(502).json({ status: '0', message: 'upstream ' + upstream.status });
    }
    const data = await upstream.json();
    // Let Vercel's CDN absorb repeat traffic so one viral hour cannot burn the quota.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (e) {
    // Never surface the upstream URL: it contains the key.
    return res.status(502).json({ status: '0', message: 'upstream unavailable' });
  }
};
