import { jsPDF } from 'jspdf';

// PDF ke standard font mein sirf Latin characters hote hain, baaki hata dete hain
const clean = (s) => String(s ?? '').replace(/[^\x0A\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022]/g, '');

export function downloadReport(result) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const maxW = W - 2 * M;
  let y = M;

  const GREY = [100, 110, 125], INK = [20, 30, 45];

  function write(str, { size = 11, bold = false, color = INK, gap = 6, indent = 0 } = {}) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    for (const line of doc.splitTextToSize(clean(str), maxW - indent)) {
      if (y + size * 1.4 > H - M) { doc.addPage(); y = M; }
      doc.text(line, M + indent, y + size);
      y += size * 1.4;
    }
    y += gap;
  }
  const heading = (t) => write(t, { size: 13, bold: true, gap: 4 });
  const bullets = (items) => (items || []).forEach((i) => write(`\u2022 ${i}`, { indent: 8, gap: 3 }));

  write('Resume Match Report', { size: 24, bold: true, gap: 2 });
  write(`${result.fileName || 'Resume'}  |  ${new Date().toLocaleDateString()}`, { size: 10, color: GREY, gap: 18 });

  const s = result.score;
  const scoreColor = s >= 70 ? [20, 148, 106] : s >= 40 ? [217, 138, 0] : [214, 64, 63];
  write(`Match score: ${s}%`, { size: 20, bold: true, color: scoreColor, gap: 14 });

  heading('Skills you have');
  write(result.matched?.join(', ') || 'None', { gap: 12 });
  heading('Skills to add');
  write(result.missing?.join(', ') || 'None', { gap: 12 });
  heading('Bonus skills');
  write(result.extra?.join(', ') || 'None', { gap: 18 });

  const ai = result.ai;
  if (ai) {
    heading('AI summary');
    write(ai.summary, { gap: 12 });
    if (ai.strengths?.length) { heading('Strengths for this job'); bullets(ai.strengths); y += 8; }
    if (ai.gaps?.length) {
      heading('Gaps to close');
      ai.gaps.forEach((g) => {
        write(g.skill, { bold: true, gap: 1, indent: 8 });
        write(g.why, { indent: 8, gap: 1 });
        write(g.how, { indent: 8, color: GREY, gap: 8 });
      });
      y += 4;
    }
    if (ai.suggestions?.length) { heading('What to improve'); bullets(ai.suggestions); y += 8; }
    if (ai.rewrites?.length) {
      heading('Stronger bullet points');
      ai.rewrites.forEach((r) => {
        write(`Before: ${r.before}`, { indent: 8, color: [156, 36, 35], gap: 2 });
        write(`After: ${r.after}`, { indent: 8, color: [11, 107, 76], gap: 10 });
      });
    }
  } else {
    write('AI review was not available for this analysis.', { color: GREY });
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...GREY);
    doc.text(`CareerLens  |  page ${i} of ${pages}`, M, H - 24);
  }
  doc.save(`resume-match-report-${s}pct.pdf`);
}
