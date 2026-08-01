# 高専の数学解説

『高専の数学1』に準拠した独自解説サイト（Astro SSG → Cloudflare Pages）。

本番: https://kosen-math.r31bn1z.com

## 開発

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## コンテンツ

問題解説は `content/math1/**/q*.md`（Markdown + KaTeX）。
`draft: true` のファイルは本番ビルドから除外される。

## 方針

- 解説は独自執筆。解答 PDF の文言・図は転載しない
- PDF はリポジトリに入れない（`.gitignore` で `*.pdf`）

## Cloudflare Pages

- プロジェクト名: `kosen-math`
- Build command: `pnpm build`
- Output directory: `dist`
- カスタムドメイン: `kosen-math.r31bn1z.com`
