const send = diff =>
    fetch("http://localhost:3456/", { method: "POST", body: diff });
  
  new MutationObserver(() => {
    document.querySelectorAll("code").forEach(code => {
      if (code.dataset.sent) return;
      if (code.innerText.trim().startsWith("diff --git")) {
        send(code.innerText).catch(console.error);
        code.dataset.sent = "1";
      }
    });
  }).observe(document.body, { childList: true, subtree: true });
  