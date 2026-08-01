# 高専の数学解説 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Astro SSG で「高専の数学解説」MVPを構築し、1年生の階層ナビ＋数問の独自解説を `https://kosen-math.r31bn1z.com` で公開する。

**Architecture:** `content/math1/` の MDX をビルド時に収集し、章→節→問題の静的ルートを生成する。`draft: true` は本番から除外。Cloudflare Pages（static `dist/`）＋カスタムドメイン `kosen-math.r31bn1z.com`。

**Tech Stack:** Astro 5、MDX、KaTeX（remark-math / rehype-katex）、TypeScript、pnpm、Vitest、Cloudflare Pages

**Spec:** `docs/superpowers/specs/2026-08-01-kosen-math-design.md`

## Global Constraints

- サイト名は必ず「高専の数学解説」
- 本番ホストは `kosen-math.r31bn1z.com`（Pages プロジェクト名 `kosen-math`）
- 準拠は「高専の数学1」を明示。解説は独自執筆のみ
- 解答 PDF をリポジトリ・デプロイ成果物に含めない
- MVP は1年生のみ。ヒント折りたたみ・検索・CMS・暗色テーマは作らない
- パッケージマネージャは `pnpm`
- Git identity 未設定の環境では `git commit` 前にユーザーへ identity 確認（`git config` は変更しない）

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `package.json` | scripts: `dev`, `build`, `preview`, `test` |
| `astro.config.mjs` | static output, MDX + math plugins, site URL |
| `tsconfig.json` | strict TS |
| `.gitignore` | `node_modules`, `dist`, `.env`, `*.pdf`, `.astro` |
| `src/content.config.ts` | content collection schema（chapter/section/problem） |
| `src/lib/math1.ts` | 一覧取得、draft 除外、前後問、パンくず用データ |
| `src/lib/math1.test.ts` | Vitest |
| `src/styles/global.css` | ライト基調・本文幅・数式余白 |
| `src/layouts/BaseLayout.astro` | HTML skeleton、KaTeX CSS、サイト名 |
| `src/components/Breadcrumb.astro` | パンくず |
| `src/components/PrevNext.astro` | 前へ / 次へ |
| `src/components/TextbookNote.astro` | 準拠注記 |
| `src/pages/index.astro` | トップ |
| `src/pages/about.astro` | 免責・使い方 |
| `src/pages/404.astro` | 404 |
| `src/pages/1/index.astro` | 1年 章一覧 |
| `src/pages/1/[chapter]/index.astro` | 章の節一覧 |
| `src/pages/1/[chapter]/[section]/index.astro` | 節の問題一覧 |
| `src/pages/1/[chapter]/[section]/[problem].astro` | 問題ページ |
| `content/math1/ch01/meta.json` | 章メタ |
| `content/math1/ch01/s01/meta.json` | 節メタ |
| `content/math1/ch01/s01/q01.mdx` … | サンプル解説（数問） |
| `public/favicon.svg` | 簡易ファビコン |
| `README.md` | 開発・デプロイ手順 |

---

### Task 1: Astro プロジェクト土台

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `README.md`, `public/favicon.svg`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`
- Modify: （なし・空リポジトリ）

**Interfaces:**
- Consumes: なし
- Produces: `pnpm build` が空に近いトップページを `dist/` に出すこと

- [ ] **Step 1: 依存関係と設定ファイルを作成**

`package.json`:

```json
{
  "name": "kosen-math",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "packageManager": "pnpm@11.18.0"
}
```

続けて依存を入れる:

```bash
cd /home/r3ibniz/Desktop/kosen
pnpm add astro @astrojs/mdx remark-math rehype-katex katex
pnpm add -D typescript vitest @types/node
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://kosen-math.r31bn1z.com',
  output: 'static',
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  ],
});
```

`tsconfig.json` は Astro strict プリセット相当:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`.gitignore`:

```
node_modules/
dist/
.astro/
.env
.env.*
*.pdf
.DS_Store
```

- [ ] **Step 2: 最小レイアウトとトップページ**

`src/styles/global.css` — CSS 変数でライト基調、本文 `max-width: 42rem`、行間 1.7。紫グラデやカード多用はしない。

`src/layouts/BaseLayout.astro` — `<title>` は `${pageTitle} | 高専の数学解説`。KaTeX CSS を CDN ではなく `katex/dist/katex.min.css` を import。ヒーロー級にサイト名を出さず、レイアウトはシェルのみ（トップでブランドを出す）。

`src/pages/index.astro` — サイト名「高専の数学解説」を `h1`、短い説明1文、CTA「1年生の解説へ」→ `/1/`、「このサイトについて」→ `/about/`。

`public/favicon.svg` — 単純な文字マークで可。

`README.md` — `pnpm install` / `pnpm dev` / `pnpm build`、PDF を入れないこと、準拠方針を短く記載。

- [ ] **Step 3: ビルド確認**

```bash
pnpm install
pnpm build
```

Expected: exit 0、`dist/index.html` が存在

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json .gitignore README.md public src
git commit -m "$(cat <<'EOF'
chore: scaffold Astro site for 高専の数学解説

EOF
)"
```

（git identity エラーならユーザーに name/email を確認してから再実行。`git config` は変更しない）

---

### Task 2: コンテンツモデルと math1 ヘルパー（TDD）

**Files:**
- Create: `src/lib/math1.ts`, `src/lib/math1.test.ts`, `vitest.config.ts`, `content/math1/_fixture/` は使わずテストはインメモリ型で
- Create: `src/content.config.ts`（Astro Content Layer）
- Create: サンプルメタ＋MDX（draft あり/なし）は Task 3 で本番用を置き、ここではテスト用フィクスチャ関数を `math1.ts` 内に純関数として分離

**Interfaces:**
- Consumes: なし
- Produces:
  - `export type ProblemMeta = { chapter: string; section: string; problem: string; title: string; order: number; draft?: boolean }`
  - `export function filterPublished<T extends { draft?: boolean }>(items: T[]): T[]` — `draft === true` を除外
  - `export function sortByOrder<T extends { order: number }>(items: T[]): T[]`
  - `export function neighbors<T extends { problem: string }>(items: T[], currentProblem: string): { prev: T | null; next: T | null }`
  - `export function problemHref(chapter: string, section: string, problem: string): string` — `/1/${chapter}/${section}/${problem}/`

- [ ] **Step 1: Vitest 設定と失敗するテストを書く**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

`src/lib/math1.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterPublished, neighbors, problemHref, sortByOrder } from './math1';

describe('filterPublished', () => {
  it('excludes draft:true and keeps undefined/false', () => {
    const items = [
      { id: 'a', draft: true },
      { id: 'b' },
      { id: 'c', draft: false },
    ];
    expect(filterPublished(items).map((x) => x.id)).toEqual(['b', 'c']);
  });
});

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    expect(sortByOrder([{ order: 2 }, { order: 1 }]).map((x) => x.order)).toEqual([1, 2]);
  });
});

describe('neighbors', () => {
  it('returns prev/next within sorted list', () => {
    const items = [{ problem: 'q01' }, { problem: 'q02' }, { problem: 'q03' }];
    expect(neighbors(items, 'q02')).toEqual({
      prev: items[0],
      next: items[2],
    });
    expect(neighbors(items, 'q01').prev).toBeNull();
    expect(neighbors(items, 'q03').next).toBeNull();
  });
});

describe('problemHref', () => {
  it('builds trailing-slash path', () => {
    expect(problemHref('ch01', 's01', 'q01')).toBe('/1/ch01/s01/q01/');
  });
});
```

- [ ] **Step 2: テスト実行（失敗を確認）**

```bash
pnpm test
```

Expected: FAIL（`math1.ts` 未作成または export 不足）

- [ ] **Step 3: 最小実装**

`src/lib/math1.ts` に上記4関数を実装。`filterPublished` は `item.draft !== true`。`neighbors` は配列順を前提（呼び出し側が `sortByOrder` 済み）。

- [ ] **Step 4: テスト成功を確認**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 5: Content config を追加**

`src/content.config.ts` — glob で問題 MDX を読む。frontmatter:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const problems = defineCollection({
  loader: glob({
    pattern: '**/q*.mdx',
    base: './content/math1',
  }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().positive(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { problems };
```

章・節メタは JSON:

- `content/math1/ch01/meta.json` → `{ "title": "第1章 …", "order": 1 }`
- `content/math1/ch01/s01/meta.json` → `{ "title": "§1 …", "order": 1 }`

`src/lib/math1.ts` にファイルシステムから章/節を読む関数は Task 3 でページから呼ぶ形に広げてよい。この Task では schema と純関数まで。

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/lib src/content.config.ts
git commit -m "$(cat <<'EOF'
feat: add math1 content helpers and collection schema

EOF
)"
```

---

### Task 3: 章立てサンプルコンテンツ（1章・数問）

**Files:**
- Create: `content/math1/ch01/meta.json`
- Create: `content/math1/ch01/s01/meta.json`
- Create: `content/math1/ch01/s01/q01.mdx`, `q02.mdx`
- Create: `content/math1/ch01/s01/q99.mdx`（`draft: true` — 一覧に出ないことの確認用）

**Interfaces:**
- Consumes: content collection schema（Task 2）
- Produces: 公開2問＋下書き1問。本文は**独自の短い解説**（二次方程式の解の公式の使い方など、教科書の特定解答文を転記しない）。タイトルは「問1」形式。

- [ ] **Step 1: メタと MDX を作成**

`q01.mdx` 例:

```mdx
---
title: 問1
order: 1
---

方針を一文で述べ、途中式を KaTeX で書き、最後に答えを書く。

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

`q99.mdx` は `draft: true` と「下書き」本文のみ。

章・節の `title` は「高専の数学1」の実際の章名に合わせられる範囲で仮置きし、後で PDF 画像を見ながら正確化してよい。不明なら `第1章` / `§1` でよい。

- [ ] **Step 2: Commit**

```bash
git add content
git commit -m "$(cat <<'EOF'
content: add sample year-1 chapter problems

EOF
)"
```

---

### Task 4: 階層ページと問題ページ

**Files:**
- Create: `src/lib/catalog.ts`（content + fs から章/節/公開問題を組み立て）
- Create: `src/components/Breadcrumb.astro`, `TextbookNote.astro`, `PrevNext.astro`
- Create: `src/pages/about.astro`, `src/pages/404.astro`
- Create: `src/pages/1/index.astro`
- Create: `src/pages/1/[chapter]/index.astro`
- Create: `src/pages/1/[chapter]/[section]/index.astro`
- Create: `src/pages/1/[chapter]/[section]/[problem].astro`
- Modify: `src/pages/index.astro`（リンク確認）

**Interfaces:**
- Consumes: `filterPublished`, `sortByOrder`, `neighbors`, `problemHref`, Astro `getCollection('problems')`
- Produces:
  - `getCatalog(): Promise<Catalog>` where chapter/section ids はディレクトリ名 `ch01`, `s01`
  - problem entry id から `chapter`/`section`/`problem` を path 解析（例: `ch01/s01/q01`）

- [ ] **Step 1: `catalog.ts` を実装**

- `getCollection('problems')` → id を `/` 分割して chapter/section/problem を得る
- `filterPublished` 後、章・節ごとにグループ
- 各章/節の `meta.json` を `fs.readFile` + `JSON.parse`（ビルド時のみ）
- 公開問題が0件の節は一覧に出さない

- [ ] **Step 2: 共有コンポーネント**

`TextbookNote.astro` — 「本解説は『高専の数学1』の問題番号に準拠した独自の説明です。公式解答の転載ではありません。」

`Breadcrumb.astro` — props: `items: { href?: string; label: string }[]`

`PrevNext.astro` — props: `prevHref`, `prevLabel`, `nextHref`, `nextLabel`（null ならその側非表示）

- [ ] **Step 3: ページ実装**

- `/about/` — 準拠・独自解説・PDF非掲載・学習補助である旨
- `/404` — 「ページが見つかりません」＋ `/1/` へのリンク
- `/1/` — 章一覧（title + link）
- `/1/[chapter]/` — 節一覧
- `/1/[chapter]/[section]/` — 公開問題一覧のみ
- 問題ページ — 見出し、TextbookNote、`<Content />`、PrevNext（同一節内）

`getStaticPaths` は公開問題のみ生成。draft の q99 はパスを生やさない。

- [ ] **Step 4: ビルドと目視**

```bash
pnpm build
pnpm preview
```

確認:
- `/1/ch01/s01/q01/` と `q02/` が存在する
- `q99` が `dist` に無い
- 数式が HTML に KaTeX 出力されている
- パンくずと前後リンクが破綻していない

- [ ] **Step 5: Commit**

```bash
git add src content
git commit -m "$(cat <<'EOF'
feat: add year-1 navigation and problem pages

EOF
)"
```

---

### Task 5: UI 仕上げ（トップのブランドと読みやすさ）

**Files:**
- Modify: `src/styles/global.css`, `src/pages/index.astro`, `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: 既存ページ
- Produces: 第一画面でサイト名がヒーロー級、本文幅・数式余白が読みやすいこと

- [ ] **Step 1: トップを1構成にする**

第一ビューはサイト名、短い一文、CTA（1年へ / about）のみ。統計・カードグリッド・紫テーマは置かない。背景はごく薄いグラデまたは紙風のテクスチャ程度。

- [ ] **Step 2: 問題ページのタイポ**

本文フォントは読みやすい和文＋数式。`katex` 周辺に `margin-block` を確保。

- [ ] **Step 3: `pnpm build` 再確認後 Commit**

```bash
git add src
git commit -m "$(cat <<'EOF'
style: refine landing and reading layout

EOF
)"
```

---

### Task 6: Cloudflare Pages デプロイとカスタムドメイン

**Files:**
- Create: （任意）`.node-version` or 記載を README に追加
- Modify: `README.md`（Pages 設定値）
- Modify: `docs/superpowers/specs/2026-08-01-kosen-math-design.md` ステータスを Approved に更新

**Interfaces:**
- Consumes: Cloudflare MCP `execute`（account 既存）、ゾーン `r31bn1z.com` id `8d5f40f5d7cd3f5743e4ef8054344a37`
- Produces: 本番 `https://kosen-math.r31bn1z.com` が 200

- [ ] **Step 1: GitHub（または接続先）へ push**

ユーザーがリモート未作成なら `gh repo create` を提案し、明示承認後に実行。リモート無しでは Pages の Git 連携ができない。

- [ ] **Step 2: Pages プロジェクト作成**

Build 設定:
- Framework preset: Astro（または None）
- Build command: `pnpm build`
- Output directory: `dist`
- Node version: `24`（またはプロジェクトに合わせる）
- プロジェクト名: `kosen-math`

Cloudflare API / MCP で作成可能な場合は API、不可ならダッシュボード手順を README に残す。

- [ ] **Step 3: カスタムドメイン**

Pages に `kosen-math.r31bn1z.com` を追加。同一アカウントのゾーンなので、通常は DNS レコードが自動作成される。完了後:

```bash
xh https://kosen-math.r31bn1z.com/
```

Expected: 200、本文に「高専の数学解説」

- [ ] **Step 4: 成功基準チェックリスト**

- [ ] トップ・about・1年ナビが公開
- [ ] 数問が問題 URL で読める
- [ ] 数式表示 OK
- [ ] リポジトリに PDF 無し
- [ ] 準拠・免責が about / 注記で確認できる

- [ ] **Step 5: Commit（ドキュメント）**

```bash
git add README.md docs/superpowers/specs/2026-08-01-kosen-math-design.md
git commit -m "$(cat <<'EOF'
docs: mark design approved and document Pages deploy

EOF
)"
```

---

## Spec coverage (self-review)

| Spec 要件 | Task |
|-----------|------|
| Astro + MDX + KaTeX + Pages | 1, 4, 6 |
| URL 階層 /1/ch/s/q | 4 |
| draft 除外 | 2, 3, 4 |
| 問題ページ構成・準拠注記 | 4 |
| about 免責 | 4 |
| PDF 非掲載 | 1 `.gitignore`, Global Constraints |
| サイト名・ドメイン | 1, 5, 6 |
| 最小テスト | 2 |
| 404 | 4 |
| MVP 数問 | 3 |

PDF からの「行間埋め」大量執筆は本プランの範囲外（サイト基盤が先）。コンテンツ拡充は別プラン／別セッション。

## Placeholder scan

TBD/TODO なし。コミットは identity 制約を Global Constraints に明記済み。
