/* import */
// TODO: コーディングのd.ts用のためリリース不要 import
// import '@shin-chan/kypes';

/* 内部利用定数 */
// Kintone フィールドコード要素
const KINTONE_FIELD_CODES = {
    // TODO:env
    // 入力 画像ファイル
    INPUT_IMAGE_FILE: 'display_image_file',
}
// イベント
const KINTONE_EVENTS = {
    // 新規追加 画面表示時
    ON_LOAD_OF_CREATE: ['mobile.app.record.create.show', 'app.record.create.show'],
    // 編集 画面表示時
    ON_LOAD_OF_EDIT: ['mobile.app.record.edit.show', 'app.record.edit.show'],
    // 新規追加 保存通信実行時
    ON_SUBMIT_OF_CREATE: ['mobile.app.record.create.submit', 'app.record.create.submit'],
    // 編集 保存通信実行時
    ON_SUBMIT_OF_EDIT: ['mobile.app.record.edit.submit', 'app.record.edit.submit'],
}

/* 内部参照 変数 */
// フォーム要素 一覧 = {Kintone フィールドコード: HTML要素}
let formElements = {}


/* 内部参照用関数 */
/**
 * 画面表示 (登録・編集時) ハンドラー
 * @param {KintoneEvent<string>} event キントーンイベント
 */
const onLoadOfCreateOrEdit = (event) => {
    // 初期化
    initialize();
    // イベント購読 ファイル変更 ※ 注意：kintoneのjsにてファイルアップロードさせた後に反応
    // TODO:問題発生 ... ファイル変更イベント → Kindone app/edit.jsが先に動く → kintone api(upload.json という)通信でアップロードしている？ → input type=file 上書き される
    // TODO:結論 ... インターセプトしてアップロードさせない様にするしかないかな？
    /**
     * TODO:今後の方針...
     *  1. kintoneのjsにてファイルアップロードさせる
     *  2. データ保存前に、アップロードした画像をダウンロード (app.record.create.submit)
     *  3. ダウンロードした画像を縮小
     *  4. input type fileにset(1で空になっているので多分いける)
     *  5. 4のinput changeイベント実行 (submit中だから無理か？)
     *  ※ 全ての画像(画像である判断は3で実施)に対して実行
     *
     *  1 ファイルアップロード 結果　https://d0003j89fgi7.cybozu.com/k/api/blob/upload.json?_ref=https%3A%2F%2Fd0003j89fgi7.cybozu.com%2Fk%2F6%2Fedit&name=p1hm92cb0416l422gr3fitc18mr2.tmp
     *  {"result":{"fileKey":"5a009093-d6c8-4de0-9d40-34168af0f36c","fileType":"JPEG","image":true,"text":false,"application":false,"thumbnailable":true,"orientation":"Horizontal"},"success":true}
     */
    // formElements[KINTONE_FIELD_CODES.INPUT_IMAGE_FILE].addEventListener('change', onChangeImageFile, false);
}

/** 初期化実行 */
const initialize = () => {
    // 値 初期化
    formElements = {};
    // 非表示用の input → 画面非表示
    hiddenOfResize();
    // {編集される要素: HTMLElementsオブジェクト化} 保持
    formElements = makeFormElements();
}

/**
 * リサイズ 画像入力 → 非表示
 */
const hiddenOfResize = () => {
    // kintone js appにて、リサイズ用の 隠しファイル 非表示へ
    kintone.app.record.setFieldShown(KINTONE_FIELD_CODES.INPUT_RESIZE_IMAGE_FILE, false);
    kintone.mobile.app.record.setFieldShown(KINTONE_FIELD_CODES.INPUT_RESIZE_IMAGE_FILE, false);
}

/**
 * 編集フォーム要素 一覧 生成
 * @return {Record<string, HTMLElement}>} 編集フォーム フィールド情報一覧
 */
const makeFormElements = () => {
    // Kintone フィールドコード要素分 編集フォーム フィールド情報一覧 生成
    const fieldElements = Object.values(KINTONE_FIELD_CODES)
        .map((fieldCode) => [fieldCode, findInputFileHTMLElementByFieldCode(fieldCode)]) // [Kintone フィールドコード要素, HTML要素] の形へ
    ;
    // 連想配列の形にして返却 {Kintone フィールドコード要素: HTML要素}
    return Object.fromEntries(fieldElements);
}

/**
 * Kintone フィールドコードの 追加・編集フォーム input file HTML要素検索
 * @param {string} fieldCode Kintone フィールドコード
 * @return {HTMLElement|undefined} HTML要素
 */
const findInputFileHTMLElementByFieldCode = (fieldCode = '') => {
    // フィールドコードの wrapper部分の HTML要素取得
    const wrapperElement = findFieldWrapperElement(fieldCode);
    // input type=file HTML要素取得
    return wrapperElement.querySelector('input[type=file]');
}
/**
 * Kintone フィールドコードのフィールド ラッパー（全体部）のHTML要素取得
 * @param {string} fieldCode Kintone フィールドコード
 * @return {HTMLElement|undefined} HTML要素
 */
const findFieldWrapperElement = (fieldCode) => {
    // フィールド情報取得
    const field = findFieldByFieldCode(fieldCode);
    if (!field) return void 0; // 見つからない

    // フィールドコードの Wrapper部分 HTML要素取得
    return document.getElementsByClassName(`value-${field.id}`)[0];
}

/**
 * Kintone フィールドコードのフィールド情報取得
 * @param {string} fieldCode Kintone フィールドコード
 * @return {{id: string, label: string,type: string, var: string, properties:{noLabel:'true'|'false',required:'true'|'false',isLookup:boolean}}|undefined} フィールド情報 検索結果
 * ※ 型 {"id":"5519914","label":"レコード番号","properties":{"noLabel":"false","required":"true","isLookup":false},"type":"RECORD_ID","var":"レコード番号"}'
 */
const findFieldByFieldCode = (fieldCode = '') => {
    // フィールド情報の一覧
    const fieldMaster = Object.values(cybozu.data.page.FORM_DATA.schema.table.fieldList);
    // フィールドコードから検索
    return fieldMaster.find((field) => field.var == fieldCode);
}

/**
 * 画面 (登録・編集時) 保存通信実行時 ハンドラー
 * @param {KintoneEvent<string>} event キントーンイベント
 */
const onSubmitOfCreateOrEdit =  async (event) => {
    // アップロードされた ファイル 一括ダウンロード [fileKey, Blob][] 形式
    const uploadedBlobsWithFileKey = await downloadOfUploadedFiles(KINTONE_FIELD_CODES.INPUT_IMAGE_FILE);

    // 画像だけにする [fileKey(画像ファイルだけ), Blob][]の形へ
    const uploadedImageBlobsWithFileKey = uploadedBlobsWithFileKey.filter(([,uploadedBlob]) => uploadedBlob.type.startsWith('image'));
    // 画像ファイル リサイズ

    // アップロードファイル 削除ボタン
    // const uploadImageRemoveElements = wrapperElement.querySelectorAll('button[id$=-pre-remove]');

    // TODO:テスト用 サブミットさせない
    return false;
}

/**
 * 指定フィールドの kintoneで自動的に アップロードされたファイル 一覧ダウンロード
 * @param {string} fieldCode kintone フィールドコード
 * @return {Promise<[string, Blob][]}>} ダウンロード結果の Blob一覧 TODO:画像だけにする挟みたいので、{fileKey: Blob}形式で でないとどれ消すの問題になりそう
 */
const downloadOfUploadedFiles = async (fieldCode) => {
    // 指定フィールドの ラッパー取得
    const wrapperElement = findFieldWrapperElement(fieldCode);
    // アップロードされた画像 一覧
    const uploadedImageElements = wrapperElement.querySelectorAll('img.gaia-ui-slideshow-thumbnail');
    if (!uploadedImageElements.length) return []; // アップロードされた画像なし → 何もしない

    // 各画像の src URL文字列 取得
    const srcURLs = Array.from(uploadedImageElements).map((e) => e.src);
    // 各画像の URL文字から kintone発行の fileKey 一覧取得
    const fileKeys = srcURLs.map((url) => new URL(url).searchParams.get('fileKey'));

    // 各画像のfileKey ダウンロード実行
    return await Promise.all(fileKeys.map(async (fileKey) => {
        // ダウンロード通信実行
        const response = await fetchKintoneDownload(fileKey);
        // ダウンロード結果の Blob取得
        return [fileKey, response.blob()];
    }));
}

/**
 * Kintoneの ファイルダウンロード通信実行
 * @param {string} fileKey ダウンロードファイルキー
 * @return {Promise<Response>} ダウンロード通信結果
 */
const fetchKintoneDownload = async (fileKey) => {
    try {
        // ダウンロード通信ヘッダー
        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
        };

        // Kintone ファイル ダウンロード通信実行
        return fetch(`/k/api/blob/download.do?fileKey=${fileKey}`, {
            method: 'GET',
            headers,
        });
    } catch (e) {
        console.error('バグる', e)
    }
}

/**
 * 画像 サイズリサイズ
 * @param {Blob} imageBlob 画像
 */
const resizeImage = (imageBlob) => {
    // 画像リサイズ用の読み込み器 用意
    const reader = new FileReader();
    // 画像読み込み時のハンドリング
    reader.onload = () => {
        console.log('縦横長い方を特定の長さに変える様にする （比率はそのまま')
        // if(image.width > image.height){
        //     // 横長の画像は横のサイズを指定値にあわせる
        //     var ratio = image.height/image.width;
        //     width = THUMBNAIL_WIDTH;
        //     height = THUMBNAIL_WIDTH * ratio;
        // } else {
        //     // 縦長の画像は縦のサイズを指定値にあわせる
        //     var ratio = image.width/image.height;
        //     width = THUMBNAIL_HEIGHT * ratio;
        //     height = THUMBNAIL_HEIGHT;
        // }
    }

    // 画像読み込み開始
    reader.readAsDataURL(imageBlob);
}

/* export */
// 画面表示時のイベント
(() => {
    'use strict';
    // TODO:問題発生 ... ファイル変更イベント → Kindone app/edit.jsが先に動く → kintone api(upload.json という)通信でアップロードしている？ → input type=file 上書き される
    // TODO:結論 ... インターセプトしてアップロードさせない様にするしかないかな？
    // // レコード追加画面 表示イベント 購読
    // kintone.events.on(KINTONE_EVENTS.ON_LOAD_OF_CREATE, onLoadOfCreateOrEdit);
    // // レコード編集画面 表示イベント 購読
    // kintone.events.on(KINTONE_EVENTS.ON_LOAD_OF_EDIT, onLoadOfCreateOrEdit);

    /**
     *  TODO:方針 ...
     *   1. kintoneのjsにてファイルアップロードさせる
     *   2. データ保存前に、アップロードした画像をダウンロード (app.record.create.submit)
     *   3. ダウンロードした画像を縮小
     *   4. input type fileにset(1で空になっているので多分いける)
     *   5. 4のinput changeイベント実行 (submit中だから無理か？)
     *   ※ 全ての画像(画像である判断は3で実施)に対して実行
     *   背景 ...
     *    添付ファイル変更 → kintone アップロード（自動）→ 添付ファイル空(input type file空)(次のファイル読み込み用) → 独自処理 = 空でしか読み込めない！
     *    のため、保存実行時に カスタマイズするの方針
     */
    // レコード追加画面 保存実行時イベント 購読
    kintone.events.on(KINTONE_EVENTS.ON_SUBMIT_OF_CREATE, onSubmitOfCreateOrEdit);
    // レコード編集画面 保存実行時イベント 購読
    kintone.events.on(KINTONE_EVENTS.ON_SUBMIT_OF_EDIT, onSubmitOfCreateOrEdit);
})();