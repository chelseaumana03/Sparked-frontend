import ClientHealthCheck from './ClientHealthCheck';

export const dynamic = 'force-dynamic';

async function fetchBackendHealth() {
  const url = `${process.env.API_URL}/health`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function BackendCheckPage() {
  let serverResult: { ok: true; data: unknown } | { ok: false; message: string };
  try {
    serverResult = { ok: true, data: await fetchBackendHealth() };
  } catch (err) {
    serverResult = { ok: false, message: String(err) };
  }

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 720 }}>
      <h1>Backend connectivity check</h1>

      <section
        style={{
          border: '1px solid #ccc',
          padding: 16,
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <h2>Server Component (fetch on Next.js server)</h2>
        <p>
          URL: <code>{process.env.API_URL}/health</code>
        </p>
        {serverResult.ok ? (
          <pre style={{ background: '#f5f5f5', padding: 12 }}>
            {JSON.stringify(serverResult.data, null, 2)}
          </pre>
        ) : (
          <p style={{ color: 'red' }}>Error: {serverResult.message}</p>
        )}
      </section>

      <ClientHealthCheck />
    </main>
  );
}
