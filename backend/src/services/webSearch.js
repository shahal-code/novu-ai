import fetch from 'node-fetch';

/**
 * webSearch — DuckDuckGo Instant Answer API (free, no key).
 * Falls back to a simple link-only summary if IA returns nothing.
 */
export async function webSearch(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NovuAI/1.0' },
    });
    const data = await res.json();

    const results = [];

    // Abstract (best match)
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        snippet: data.AbstractText,
        url: data.AbstractURL || '',
        source: data.AbstractSource || 'DuckDuckGo',
      });
    }

    // Related topics
    if (data.RelatedTopics?.length) {
      for (const topic of data.RelatedTopics.slice(0, 3)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.slice(0, 80),
            snippet: topic.Text,
            url: topic.FirstURL,
            source: 'DuckDuckGo',
          });
        }
      }
    }

    // Answer box (calculator, definitions etc.)
    if (data.Answer) {
      results.unshift({
        title: 'Direct Answer',
        snippet: data.Answer,
        url: '',
        source: 'DuckDuckGo',
      });
    }

    return results.slice(0, 4);
  } catch (err) {
    console.error('Web search error:', err.message);
    return [];
  }
}

/**
 * Decide if a message needs a web search.
 */
export function needsWebSearch(message) {
  const lower = message.toLowerCase();
  const triggers = [
    'latest', 'recent', 'today', 'yesterday', 'current', 'now',
    'news', 'update', '2024', '2025', '2026',
    'what is the price', 'stock', 'weather', 'score', 'result',
    'who won', 'just announced', 'breaking',
  ];
  return triggers.some((t) => lower.includes(t));
}

/**
 * Format search results as a context block injected into the system prompt.
 */
export function formatResultsAsContext(results) {
  if (!results.length) return '';
  const lines = results.map(
    (r, i) => `[${i + 1}] ${r.title}\n${r.snippet}${r.url ? `\nSource: ${r.url}` : ''}`
  );
  return `\n\n--- REAL-TIME WEB SEARCH RESULTS ---\n${lines.join('\n\n')}\n--- END OF SEARCH RESULTS ---\nUse the above results to answer accurately. Always cite sources when using search data.`;
}
