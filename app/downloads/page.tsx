// Row 8 - directory-listing-exposed. Fake Apache/nginx-style "Index of /"
// page. Scanner detects the classic directory listing pattern in the HTML.
export default function DownloadsIndex() {
  return (
    <html>
      <head>
        <title>Index of /downloads</title>
      </head>
      <body>
        <h1>Index of /downloads</h1>
        <pre style={{ fontFamily: "monospace" }}>
{`Name                    Last modified       Size
[DIR] backups/          2026-08-20 14:22    -
[DIR] logs/             2026-08-25 09:11    -
[   ] backup-2026-08-15.sql   2026-08-15 12:00   15K
[   ] users-export.csv        2026-08-14 09:30    8K
[   ] app-config.json         2026-08-10 16:45    2K
[   ] server-error.log        2026-08-30 03:12   47K
`}
        </pre>
        <address>Apache/2.4.52 Server at testbed.blockchainhq.xyz Port 443</address>
      </body>
    </html>
  );
}
