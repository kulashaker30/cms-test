import { makeReq, readJSON } from '../test/reqres';
import * as registerRoute from '../app/api/auth/register/route';
import * as loginRoute from '../app/api/auth/login/route';
import * as refreshRoute from '../app/api/auth/refresh/route';
import * as meRoute from '../app/api/auth/me/route';
import { prisma } from '../lib/prisma';

describe('Auth endpoints', () => {
  const email = `user${Date.now()}@test.com`;
  const password = 'Passw0rd!';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('registers a user', async () => {
    const req = makeReq('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName: 'Tester' }),
      headers: { 'Content-Type': 'application/json' }
    });
    const res: any = await (registerRoute as any).POST(req);
    expect(res.status).toBe(201);
    const body = await readJSON(res);
    expect(body.user.email).toBe(email);
  });

  it('logs in and returns tokens', async () => {
    const req = makeReq('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const res: any = await (loginRoute as any).POST(req);
    const body = await readJSON(res);
    expect(res.status).toBe(200);
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();

    // /auth/me should succeed with access token
    const meReq = makeReq('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${body.accessToken}` }
    });
    const meRes: any = await (meRoute as any).GET(meReq);
    expect(meRes.status).toBe(200);
  });

  it('refreshes token', async () => {
    // login
    const loginReq = makeReq('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    const loginRes: any = await (loginRoute as any).POST(loginReq);
    const loginBody = await readJSON(loginRes);

    const req = makeReq('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: loginBody.refreshToken }),
      headers: { 'Content-Type': 'application/json' }
    });
    const res: any = await (refreshRoute as any).POST(req);
    const body = await readJSON(res);

    expect(res.status).toBe(200);
    expect(body.accessToken).toBeTruthy();
  });
});
