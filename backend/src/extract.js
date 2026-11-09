import pdf from 'pdf-parse/lib/pdf-parse.js'; // direct path: pdf-parse ke debug bug se bachne ke liye
import mammoth from 'mammoth';

export async function extractText(file) {
  const name = file.originalname.toLowerCase();
  let text = '';
  if (name.endsWith('.pdf')) {
    text = (await pdf(file.buffer)).text;
  } else if (name.endsWith('.docx')) {
    text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
  } else {
    throw new Error('Sirf PDF ya DOCX file upload karein.');
  }
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length < 50) {
    throw new Error('Is file mein text nahi mila. Scanned/image PDF support nahi hai, text wali PDF dein.');
  }
  return text;
}
