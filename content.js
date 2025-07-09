// Function to check if text contains Trump references
function containsTrumpReference(text) {
  const trumpKeywords = [
    'donald trump',
    'trump',
    'president trump',
    'former president trump',
    'ex-president trump'
  ];
  
  const lowerText = text.toLowerCase();
  return trumpKeywords.some(keyword => lowerText.includes(keyword));
}

// Function to filter articles on the current page
function filterCurrentPageArticles() {
  // Try multiple selectors to find articles on Google News
  const articleSelectors = [
    'article',
    '[data-n-tid]',
    '.JtKRv',
    '.xrnccd',
    '.WwrzSb',
    '.IBr9hb',
    '.NiLAwe'
  ];
  
  let articles = [];
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      articles = Array.from(elements);
      break;
    }
  }
  
  let filteredCount = 0;
  let totalCount = articles.length;
  
  articles.forEach(article => {
    const textContent = article.textContent || article.innerText || '';
    const titleElement = article.querySelector('h3, h4, .JtKRv, .ipQwMb, .DY5T1d');
    const title = titleElement ? titleElement.textContent : '';
    
    if (containsTrumpReference(textContent) || containsTrumpReference(title)) {
      article.style.display = 'none';
      filteredCount++;
    }
  });
  
  return { filtered: filteredCount, total: totalCount };
}

// Function to collect filtered articles for new tab
function collectFilteredArticles() {
  const articleSelectors = [
    'article',
    '[data-n-tid]',
    '.JtKRv',
    '.xrnccd',
    '.WwrzSb',
    '.IBr9hb',
    '.NiLAwe'
  ];
  
  let articles = [];
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      articles = Array.from(elements);
      break;
    }
  }
  
  const filteredArticles = [];
  
  articles.forEach(article => {
    const textContent = article.textContent || article.innerText || '';
    const titleElement = article.querySelector('h3, h4, .JtKRv, .ipQwMb, .DY5T1d');
    const title = titleElement ? titleElement.textContent : '';
    const linkElement = article.querySelector('a');
    const link = linkElement ? linkElement.href : '';
    
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

// Also filter when page content changes (for dynamic loading)
const observer = new MutationObserver(() => {
  setTimeout(() => {
    filterCurrentPageArticles();
  }, 500);
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

