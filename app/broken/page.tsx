// Row 38 - critical-page-blank-or-error.
// This page deliberately returns HTTP 200 with error-looking content so the
// scanner flags it as "broken page". Scan this URL separately from the homepage:
//   https://testbed.blockchainhq.xyz/broken
export default function BrokenPage() {
  return (
    <main
      style={{
        padding: 40,
        fontFamily: "sans-serif",
        color: "#c00",
      }}
    >
      <h1>Application Error</h1>
      <p>Error 500 - internal server error. Something went wrong.</p>
    </main>
  );
}
