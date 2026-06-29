import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type StatementRow = {
  load: string;
  gross: number;
  fee: number;
  net: number;
  status: string;
  paid: string;
};

export type StatementInput = {
  company: string;
  mc: string | null;
  title: string;
  subtitle: string;
  rows: StatementRow[];
};

const GOLD = rgb(1, 0.843, 0);
const BLACK = rgb(0.06, 0.06, 0.07);
const WHITE = rgb(0.96, 0.96, 0.96);
const MUTED = rgb(0.63, 0.63, 0.63);
const GREEN = rgb(0.49, 0.82, 0.4);
const LINE = rgb(0.85, 0.85, 0.85);

const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Builds a branded AddisDispatch settlement statement PDF. */
export async function buildStatementPdf(input: StatementInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595;
  const M = 50;

  // Header band
  page.drawRectangle({ x: 0, y: 762, width: W, height: 80, color: BLACK });
  page.drawText("Addis", { x: M, y: 800, size: 22, font: bold, color: GOLD });
  page.drawText("Dispatch", { x: M + bold.widthOfTextAtSize("Addis", 22), y: 800, size: 22, font: bold, color: WHITE });
  page.drawText("SETTLEMENT STATEMENT", { x: M, y: 778, size: 9, font, color: MUTED });

  // Carrier + title
  let y = 720;
  page.drawText(input.company, { x: M, y, size: 14, font: bold, color: BLACK });
  if (input.mc) page.drawText(input.mc, { x: W - M - font.widthOfTextAtSize(input.mc, 10), y: y + 3, size: 10, font, color: MUTED });
  y -= 18;
  page.drawText(input.title, { x: M, y, size: 11, font: bold, color: BLACK });
  y -= 14;
  page.drawText(input.subtitle, { x: M, y, size: 9, font, color: MUTED });

  // Table header
  y -= 28;
  const cols = { load: M, gross: 250, fee: 330, net: 415, status: 500 };
  page.drawRectangle({ x: M, y: y - 4, width: W - 2 * M, height: 20, color: rgb(0.96, 0.96, 0.96) });
  const head = (t: string, x: number) => page.drawText(t, { x, y: y + 2, size: 8, font: bold, color: rgb(0.4, 0.4, 0.4) });
  head("LOAD", cols.load + 4);
  head("GROSS", cols.gross);
  head("DISPATCH FEE", cols.fee);
  head("NET", cols.net);
  head("STATUS", cols.status);

  // Rows
  y -= 22;
  let totalGross = 0,
    totalFee = 0,
    totalNet = 0,
    totalPaid = 0,
    totalPending = 0;
  for (const r of input.rows) {
    page.drawText(r.load, { x: cols.load + 4, y, size: 9, font, color: BLACK });
    page.drawText(money(r.gross), { x: cols.gross, y, size: 9, font, color: BLACK });
    page.drawText("-" + money(r.fee), { x: cols.fee, y, size: 9, font: bold, color: rgb(0.7, 0.55, 0) });
    page.drawText(money(r.net), { x: cols.net, y, size: 9, font: bold, color: BLACK });
    page.drawText(r.status, { x: cols.status, y, size: 9, font, color: r.status === "Paid" ? GREEN : MUTED });
    page.drawLine({ start: { x: M, y: y - 6 }, end: { x: W - M, y: y - 6 }, thickness: 0.5, color: LINE });
    totalGross += r.gross;
    totalFee += r.fee;
    totalNet += r.net;
    if (r.status === "Paid") totalPaid += r.net;
    else totalPending += r.net;
    y -= 20;
    if (y < 120) break;
  }

  // Totals
  y -= 8;
  page.drawText("Total gross", { x: cols.gross - 60, y, size: 9, font, color: MUTED });
  page.drawText(money(totalGross), { x: cols.gross, y, size: 9, font: bold, color: BLACK });
  page.drawText("-" + money(totalFee), { x: cols.fee, y, size: 9, font: bold, color: rgb(0.7, 0.55, 0) });
  page.drawText(money(totalNet), { x: cols.net, y, size: 9, font: bold, color: BLACK });
  y -= 22;
  page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 26, color: BLACK });
  page.drawText("Net paid: " + money(totalPaid), { x: M + 12, y: y + 2, size: 10, font: bold, color: GREEN });
  page.drawText("Net pending: " + money(totalPending), { x: W - M - 170, y: y + 2, size: 10, font: bold, color: GOLD });

  // Footer
  page.drawText(
    `Generated ${new Date().toLocaleString("en-US")} · AddisDispatch is a dispatch service, not a licensed freight broker.`,
    { x: M, y: 50, size: 7, font, color: MUTED },
  );

  return pdf.save();
}
