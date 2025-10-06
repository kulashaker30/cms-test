import * as React from 'react';
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const share = async () => {
    try { if (navigator.share) { await navigator.share({ url, title }); }
      else { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`); }
    } catch {}
  };
  return <button onClick={share} className="btn-primary" aria-label="Share this article">Share</button>;
}
