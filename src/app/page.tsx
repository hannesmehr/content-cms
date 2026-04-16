// Root page — this should never be directly hit.
// The middleware rewrites / to /{defaultSite}/ for the frontend.
// If no DEFAULT_SITE is set, show a simple info page.

export default function Home() {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Content CMS</h1>
        <p>Setze <code>DEFAULT_SITE</code> in der <code>.env</code> um eine Site auf localhost anzuzeigen.</p>
        <p><a href="/admin">→ Admin Panel</a></p>
      </body>
    </html>
  );
}
