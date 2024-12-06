chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});
  
// 通知を作成する関数
let notificationId = null;

function showNotification() {
  chrome.notifications.create({
    type: "basic",                     // 通常の通知形式
    iconUrl: "icons/icon128.png",      // 通知全体のアイコン(固定)
    title: "今日の豆知識",              // 通知タイトル(固定)
    message: "火災は実は・・・",        // 通知メッセージ(現在は仮で，今後はデータベースに登録した豆知識のタイトル)
    priority: 2,                       // 通知の優先度
    buttons: [                         // 通知にボタンを追加
      { title: "いいね 👍" },           // 1つ目のボタン
      { title: "詳しく見る 🔗" }         // 2つ目のボタン
    ]
  }, (id) => {
    notificationId = id;  // 通知IDを保存
    if (chrome.runtime.lastError) {
      console.error("Error creating notification: ", chrome.runtime.lastError); // 何らかの問題で通知が生成されない
    } else {
      console.log("Notification created with ID: ", notificationId); // 通知が正常に生成された
    }
  });
}

// 定期的に通知を表示する（10秒ごと）
setInterval(() => {
  showNotification();
}, 6000); // 10秒

// ボタンのクリックイベントリスナー
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // いいねボタンがクリックされた場合
    console.log("いいねボタンが押されました！");
    
    // いいねボタンを非表示にして、通知を更新
    chrome.notifications.update(notificationId, {
      buttons: [],  // 「いいね」ボタンを削除
      iconUrl: "icons/good01.jpg",  // アイコンを変更
      title: "いいねが押されました！",  // タイトルを更新
    });
  } else if (buttonIndex === 1) {
    // 詳しくボタンがクリックされた場合
    console.log("詳しくボタンが押されました！");
    chrome.tabs.create({ url: "http://35.169.4.250/test.html" }); // 詳細リンクを開く
    
  }
});

