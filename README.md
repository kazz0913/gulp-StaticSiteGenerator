# 静的サイトジェネレータ

gulpを使った静的サイトジェネレータ
JavaScriptに関する部分はwebpackに投げてます。

できることは
- ejsのコンパイル
- scssのコンパイル
- jsのbundle
- サーバーの立ち上げとHMR

その他
- リセットCSSとしてress.cssをインストール済み
- ES6のトランスパイル設定済み

## 想定環境
- node v10.15.3

## インストール
```shell
git clone --depth 1 git@github.com:kazz0913/gulp-StaticSiteGenerator.git && cd gulp-StaticSiteGenerator && rm -rf ./.git ./README.md
```

## コマンド
```
# install
npm i

# build
npm run gulp

# watch
npm run dev
```
