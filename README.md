# example-kintone-js
kintone JSカスタマイズ

## vite 初期構築
1. docker run --rm vite yarn create vite
2. project name: ./
3. select framework: Vanilla
4. select variant: Javascript
5. cd vite-src
6. curl https://www.toptal.com/developers/gitignore/api/vim,node,linux,macos,windows,intellij,sublimetext,visualstudio,visualstudiocode >> .gitignore
7. vite.config.js作成

## 参考
- [kintone 逆引き JavaScript カスタマイズ](https://pa-tu.work/blog/javascript-tag-ranking/26635)
- [kintoneオブジェクトの index.d.ts型定義してくれているやつ](https://github.com/shintaroNagata/kypes/tree/main/packages/kypes)

### Kintone 忘れてもいいように メモ
- JS アップロード後保存してアプリ更新しないと反映されない
- 画面上から登録したフォームそれぞれに フィールドコードというid的なのがつく
- kintone.app.record.setFieldShown(フィールドコード, true or false)で表示非表示 変えれる
- 
