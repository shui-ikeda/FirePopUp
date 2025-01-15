document.getElementById('saveButton').addEventListener('click', () => {
  const timeValue = document.getElementById('notificationTime').value;
  if (timeValue) {
    const [hour, minute] = timeValue.split(":").map(num => parseInt(num, 10));
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      const notifyTime = new Date();
      notifyTime.setHours(hour, minute, 0, 0); // 時刻を設定

      // 時刻をChromeのストレージに保存
      chrome.storage.local.set({ 'notifyTime': notifyTime.getTime() }, function() {
        alert('通知時刻が保存されました: ' + notifyTime.toLocaleTimeString());
        window.close(); // 保存後、ポップアップを閉じる
      });
    } else {
      alert('無効な時刻形式です。正しい時刻を入力してください。');
    }
  } else {
    alert('時刻が入力されませんでした。');
  }
});
