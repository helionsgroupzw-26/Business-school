# Approved Mari Matters certificate artwork

**Do not merge or deploy this branch until both artwork assets have been added.**

Use the two PNG images provided by the programme owner exactly as supplied (with only sample-personalisation areas cleared):

- `public/certificates/financial-literacy-fellow.png`
- `public/certificates/certified-financial-leader.png`

The approved background assets, the certificate renderer and integration notes are provided in the accompanying `Mari_Matters_Approved_Certificates_Update.zip` package. Copy the two PNGs from that package to the paths above.

The `src/CertificateTemplateRenderer.js` code places that fixed artwork in a landscape 3:2 PDF, overlays only the fellow name, number, issue date, and real verification QR, and uses the existing certificate issuance records.

Test both award types and confirm QR lookup, admin download, mobile download, print cropping, long recipient names, and issued-date formatting before publishing. The existing production flow remains untouched until this branch is merged.
