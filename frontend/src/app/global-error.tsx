'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="sr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#fafafa',
          color: '#111',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#dc2626',
              textTransform: 'uppercase',
            }}
          >
            Kritična greška
          </div>
          <h1 style={{ marginTop: '8px', fontSize: '36px', fontWeight: 700 }}>
            Nešto je pošlo po zlu
          </h1>
          <p style={{ marginTop: '16px', color: '#52525b', fontSize: '16px' }}>
            Došlo je do ozbiljne greške u aplikaciji. Pokušaj ponovo.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: '12px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#71717a',
              }}
            >
              ID greške: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Pokušaj ponovo
          </button>
        </div>
      </body>
    </html>
  );
}
