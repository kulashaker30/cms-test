import { makeReq, readJSON } from '../test/reqres';
import * as contentRoute from '../app/api/content/route';
import * as contentIdRoute from '../app/api/content/[id]/route';
import * as loginRoute from '../app/api/auth/login/route';
import * as registerRoute from '../app/api/auth/register/route';
import { prisma } from '../lib/prisma';

describe('Content endpoints', () => {
    const email = `author${Date.now()}@test.com`;
    const password = 'Passw0rd!';
    let access = ''; let userId = '';

    beforeAll(async () => {
        await (registerRoute as any).POST(
            makeReq('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName: 'Author' }) })
        );
        const res: any = await (loginRoute as any).POST(
            makeReq('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }) })
        );
        const body = await readJSON(res);
        access = body.accessToken;
        const user = await prisma.user.findUnique({ where: { email } });
        userId = user!.id;
    });

    afterAll(async () => {
        await prisma.article.deleteMany({ where: { authorId: userId } });
        await prisma.user.deleteMany({ where: { id: userId } });
        await prisma.$disconnect();
    });

    it('creates, reads, updates, deletes an article', async () => {
        // create
        const createRes: any = await (contentRoute as any).POST(
            makeReq('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
                body: JSON.stringify({ title: 'Hello', slug: 'hello', content: '<p>World</p>', authorId: userId })
            })
        );
        expect(createRes.status).toBe(201);
        const created = await readJSON(createRes);

        // list
        const listRes: any = await (contentRoute as any).GET(makeReq('/api/content'));
        expect(listRes.status).toBe(200);

        // get by id
        const getRes: any = await (contentIdRoute as any).GET(
            makeReq(`/api/content/${created.id}`)
        );
        expect(getRes.status).toBe(200);

        // update
        const putRes: any = await (contentIdRoute as any).PUT(
            makeReq(`/api/content/${created.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
                body: JSON.stringify({ title: 'Updated' })
            })
        );
        expect(putRes.status).toBe(200);
        const updated = await readJSON(putRes);
        expect(updated.title).toBe('Updated');

        // delete
        const delRes: any = await (contentIdRoute as any).DELETE(
            makeReq(`/api/content/${created.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${access}` }
            })
        );
        expect(delRes.status).toBe(204);
    });
});
