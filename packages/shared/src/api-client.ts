export class APIClient {
  constructor(private baseURL: string) {}
  async listArticles() {
    const r = await fetch(`${this.baseURL}/content`);
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
  }
  async getArticle(idOrSlug: string) {
    const r = await fetch(`${this.baseURL}/content/${idOrSlug}`);
    if (!r.ok) throw new Error('Not found');
    return r.json();
  }
}
