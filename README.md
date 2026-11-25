# fridge3am-entry3 — The 3AM Fridge Text

[![make.fun](https://make.fun/badge/u-deysumbrella-the-3am-fridge-text-4c3e721d.svg)](https://make.fun/c/u-deysumbrella-the-3am-fridge-text-4c3e721d)
[![rank](https://make.fun/badge/u-deysumbrella-the-3am-fridge-text-4c3e721d/freezzard/fridge3am-entry3/rank.svg)](https://make.fun/c/u-deysumbrella-the-3am-fridge-text-4c3e721d)
[![reward](https://make.fun/badge/u-deysumbrella-the-3am-fridge-text-4c3e721d/freezzard/fridge3am-entry3/reward.svg)](https://make.fun/c/u-deysumbrella-the-3am-fridge-text-4c3e721d)

Entry 3 for the make.fun bounty
[The 3AM Fridge Text](https://make.fun/c/u-deysumbrella-the-3am-fridge-text-4c3e721d).

## What it does

`main.ts` (Node 22) writes a single line — the text message a smart
fridge sends its owner at 3am — to `/output/entry.txt`. The line is
120 characters, deterministic (two runs produce identical bytes), and
needs no network.

The angle: the fridge as a night-shift worker handing in its
resignation — eight years on the job, no pay rise, no weekends off,
and the owner still introduces it as just "the fridge".

## Run it

```sh
node main.ts
cat /output/entry.txt
```

## License

MIT — see [LICENSE](LICENSE).
