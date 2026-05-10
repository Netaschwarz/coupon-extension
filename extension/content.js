const ALLOWED_SITES = new Set([
  "asos", "hm", "nike", "gap", "oldnavy", 
  "target", "shein", "macys", "ebay", "nordstrom"
]);
function getProductInfo() {
  const url = window.location.hostname; //url of user

  if (url.includes("com")) {
  
    const words = url.split('.');
    const siteName = words.at(-2);
      return { site: siteName };
      
  }
  return null;
}

const productInfo = getProductInfo();
if (productInfo) {
  console.log("CouponFinder detected:", productInfo);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PRODUCT_INFO") {
    const productInfo = getProductInfo();
    sendResponse(productInfo);
  }
  return true; // tells Chrome to keep the channel open for the async response
});