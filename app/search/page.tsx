// Batch 6 - reflected-xss-in-url-parameters. Renders `q` param into HTML
// via dangerouslySetInnerHTML with no escaping. Scanner sends
// <script>alert(1)</script> and finds it reflected in response body.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Search results</h1>
      <p>
        You searched for: <span dangerouslySetInnerHTML={{ __html: q }} />
      </p>
      <div>
        Query echoed unescaped:{" "}
        <span dangerouslySetInnerHTML={{ __html: q }} />
      </div>
      <p style={{ color: "#999", marginTop: 20 }}>
        (fake testbed page - intentional reflected XSS via ?q= parameter)
      </p>
    </main>
  );
}
