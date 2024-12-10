// 通知を作成する関数
let notificationId = null;
let currentContentDetails = "";  // 現在のcontentを保存
let currentDetailsContents = ""; // 現在のdetails_contentsを保存

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

function fetchAndNotify() {
  fetch('http://35.169.4.250/pageinfo.php')
    .then(response => {
      console.log("HTTPステータス:", response.status);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json(); // 取得したレスポンスをJSONとしてパース
    })
    .then(data => {
      console.log("取得したデータ:", data);

      // エラーメッセージが含まれているか確認
      if (data.error) {
        console.log("エラー:", data.error);
        showNotification(data.error);
      } else if (data.content) {
        // content のみを通知に表示
        const message = `${data.content}`; // contentだけを表示
        showNotification(message);

        // 現在のcontentとdetails_contentsを保存
        currentContentDetails = data.content;
        currentDetailsContents = data.details_contents;
      } else {
        console.log("データの形式が正しくありません。", data);
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

    // 詳しく見るボタンが押された場合、currentContentDetails と currentDetailsContents を使って URL を生成
    const content = currentContentDetails;  // 通知に表示された内容
    const detailsContents = currentDetailsContents;  // 詳細情報

    // test.php に content と details_contents をクエリパラメータとして渡す
    const url = `http://35.169.4.250/test.html?content=${encodeURIComponent(content)}&details_contents=${encodeURIComponent(detailsContents)}`;
    chrome.tabs.create({ url: url });
  }
});

// 通知を削除する関数
function clearNotification(id) {
  chrome.notifications.clear(id, () => {
    console.log("Notification cleared: ", id);
  });
}
