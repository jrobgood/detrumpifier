# Pull Request: Improve extension stability and add visual feedback

## Summary
This PR improves the Detrumpifier extension's reliability and user experience by:
- Replacing ephemeral class selectors with stable, semantic selectors
- Adding a dismissible notification when articles are filtered
- Fixing text extraction to preserve proper spacing

## Changes

### 1. Stable Selectors
Replaced Google News' minified class names (like `IBr9hb`, `sLwsDb`) with more stable selectors based on:
- Semantic HTML elements (`article`, `h3`, `h4`, `p`)
- ARIA roles (`[role="article"]`, `[role="heading"]`)
- URL patterns (`a[href*="/read/"]`)
- Common structural patterns

This makes the extension more resilient to Google News rebuilds.

### 2. Visual Feedback
Added a blue corner notification that appears when articles are filtered:
- Shows "Now 100% Trump-free" message
- Displays count of filtered articles in tooltip
- Can be dismissed with X button
- Stays dismissed for the session

### 3. Bug Fixes
- Fixed whitespace issues by using `innerText` instead of `textContent`
- Improved regex patterns with word boundaries to avoid false positives
- Added debouncing to MutationObserver to improve performance

## Testing
Tested on Google News with various article structures to ensure:
- Articles containing Trump references are properly hidden
- No false positives (e.g., "trumpet" is not filtered)
- Corner notification appears and dismisses correctly
- Extension works with dynamic content loading

## Impact
These changes significantly improve the extension's reliability and provide better user feedback without affecting the core filtering functionality.