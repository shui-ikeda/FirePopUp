document.getElementById("clickMe").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "popup_clicked" });
});
