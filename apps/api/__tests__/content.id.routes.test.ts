import { describe, it, expect } from 'vitest';
import { GET, PUT, DELETE } from '../app/api/content/[id]/route';
describe('/api/content/[id]', () => {
  it('GET returns item', async () => {
    const res = await GET(new Request('http://test') as any, { params: { id: '123' } });
    expect(res.status).toBe(200);
  });
  it('PUT updates item', async () => {
    const res = await PUT(new Request('http://test', { method: 'PUT', body: JSON.stringify({ title: 'X' }) }) as any, { params: { id: '123' } });
    expect(res.status).toBe(200);
  });
  it('DELETE removes item', async () => {
    const res = await DELETE(new Request('http://test', { method: 'DELETE' }) as any, { params: { id: '123' } });
    expect(res.status).toBe(204);
  });
});
