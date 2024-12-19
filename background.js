// 通知を作成する関数
let notificationId = null;
let currentContentDetails = ""; // 現在のcontentを保存
let currentDetailsContents = ""; // 現在のdetails_contentsを保存

function showNotification(message, icon = "icons/icon128.png") {
  // 古い通知をクリア
  if (notificationId) {
    chrome.notifications.clear(notificationId, () => {
      console.log("古い通知をクリアしました。");
      createNotification(message, icon);
    });
  } else {
    createNotification(message, icon);
  }
}

function createNotification(message, icon) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "今日の豆知識",
    message: message,
    priority: 2, // 優先度を2に設定
    requireInteraction: true, // ユーザー操作を待つ
    buttons: [
      { title: "へぇー 😮" }, // いいねボタン
      { title: "詳しく見る 🔗" } // 詳しくボタン
    ]
  }, (id) => {
    notificationId = id;
    if (chrome.runtime.lastError) {
      console.error("Error creating notification: ", chrome.runtime.lastError.message);
    } else {
      console.log("Notification created with ID: ", notificationId);
    }
  });
}

// データを取得して通知を表示
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

      if (data.error) {
        console.log("エラー:", data.error);
        showNotification(data.error);
      } else if (data.content) {
        const message = `${data.content}`; // contentだけを表示
        showNotification(message);

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

chrome.notifications.onButtonClicked.addListener((id, buttonIndex) => {
  console.log("ボタンが押されました。通知ID:", id, "ボタンインデックス:", buttonIndex);

  if (id === notificationId) { // 現在の通知のみ反応
    if (buttonIndex === 0) { // へぇーボタンが押された場合
      console.log("へぇーボタンが押されました！");

      // 新しい通知を作成
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png", // 必要に応じて変更
        title: "へぇーボタンが押されました！",
        message: "へぇーボタンが押されました！詳細ボタンをクリックして知識を深めましょう！",
        priority: 0,
        requireInteraction: true,
        buttons: [
          { title: "詳しく見る 🔗" } // 詳細ボタンを追加
        ]
      }, (newNotificationId) => {
        // 新しい通知のIDをログ出力
        console.log("新しい通知ID: ", newNotificationId);

        // イベントリスナーを新しい通知に対応
        chrome.notifications.onButtonClicked.addListener((newId, newButtonIndex) => {
          if (newId === newNotificationId && newButtonIndex === 0) {
            console.log("新しい通知の詳細ボタンが押されました！");
            const url = `http://35.169.4.250/test.html?content=${encodeURIComponent(currentContentDetails)}&details_contents=${encodeURIComponent(currentDetailsContents)}`;
            chrome.tabs.create({ url: url });
          }
        });
      });

      // サーバーにPOSTリクエストを送信
      fetch('http://35.169.4.250/test.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `content_id=${encodeURIComponent(currentContentDetails)}`
      })
        .then(response => {
          console.log("HTTPステータス:", response.status);
          return response.text(); // 応答をテキストで確認
        })
        .then(data => {
          console.log("サーバー応答:", data);
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.success) {
              console.log("いいねカウントが更新されました！");
            } else {
              console.error("更新失敗:", jsonData.error);
            }
          } catch (e) {
            console.error("JSONパースエラー:", e, "サーバー応答:", data);
          }
        })
        .catch(error => console.error("リクエストエラー:", error));

    } else if (buttonIndex === 1) { // 詳しくボタンが押された場合
      console.log("詳しくボタンが押されました！");
      const url = `http://35.169.4.250/test.html?content=${encodeURIComponent(currentContentDetails)}&details_contents=${encodeURIComponent(currentDetailsContents)}`;
      chrome.tabs.create({ url: url });
    }
  }
});


