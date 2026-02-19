# 相性チェッカー (Aisho Checker)

React + Vite + TypeScript + bun で構成した、学習用のローカルWebアプリです。

## セットアップ

```bash
bun install
bun run dev
```

## 主なコマンド

```bash
bun run dev
bun run build
bun run typecheck
bun run test
```

## ディレクトリ構造

```text
src/
  app/
    providers/
    router/
  features/
    person-selector/
    dashboard/
    date-entry/
    history-calendar/
    settings/
    help/
  entities/
  shared/
    config/
    lib/
    ui/
  storage/
    adapters/
      local/
      remote/
```

## 方針

- 6画面: 対象選択 / メイン / 入力 / 履歴 / 設定 / ヘルプ
- スコア計算: `sum(重要度 * 満足度) / sum(重要度)`
- 初期保存先: `localStorage`
- 将来Firebase移行: `src/storage/adapters/remote/` に閉じ込める設計
