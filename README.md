AIで作ったゲームをあげていく

## プロジェクト構成

- `/menu` - メインメニュー画面（https://kekoyana.github.io/ai_game/）
- `/evolife` - 生命進化シミュレーションゲーム（https://kekoyana.github.io/ai_game/evolife/）

## デプロイ方法

このプロジェクトはGitHub Pagesを使用してデプロイされます。

### セットアップ手順

1. リポジトリの設定を開く（Settings）
2. Pages設定を開く（Settings > Pages）
3. "Build and deployment" セクションで、以下のように設定：
   - Source: GitHub Actions

### デプロイの仕組み

- mainブランチにプッシュすると、自動的にGitHub Actionsが実行されます
- ビルドとデプロイは `.github/workflows/deploy.yml` で定義されています
- デプロイが完了すると、以下のURLでアクセス可能になります：
  - メインメニュー: https://kekoyana.github.io/ai_game/
  - Evolife: https://kekoyana.github.io/ai_game/evolife/

## 新しいゲームの追加方法

1. 新しいゲームのディレクトリを作成（例: `/newgame`）
2. ゲームの実装
3. `.github/workflows/deploy.yml` にビルド設定を追加
4. `menu/index.html` のゲーム一覧に新しいゲームを追加
