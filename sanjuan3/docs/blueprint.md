# サンファンプロジェクト ファイル構成

本プロジェクトのディレクトリ・ファイル構成と主な役割をまとめます。

## ルートディレクトリ

- `.clinerules`  
  開発ルールや仕様に関する記述。
- `.gitignore`  
  Git管理対象外ファイルの指定。
- `eslint.config.js`  
  ESLintの設定ファイル。
- `index.html`  
  アプリのエントリーポイントとなるHTML。
- `jest.config.cjs`  
  Jestテストの設定ファイル。
- `package.json` / `package-lock.json`  
  npmパッケージ管理ファイル。
- `README.md`  
  プロジェクト概要・利用方法など。
- `tsconfig*.json`  
  TypeScriptの設定ファイル。
- `vite.config.ts`  
  Viteの設定ファイル。

## docs/

- `index.md`  
  ドキュメントの目次。
- `rule.md`  
  ゲームルール詳細。
- `game.md`  
  ゲーム進行や仕様。
- `building.md`  
  建物カードの仕様。
- `bug.md`  
  バグ管理・報告。
- `blueprint.md`  
  （このファイル）ファイル構成の説明。

## public/

- `vite.svg`  
  公開用静的アセット。

## src/

- `App.tsx`  
  メインReactコンポーネント。
- `App.css` / `index.css`  
  スタイルシート。
- `main.tsx`  
  アプリのエントリーポイント。
- `buildings.ts`  
  建物カードの定義。
- `vite-env.d.ts`  
  Vite用型定義。
- `setupTests.ts`  
  テストセットアップ。
- `hooks/useSanJuanGame.ts`  
  ゲーム進行用カスタムフック。

### src/components/

- `BuildChoice.tsx`  
  建設選択UI。
- `CouncilChoice.tsx`  
  参議選択UI。
- `CpuArea.tsx`  
  CPUプレイヤー表示。
- `MessageArea.tsx`  
  メッセージ表示。
- `PlayerArea.tsx`  
  プレイヤー表示。
- `PlayerBuildings.tsx`  
  プレイヤーの建物表示。
- `PlayerHand.tsx`  
  プレイヤーの手札表示。
- `RoleButtons.tsx`  
  役割選択ボタン。
- `SellChoice.tsx`  
  売却選択UI。
- `__tests__/`  
  各コンポーネントのテスト。

### src/gameActions/

- `builder.ts`  
  建設アクション処理。
- `councilor.ts`  
  参議アクション処理。
- `merchant.ts`  
  商人アクション処理。
- `overseer.ts`  
  監督アクション処理。
- `prospector.ts`  
  探鉱者アクション処理。
- `__tests__/`  
  各アクションのテスト。