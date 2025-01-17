let notificationId = null;
let currentContentDetails = ""; // 現在のcontentを保存
let currentDetailsContents = ""; // 現在のdetails_contentsを保存

chrome.runtime.onInstalled.addListener(() => {
  console.log("拡張機能がインストールされました");

  // 通知時刻が設定されている場合
  chrome.storage.local.get('notifyTime', (result) => {
    if (result.notifyTime) {
      const notifyTime = new Date(result.notifyTime);
      console.log("設定された通知時間:", notifyTime);
      setNotificationAtTime(notifyTime);
    } else {
      console.log("通知時間が設定されていません");
    }
  });
});

// 時刻に基づいて通知をスケジュールする
function setNotificationAtTime(targetTime) {
  const now = new Date();
  let timeUntilNotification = targetTime - now;

  // 時刻が過ぎている場合、次の日に設定
  if (timeUntilNotification < 0) {
    targetTime.setDate(targetTime.getDate() + 1);
    timeUntilNotification = targetTime - now;
  }
  
  console.log("次回通知までの時間 (ミリ秒):", timeUntilNotification);

  // アラームを設定（指定した時刻に通知をトリガー）
  chrome.alarms.create("notificationAlarm", {
    when: now.getTime() + timeUntilNotification
  });
}

// アラームイベントのリスナー
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "notificationAlarm") {
    console.log("指定した時刻になりました。通知を表示します。");
    fetchAndNotify(); // 通知を表示
  }
});

// 通知を表示する関数
function showNotification(message, icon = "icons/icon128.png") {
  if (notificationId) {
    chrome.notifications.clear(notificationId, () => {
      console.log("古い通知をクリアしました。");
      createNotification(message, icon);
    });
  } else {
    createNotification(message, icon);
  }
}

// 通知の作成
function createNotification(message, icon) {
  console.log("通知を作成: ", message);
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon128.png"),
    title: "豆知識通知",
    message: message,
    priority: 2,
    requireInteraction: true,
    buttons: [
      { title: "へぇ～ 😲" }, // へぇーボタン
      { title: "詳しく見る 🔗" } // 詳細ボタン
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
chrome.notifications.onButtonClicked.addListener((id, buttonIndex) => {
  console.log("ボタンが押されました。通知ID:", id, "ボタンインデックス:", buttonIndex);

  if (id === notificationId) { // 現在の通知のみ反応
    if (buttonIndex === 0) { // へぇーボタンが押された場合
      console.log("へぇ～ボタンが押されました！");

      // 新しい通知を作成
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("icons/icon128.png"), // 必要に応じて変更
        title: "へぇ～ボタンが押されました！",
        message: "へぇ～ボタンが押されました！詳細ボタンをクリックして知識を深めましょう！",
        priority: 0,
        requireInteraction: true,
        buttons: [
          { title: "詳しく見る 🔗" } // 詳細ボタンを追加
        ]
      }, (newNotificationId) => {
        console.log("新しい通知ID: ", newNotificationId);

        // 新しい通知のボタンがクリックされた場合
        chrome.notifications.onButtonClicked.addListener((newId, newButtonIndex) => {
          if (newId === newNotificationId && newButtonIndex === 0) {
            console.log("新しい通知の詳細ボタンが押されました！");
            const url = `http://3.211.139.122/test.html?content=${encodeURIComponent(currentContentDetails)}&details_contents=${encodeURIComponent(currentDetailsContents)}`;
            chrome.tabs.create({ url: url });
          }
        });
      });

      // サーバーにPOSTリクエストを送信
      fetch('http://3.211.139.122/test.php', {
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
          
          // サーバー応答が複数のJSONオブジェクトを含む場合、正しくパースするために分割
          const jsonObjects = data.split('}{').map((item, index, array) => {
            if (index > 0) item = '{' + item; // 開始部分の '{' を再追加
            if (index < array.length - 1) item = item + '}'; // 終了部分の '}' を再追加
            return JSON.parse(item); // 各部分をパース
          });

          // 各JSONオブジェクトを処理
          jsonObjects.forEach(jsonData => {
            if (jsonData.success) {
              console.log("成功:", jsonData.message);
            } else {
              console.error("エラー:", jsonData.message);
            }
          });
        })
        .catch(error => {
          console.error("リクエストエラー:", error);
        });

    } else if (buttonIndex === 1) { // 詳しくボタンが押された場合
      console.log("詳しくボタンが押されました！");
      const url = `http://3.211.139.122/test.html?content=${encodeURIComponent(currentContentDetails)}&details_contents=${encodeURIComponent(currentDetailsContents)}`;
      chrome.tabs.create({ url: url });
    }
  }
});

// データを取得し通知を表示
function fetchAndNotify() {
  fetch('http://3.211.139.122/pageinfo.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("データ取得完了:", data);
      if (data.error) {
        showNotification(data.error);
      } else if (data.content) {
        const message = `${data.content}`;
        showNotification(message);

        currentContentDetails = data.content;
        currentDetailsContents = data.details_contents;
      } else {
        showNotification("データの形式が正しくありません。");
      }
    })
    .catch(error => {
      console.error('Fetchエラー:', error);
      showNotification("データの取得に失敗しました。");
    });
}

// 時刻設定ページを表示
function setNotificationTimeForm() {
  const formHTML = `
    <div style="text-align: center; padding: 10px;">
      <h3>通知時刻を設定</h3>
      <input type="time" id="notificationTime" required>
      <button onclick="saveNotificationTime()">保存</button>
    </div>
  `;

  const popup = window.open("", "timeSettingPopup", "width=300,height=200");
  popup.document.write(formHTML);
}

// 時刻を保存
function saveNotificationTime() {
  const popup = window.open("", "timeSettingPopup");
  const timeValue = popup.document.getElementById("notificationTime").value;

  if (timeValue) {
    const [hour, minute] = timeValue.split(":").map(num => parseInt(num, 10));
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      const notifyTime = new Date();
      notifyTime.setHours(hour, minute, 0, 0); // 時刻を設定

      // 時刻をChromeのストレージに保存
      chrome.storage.local.set({ 'notifyTime': notifyTime.getTime() }, function() {
        console.log('通知時刻が保存されました: ' + notifyTime.toLocaleTimeString());

        // 設定後すぐに通知を表示
        setNotificationAtTime(notifyTime); // 通知を設定
        fetchAndNotify(); // 通知内容を即座に表示

        popup.close();
      });
    } else {
      alert('無効な時刻形式です。正しい時刻を入力してください。');
    }
  } else {
    alert('時刻が入力されませんでした。');
  }
}



// 時刻設定後、通知が正しくスケジュールされているか確認
function setDailyNotification(targetTime) {
  console.log("setDailyNotification: 次回通知時刻:", targetTime);
  const now = new Date();
  let timeUntilNotification = targetTime - now;

  if (timeUntilNotification < 0) {
    targetTime.setDate(targetTime.getDate() + 1);
    timeUntilNotification = targetTime - now;
  }

  console.log("次回通知までの時間 (ミリ秒):", timeUntilNotification);

  setTimeout(() => {
    console.log("通知を表示します。");
    fetchAndNotify(); // 通知内容を表示
    setDailyNotification(targetTime); // 次回の通知を設定
  }, timeUntilNotification); // 次回通知までの時間をセット
}

// fetchAndNotify の内部にログを追加
function fetchAndNotify() {
  console.log("fetchAndNotify: データ取得開始");
  fetch('http://3.211.139.122/pageinfo.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("データ取得完了:", data);
      if (data.error) {
        showNotification(data.error);
      } else if (data.content) {
        const message = `${data.content}`;
        showNotification(message);

        currentContentDetails = data.content;
        currentDetailsContents = data.details_contents;
      } else {
        showNotification("データの形式が正しくありません。");
      }
    })
    .catch(error => {
      console.error('Fetchエラー:', error);
      showNotification("データの取得に失敗しました。");
    });
}

// 時刻設定を初期化
function initializeNotificationTime() {
  chrome.storage.local.get('notifyTime', (result) => {
    if (result.notifyTime) {
      const notifyTime = new Date(result.notifyTime);
      console.log("設定された通知時間:", notifyTime);
      setDailyNotification(notifyTime); // 設定された通知時間で通知を設定
    } else {
      // 時刻設定のポップアップを開く
      chrome.runtime.openOptionsPage(); // 通知設定ページを開く
    }
  });
}

initializeNotificationTime(); // 通知時刻の設定を読み込む