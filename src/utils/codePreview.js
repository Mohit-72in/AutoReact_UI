/**
 * Utility to convert React JSX code to renderable HTML
 * For preview purposes
 */

/**
 * Extract JSX content from generated code
 * @param {string} code - Generated React component code
 * @returns {string} HTML string for preview
 */
export const extractHTMLFromJSX = (code) => {
  if (!code || typeof code !== 'string') {
    return '';
  }

  try {
    // Extract return statement content (simplified approach)
    const returnMatch = code.match(/return\s*\(([\s\S]*?)\);/);
    if (returnMatch && returnMatch[1]) {
      let jsx = returnMatch[1].trim();
      
      // Basic JSX to HTML conversion
      jsx = jsx
        // Convert className to class
        .replace(/className=/g, 'class=')
        // Remove React imports and self-closing tags issues
        .replace(/<(\w+)\s+([^>]*?)\s*\/>/g, '<$1 $2></$1>')
        // Handle basic props
        .replace(/\{`([^`]*)`\}/g, '$1')
        .replace(/\{\"([^\"]*)\"\}/g, '$1')
        .replace(/\{\'([^\']*)\'\}/g, '$1');
      
      return jsx;
    }

    // If no return statement, try to find JSX directly
    const jsxMatch = code.match(/<[^>]+>/);
    if (jsxMatch) {
      return code;
    }

    return '';
  } catch (error) {
    console.error('Error extracting HTML from JSX:', error);
    return '';
  }
};

/**
 * Create a styled HTML preview from component code
 * @param {string} code - Generated React component code
 * @returns {string} Complete HTML with Tailwind styles
 */
export const createStyledPreview = (code) => {
  const html = extractHTMLFromJSX(code);
  
  if (!html) {
    return '';
  }

  // Wrap in a styled container with Tailwind CDN
  return `
    <div class="w-full h-full min-h-screen bg-white p-8">
      ${html}
    </div>
  `;
};

/**
 * Generate preview HTML from AI response
 * @param {Object} response - API response with code and preview
 * @returns {string} HTML for preview
 */
export const generatePreviewHTML = (response) => {
  if (!response) {
    return '';
  }

  // If response includes preview HTML, use it
  if (response.preview && response.preview.html) {
    return response.preview.html;
  }

  // Otherwise, extract from code
  if (response.code) {
    return createStyledPreview(response.code);
  }

  return '';
};
