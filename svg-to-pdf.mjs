/**
 * svg-to-pdf.mjs — Convert PlantUML SVG exports to PDF
 * Usage: node svg-to-pdf.mjs
 */
import { readFileSync, readdirSync, createWriteStream } from "fs";
import { extname } from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

const svgFiles = readdirSync(".").filter(
  (f) => extname(f) === ".svg" && f.startsWith("Fate_of_Yours")
);

if (svgFiles.length === 0) {
  console.error("No SVG files found. Run PlantUML SVG export first.");
  process.exit(1);
}

for (const svgFile of svgFiles) {
  const svgContent = readFileSync(svgFile, "utf8");
  const pdfFile = svgFile.replace(".svg", ".pdf");

  // Parse SVG dimensions
  const widthMatch  = svgContent.match(/width="([\d.]+)"/);
  const heightMatch = svgContent.match(/height="([\d.]+)"/);
  const svgW = widthMatch  ? parseFloat(widthMatch[1])  : 800;
  const svgH = heightMatch ? parseFloat(heightMatch[1]) : 1200;

  const doc = new PDFDocument({ size: [svgW, svgH], margin: 0, autoFirstPage: true });
  const stream = createWriteStream(pdfFile);
  doc.pipe(stream);

  SVGtoPDF(doc, svgContent, 0, 0, { width: svgW, height: svgH });
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log(`✅  ${svgFile}  →  ${pdfFile}`);
}

console.log("Done!");
