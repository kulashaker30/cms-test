import { makeReq } from '../test/reqres';
import * as metricsRoute from '../app/api/metrics/route';

describe('Metrics endpoint', () => {
    it('returns counts and timeseries', async () => {
        const res: any = await (metricsRoute as any).GET(makeReq('/api/metrics'));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.counts).toBeTruthy();
        expect(body.timeseries).toBeTruthy();
    });
});
