document.addEventListener('DOMContentLoaded', function() {
  const filterBtn = document.getElementById('filterBtn');
  const newTabBtn = document.getElementById('newTabBtn');
  const filteredCount = document.getElementById('filteredCount');
  const totalCount = document.getElementById('totalCount');
  const status = document.getElementById('status');

  // Check if we're on Google News
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const isGoogleNews = currentTab.url.includes('news.google.com');
    
    if (!isGoogleNews) {
      filterBtn.disabled = true;
      newTabBtn.disabled = true;
      filterBtn.textContent = 'Only works on Google News';
      newTabBtn.textContent = 'Navigate to Google News first';
      return;
    }

    // Get initial status
    updateStatus();
  });

  // Filter current page
  filterBtn.addEventListener('click', function() {
    filterBtn.classList.add('loading');
    filterBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "filterArticles" }, function(response) {
        if (response) {
          filteredCount.textContent = response.filtered;
          totalCount.textContent = response.total;
        }
        
        filterBtn.classList.remove('loading');
        filterBtn.disabled = false;
      });
    });
  });

  // Open new tab with filtered results
  newTabBtn.addEventListener('click', function() {
    newTabBtn.classList.add('loading');
    newTabBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getFilteredArticles" }, function(response) {
        if (response && response.articles) {
          // Send articles to background script to open new tab
          chrome.runtime.sendMessage({
            action: "openNewTab",
            articles: response.articles
          });
        }
        
        newTabBtn.classList.remove('loading');
        newTabBtn.disabled = false;
        
        // Close popup after opening new tab
        window.close();
      });
    });
  });

  // Update status function
  function updateStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "filterArticles" }, function(response) {
        if (response) {
          filteredCount.textContent = response.filtered;
          totalCount.textContent = response.total;
        }
      });
    });
  }

  // Listen for updates from content script instead of polling
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "statsUpdated" && request.stats) {
      filteredCount.textContent = request.stats.filtered;
      totalCount.textContent = request.stats.total;
    }
  });
});

