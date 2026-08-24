# AIR, the shop that sells nothing

One file: `index.html`. No build step, no dependencies, no backend, no wallet
connection. Everything the ledger shows is read from public chain APIs in the
visitor's own browser.

## Run it

```bash
python -m http.server 8787 --bind 127.0.0.1 --directory .
```

Then open http://localhost:8787.

**Serve it over http(s). Don't open the file directly.** From `file://` the
browser blocks the chain API calls and the ledger will show "no answer" for
every chain. Any static host works: Netlify, Vercel, Cloudflare Pages, GitHub
Pages, an S3 bucket. Upload `index.html` alone.

**Do not upload `PRIVATE-KEYS.DO-NOT-SHARE.txt`.** Move it to a password
manager and delete it from this folder before you deploy anything.

## How a purchase works

1. The buyer types a line into the composer on the page.
2. The page encodes it: hex for EVM, plain text for Solana memo and Bitcoin
   OP_RETURN, and they paste it into their wallet's data field.
3. They send any amount to the matching address.
4. The page reads the transaction back off-chain, decodes the inscription, and
   ranks everyone by USD value at the current spot price.

Nothing is stored on the site. The inscription lives in the transaction itself,
written by the sender, which is why this needs no database and no server.

## Chains read

| Chain | Source | Message carried in |
|---|---|---|
| Ethereum | eth.blockscout.com | transaction `input` data |
| Base | base.blockscout.com | transaction `input` data |
| Arbitrum | arbitrum.blockscout.com | transaction `input` data |
| Bitcoin | blockstream.info, falls back to mempool.space | `OP_RETURN` output |
| Solana | solana-rpc.publicnode.com | Memo program instruction |

Prices come from CoinGecko, falling back to Coinbase, falling back to hardcoded
approximations that are labelled as indicative when used.

Optimism was in the original plan and is not here: no free Blockscout instance
for it currently answers browser requests. To add a chain, append an entry to
`EVM_CHAINS`. Anything Blockscout-hosted with native ETH works unchanged. A
chain with a different native token also needs a price entry.

## Before you promote it

Send a small amount to each of the three addresses and move it back out again.
Confirm you control all three while nothing is at stake. The addresses were
generated on this machine and the crypto was checked against published test
vectors, but a live round-trip is the only proof that matters.

## Notes on the design

The night-window world is drawn procedurally: the stippled sky gradient, the
ember sun that rises as you scroll, the sodium city lights, the grain, so the
page carries no image payload and stays sharp at any size. If you want the
reference paintings in it instead, save them into `assets/` and they can be
layered behind the canvas. Worth checking who holds the rights first if the
site goes public; that airbrush work looks like it has an author.

---

Designed by Benevolent.
