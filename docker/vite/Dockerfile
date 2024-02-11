# slim系のnodeから構築することを定義
FROM node:20-bullseye-slim
# コンテナ内の作業ディレクトリを作成
WORKDIR /var/www/html
# パッケージ一覧(インデックス)を更新
RUN apt update \
    && yarn install
# ポート番号5173でコンテナを公開
EXPOSE 5173
