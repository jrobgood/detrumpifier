
chrome.runtime.onInstalled.addListener(() => {
  console.log('Trump Filter extension installed.');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openNewTab") {
    // Create a new tab with filtered articles
    chrome.tabs.create({
      url: chrome.runtime.getURL('filtered_results.html')
    }, (tab) => {
      // Store the filtered articles data for the new tab
      chrome.storage.local.set({
        [`filteredArticles_${tab.id}`]: request.articles
      });
    });
  } else if (request.action === "getFilteredData") {
    // Retrieve stored filtered articles for a specific tab
    chrome.storage.local.get([`filteredArticles_${request.tabId}`], (result) => {
      sendResponse({ articles: result[`filteredArticles_${request.tabId}`] || [] });
    });
    return true; // Keep the message channel open for async response
  }
});

// Clean up storage when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove([`filteredArticles_${tabId}`]);
});

