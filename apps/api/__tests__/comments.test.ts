import { makeReq, readJSON } from '../test/reqres';
import * as commentsRoute from '../app/api/comments/route';
import * as delRoute from '../app/api/comments/[id]/route';
import * as registerRoute from '../app/api/auth/register/route';
import * as loginRoute from '../app/api/auth/login/route';
import * as contentRoute from '../app/api/content/route';
import { prisma } from '../lib/prisma';

describe('Comments endpoints', () => {
    const email = `cuser${Date.now()}@test.com`;
    const password = 'Passw0rd!';
    let access = ''; let articleId = ''; let userId = '';

    beforeAll(async () => {
        await (registerRoute as any).POST(makeReq('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }));
        const loginRes: any = await (loginRoute as any).POST(makeReq('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }));
        const login = await readJSON(loginRes); access = login.accessToken;
        const user = await prisma.user.findUnique({ where: { email } }); userId = user!.id;

        // create article to comment on
        const cre: any = await (contentRoute as any).POST(
            makeReq('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
                body: JSON.stringify({ title: 'Post', slug: `p-${Date.now()}`, content: '<p>x</p>', authorId: userId }) })
        );
        const body = await readJSON(cre);
        articleId = body.id;
    });

    afterAll(async () => {
        await prisma.comment.deleteMany({ where: { articleId } });
        await prisma.article.deleteMany({ where: { id: articleId } });
        await prisma.user.deleteMany({ where: { id: userId } });
        await prisma.$disconnect();
    });

    it('creates and lists comments (nested)', async () => {
        // create parent
        const p: any = await (commentsRoute as any).POST(
            makeReq('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
                body: JSON.stringify({ articleId, text: '<p>First!</p>' }) })
        );
        expect(p.status).toBe(201);
        const parent = await readJSON(p);

        // reply
        const r: any = await (commentsRoute as any).POST(
            makeReq('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
                body: JSON.stringify({ articleId, text: '<p>Reply</p>', parentId: parent.id }) })
        );
        expect(r.status).toBe(201);

        // list
        const g: any = await (commentsRoute as any).GET(makeReq(`/api/comments?articleId=${articleId}`));
        expect(g.status).toBe(200);
        const thread = await readJSON(g);
        expect(Array.isArray(thread)).toBe(true);
        expect(thread[0].replies.length).toBe(1);
    });

    it('soft-deletes a comment', async () => {
        const c: any = await (commentsRoute as any).POST(
            makeReq('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
                body: JSON.stringify({ articleId, text: '<p>To delete</p>' }) })
        );
        const body = await readJSON(c);

        const d: any = await (delRoute as any).DELETE(
            makeReq(`/api/comments/${body.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${access}` } }),
            { params: { id: body.id } } as any
        );
        expect(d.status).toBe(204);
    });
});
