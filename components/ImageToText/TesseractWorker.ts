import { createWorker } from 'tesseract.js';
 
const worker = createWorker({
  logger: m => console.log(m)
});
 
export const ExtractText = async (image: string) => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(image);
    console.log(text);
    await worker.terminate();
    return text;
  }