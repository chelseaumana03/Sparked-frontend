'use client';

import { useEffect, useState } from 'react';

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; data: unknown }
  | { kind: 'error'; message: string };

export default function ClientHealthCheck() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/health`;
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setState({ kind: 'ok', data }))
      .catch((err) => setState({ kind: 'error', message: String(err) }));
  }, []);

  return (
    <section
      style={{
        border: '1px solid #ccc',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
      }}
    >
      <h2>Client Component (fetch from browser)</h2>
      <p>
        URL: <code>{process.env.NEXT_PUBLIC_API_URL}/health</code>
      </p>
      {state.kind === 'loading' && <p>Loading…</p>}
      {state.kind === 'ok' && (
        <pre style={{ background: '#f5f5f5', padding: 12 }}>
          {JSON.stringify(state.data, null, 2)}
        </pre>
      )}
      {state.kind === 'error' && (
        <p style={{ color: 'red' }}>Error: {state.message}</p>
      )}
    </section>
  );
}
