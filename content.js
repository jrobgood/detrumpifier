// Function to check if text contains Trump references
function containsTrumpReference(text) {
  // Use word boundary regex patterns for more accurate matching
  const trumpPatterns = [
    /\bdonald\s+trump\b/i,
    /\btrump\b/i,
    /\bpresident\s+trump\b/i,
    /\bformer\s+president\s+trump\b/i,
    /\bex-president\s+trump\b/i,
    /\btrump's\b/i,
    /\btrump['']s\b/i  // Handle smart quotes
  ];
  
  return trumpPatterns.some(pattern => pattern.test(text));
}

// Common function to find articles on the page
function findArticles() {
  const articleSelectors = [
    'article',
    '[data-n-tid]',
    '.JtKRv',
    '.xrnccd',
    '.WwrzSb',
    '.IBr9hb',
    '.NiLAwe'
  ];
  
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      return Array.from(elements);
    }
  }
  return [];
}

// Common function to extract article data
function extractArticleData(article) {
  const textContent = article.textContent || article.innerText || '';
  const titleElement = article.querySelector('h3, h4, .JtKRv, .ipQwMb, .DY5T1d');
  const title = titleElement ? titleElement.textContent : '';
  const linkElement = article.querySelector('a');
  const link = linkElement ? linkElement.href : '';
  
  return { textContent, title, link, element: article };
}

// Function to filter articles on the current page
function filterCurrentPageArticles() {
  const articles = findArticles();
  let filteredCount = 0;
  let totalCount = articles.length;
  
  articles.forEach(article => {
    const { textContent, title } = extractArticleData(article);
    
    if (containsTrumpReference(textContent) || containsTrumpReference(title)) {
      article.style.display = 'none';
      filteredCount++;
    }
  });
  
  const stats = { filtered: filteredCount, total: totalCount };
  
  // Send stats update to popup if it's open
  chrome.runtime.sendMessage({ action: "statsUpdated", stats: stats }).catch(() => {
    // Ignore errors if popup is not open
  });
  
  return stats;
}

// Function to collect filtered articles for new tab
function collectFilteredArticles() {
  const articles = findArticles();
  const filteredArticles = [];
  
  articles.forEach(article => {
    const { textContent, title, link } = extractArticleData(article);
    
    if (!containsTrumpReference(textContent) && !containsTrumpReference(title)) {
      filteredArticles.push({
        title: title,
        content: textContent.substring(0, 200) + '...',
        link: link,
        html: article.outerHTML
      });
    }
  });
  
  return filteredArticles;
}

// Auto-filter on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    filterCurrentPageArticles();
  }, 1000);
});

// Debounce function to limit how often filtering runs
let debounceTimer;
function debounce(func, delay) {
  return function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
  };
}

// Also filter when page content changes (for dynamic loading)
const debouncedFilter = debounce(() => {
  filterCurrentPageArticles();
}, 1000);

const observer = new MutationObserver(() => {
  debouncedFilter();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "filterArticles") {
    const result = filterCurrentPageArticles();
    sendResponse(result);
  } else if (request.action === "getFilteredArticles") {
    const articles = collectFilteredArticles();
    sendResponse({ articles: articles });
  }
});

