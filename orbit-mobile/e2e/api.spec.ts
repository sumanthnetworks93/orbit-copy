import { expect, test } from '@playwright/test';

const API = process.env.ORBIT_API_URL ?? 'http://127.0.0.1:5189';

test.describe('Jobs API', () => {
  test.beforeAll(async ({ request }) => {
    try {
      const response = await request.get(`${API}/health`);
      if (!response.ok()) {
        test.skip(true, `Orbit API is not healthy at ${API}`);
      }
    } catch {
      test.skip(true, `Orbit API is not running at ${API}`);
    }
  });
  test('preview returns a phone LAN URL', async ({ request }) => {
    const response = await request.get(`${API}/preview?port=8081`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.port).toBe(8081);
    expect(body.ip).toMatch(/^\d{1,3}(\.\d{1,3}){3}$/);
    expect(body.ip).not.toBe('127.0.0.1');
    expect(body.url).toBe(`http://${body.ip}:8081/`);
  });

  test('health reports ok', async ({ request }) => {
    const response = await request.get(`${API}/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.app).toBe('Orbit.Api');
  });

  test('resolves IP geolocation', async ({ request }) => {
    const response = await request.get(`${API}/api/geo`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.country).toEqual(expect.any(String));
    expect(body.country.length).toBeGreaterThan(0);
    expect(body.city).toEqual(expect.any(String));
  });

  test('lists posted jobs without an API key', async ({ request }) => {
    const response = await request.get(`${API}/api/jobs?page=1&pageSize=5`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.totalCount).toBeGreaterThan(0);
    expect(Array.isArray(body.jobs)).toBeTruthy();
    expect(body.postedTodayCount).toEqual(expect.any(Number));
    expect(body.postedTodayCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.postedByDay)).toBeTruthy();
    expect(body.jobs[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        company: expect.any(String),
        location: expect.any(String),
      }),
    );
  });

  test('returns job type filters', async ({ request }) => {
    const response = await request.get(`${API}/api/jobs/filters`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.jobTypes)).toBeTruthy();
  });

  test('accepts a location query', async ({ request }) => {
    const response = await request.get(`${API}/api/jobs?page=1&pageSize=5&location=Remote`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.totalCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.jobs)).toBeTruthy();
  });
});
