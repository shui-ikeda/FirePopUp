// worker.js
onmessage = function(e) {
    console.log('Worker received message:', e.data);
    // タスクの処理を行う
    postMessage("処理完了");
  };
  