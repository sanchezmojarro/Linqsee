import type { VercelRequest, VercelResponse } from "@vercel/node";
import Busboy from "busboy";
import pdf from "pdf-parse";

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const bb = Busboy({ headers: req.headers });
    const chunks: Buffer[] = [];
    let fileFound = false;
    let mimeType = "";

    bb.on("file", (_name, file, info) => {
      fileFound = true;
      mimeType = info.mimeType;
      if (mimeType !== "application/pdf") {
        file.resume();
        res.status(400).json({ ok: false, error: "Only PDF allowed", mimeType });
        return;
      }
      file.on("data", (d: Buffer) => chunks.push(d));
    });

    bb.on("finish", async () => {
      if (!fileFound) {
        res.status(400).json({ ok: false, error: "No file field found (expected 'file')" });
        return;
      }

      const buffer = Buffer.concat(chunks);
      if (buffer.length < 10) {
        res.status(400).json({ ok: false, error: "Empty upload" });
        return;
      }

      try {
        const parsed = await pdf(buffer);
        const text = (parsed.text || "").trim();

        if (!text) {
          res.status(422).json({
            ok: false,
            error: "PDF parsed but text is empty. Might be scanned image; needs OCR.",
            pages: parsed.numpages,
          });
          return;
        }

        res.status(200).json({
          ok: true,
          pages: parsed.numpages,
          chars: text.length,
          text,
        });
      } catch (error: any) {
        res.status(500).json({
          ok: false,
          error: "pdf-parse failed",
          detail: String(error?.message || error),
        });
      }
    });

    req.pipe(bb);
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: "Upload handler crashed",
      detail: String(error?.message || error),
    });
  }
}
