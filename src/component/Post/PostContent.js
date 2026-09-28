import React from 'react';

export function mediaUrl(value) {
  try {
    const base = process.env.REACT_APP_API_URL || window.location.origin;
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (['localhost', '127.0.0.1'].includes(url.hostname)) return new URL(url.pathname + url.search, base).href;
    return url.href;
  } catch { return null; }
}

export default function PostContent({ content = '' }) {
  const pattern = /(!\[[^\]]*\]|\[동영상\])\(([^\s)]+)\)/g;
  const parts = [];
  let offset = 0;
  for (const match of content.matchAll(pattern)) {
    parts.push(content.slice(offset, match.index));
    const url = mediaUrl(match[2]);
    parts.push(!url ? match[0] : match[1].startsWith('!')
      ? <img key={match.index} src={url} alt={match[1].slice(2, -1) || '첨부 이미지'} style={{ maxWidth: '100%', height: 'auto', margin: '8px 0' }} />
      : <video key={match.index} src={url} controls style={{ maxWidth: '100%', margin: '8px 0' }} />);
    offset = match.index + match[0].length;
  }
  parts.push(content.slice(offset));
  return <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{parts}</div>;
}
