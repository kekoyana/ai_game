# プエルトリコ（Puerto Rico）

React + TypeScript + Viteで実装したプエルトリコのボードゲーム

## 機能

- 役割選択とアクション実行
- プランテーション管理と生産
- 建物の建設と効果
- 商品の取引と出荷
- 商品の保管と廃棄
- ゲーム終了条件判定
- 最終得点計算

## 技術スタック

- React 18
- TypeScript 5
- Vite 4
- Vitest
- @testing-library/react

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone [リポジトリURL]
cd puertorico

# 依存関係のインストール（推奨）
npm install --legacy-peer-deps

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# テストカバレッジの確認
npm run test:coverage
```

## トラブルシューティング

依存関係のインストールでエラーが発生する場合、以下のいずれかの方法を試してください：

```bash
# 方法1: キャッシュをクリアして再インストール
npm cache clean --force
npm install --legacy-peer-deps

# 方法2: package-lock.jsonを削除して再インストール
rm -f package-lock.json
npm install --legacy-peer-deps

# 方法3: 厳密なピア依存関係チェックを無効化
npm install --force
```

## テスト

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test src/hooks/__tests__/useGameFlow.test.ts

# テストカバレッジレポートの生成
npm run test:coverage
```

## ディレクトリ構造

```
src/
  ├── components/     # Reactコンポーネント
  ├── hooks/         # カスタムフック
  ├── types/         # 型定義
  ├── utils/         # ユーティリティ関数
  └── test/          # テスト設定
```

## ゲームのルール

基本的なルールは[rule.md](./rule.md)を参照してください。

## ライセンス

MIT

## 貢献

1. Forkする
2. フィーチャーブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. Pull Requestを作成する

## 作者

[あなたの名前]
