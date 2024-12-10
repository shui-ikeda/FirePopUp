chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

// 通知を作成する関数
let notificationId = null;

function showNotification(message, icon = "icons/icon128.png") {
  chrome.notifications.create({
    type: "basic",
    iconUrl: icon,
    title: "今日の豆知識",
    message: message,
    priority: 2,
    buttons: [
      { title: "いいね 👍" },
      { title: "詳しく見る 🔗" }
    ]
  }, (id) => {
    notificationId = id;
    if (chrome.runtime.lastError) {
      console.error("Error creating notification: ", chrome.runtime.lastError);
    } else {
      console.log("Notification created with ID: ", notificationId);
    }
  });
}

// 通知を削除する関数
function clearNotification(id) {
  chrome.notifications.clear(id, () => {
    console.log("Notification cleared: ", id);
  });
}

function fetchAndNotify() {
  fetch('http://35.169.4.250/pageinfo.php')
    .then(response => {
      console.log("HTTPステータス:", response.status);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("取得したデータ:", data);
      
      // dataが配列であることを確認
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];  // 配列の最初の要素にアクセス
        console.log("category:", item.category);
        console.log("content:", item.content);
        console.log("details_contents:", item.details_contents);
        
        // メッセージの作成
        let message = "データ取得エラー";
        if (item.category && item.content && item.details_contents) {
          message = `${item.category}\n${item.content}\n${item.details_contents}`;
        }
        showNotification(message);
      } else {
        console.log("データが配列ではないか、空の配列です");
        showNotification("データの形式が正しくありません。");
      }
    })
    .catch(error => {
      console.error('Fetchエラー:', error);
      showNotification("データの取得に失敗しました。エラー内容をコンソールで確認してください。");
    });
}




// 定期的に通知を表示する関数
function notifyEvery10Seconds() {
  setInterval(fetchAndNotify, 10000);
}

// 通知を10秒ごとに表示する関数を開始
notifyEvery10Seconds();

// ボタンのクリックイベントリスナー
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    console.log("いいねボタンが押されました！");
    chrome.notifications.update(notificationId, {
      buttons: [],
      iconUrl: "icons/good01.jpg",
      title: "いいねが押されました！",
      message: "あなたのフィードバックをありがとう！"
    }, () => {
      clearNotification(notificationId); // 自動削除
    });
  } else if (buttonIndex === 1) {
    console.log("詳しくボタンが押されました！");
    chrome.tabs.create({ url: "http://35.169.4.250/pageinfo.php" });
  }
});
