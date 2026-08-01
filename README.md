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

## 方針

- 解説は独自執筆。解答 PDF の文言・図は転載しない
- PDF はリポジトリに入れない（`.gitignore` で `*.pdf`）
- 下書きは frontmatter の `draft: true` で本番ビルドから除外

## Cloudflare Pages

- プロジェクト名: `kosen-math`
- Build command: `pnpm build`
- Output directory: `dist`
- カスタムドメイン: `kosen-math.r31bn1z.com`
