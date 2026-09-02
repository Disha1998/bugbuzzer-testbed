// Batch 6 - server-side-template-injection. Detects Jinja / ERB / Freemarker
// template syntax in `tpl` param and evaluates simple math expressions,
// then renders the result. Scanner sends {{7*7}} or ${7*7} and finds 49.
function fakeTemplateEval(tpl: string): string {
  // Jinja / Twig: {{ 7*7 }}
  const jinja = tpl.match(/\{\{\s*(-?\d+)\s*([+\-*/])\s*(-?\d+)\s*\}\}/);
  if (jinja) return String(compute(jinja[1], jinja[2], jinja[3]));
  // Freemarker / JSP EL: ${ 7*7 }
  const freemarker = tpl.match(/\$\{\s*(-?\d+)\s*([+\-*/])\s*(-?\d+)\s*\}/);
  if (freemarker) return String(compute(freemarker[1], freemarker[2], freemarker[3]));
  // ERB / EJS: <%= 7*7 %>
  const erb = tpl.match(/<%=?\s*(-?\d+)\s*([+\-*/])\s*(-?\d+)\s*%>/);
  if (erb) return String(compute(erb[1], erb[2], erb[3]));
  return tpl;
}

function compute(aStr: string, op: string, bStr: string): number {
  const a = Number(aStr);
  const b = Number(bStr);
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? 0 : a / b;
  return 0;
}

export default async function RenderPage({
  searchParams,
}: {
  searchParams: Promise<{ tpl?: string }>;
}) {
  const { tpl = "Welcome {{7*7}}" } = await searchParams;
  const rendered = fakeTemplateEval(tpl);
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Template Renderer</h1>
      <p>Input template: <code>{tpl}</code></p>
      <p>Rendered output: <strong>{rendered}</strong></p>
      <p style={{ color: "#999", marginTop: 20 }}>
        (fake testbed page - intentional SSTI via ?tpl= parameter)
      </p>
    </main>
  );
}
