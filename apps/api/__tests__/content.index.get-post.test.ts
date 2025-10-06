import { describe, it, expect } from 'vitest';
import { GET, POST } from '../app/api/content/route';
describe('/api/content', () => {
  it('GET returns articles', async () => {
    const res = await GET(new Request('http://test/api/content') as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
  it('POST creates article', async () => {
    const res = await POST(new Request('http://test/api/content', { method: 'POST', body: JSON.stringify({ title: 'A', content: 'B' }) }) as any);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.title).toBe('A');
  });
});
