chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PRODUCT_INFO" }, (response) => {
    const status = document.getElementById("status");
    const couponList = document.getElementById("coupon-list");

    if (!response || !response.site) {
      status.textContent = "Not a supported product page.";
      return;
    }

    status.textContent = "Fetching coupons...";

    fetch(`https://coupon-finder-backend-pf3n.onrender.com/coupons?site=${response.site}`)
      .then(res => res.json())
      .then(data => {
        if (data.coupons.length === 0) {
          status.textContent = "No coupons found.";
          return;
        }

        status.textContent = `Found ${data.coupons.length} coupon(s):`;

        data.coupons.forEach(code => {
          const li = document.createElement("li");
          li.textContent = code;
          li.classList.add("coupon-item");
          li.title = "Click to copy";

          li.addEventListener("click", () => {
            navigator.clipboard.writeText(code);
            li.textContent = "✓ Copied!";
            li.classList.add("copied");
            setTimeout(() => {
              li.textContent = code;
              li.classList.remove("copied");
            }, 1500);
          });
          couponList.appendChild(li);
        });
      })
      .catch(() => {
        status.textContent = "Could not reach the server.";
      });
  });
});