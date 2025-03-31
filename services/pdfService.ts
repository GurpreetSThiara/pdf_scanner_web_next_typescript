// import * as pdfjsLib from "pdfjs-dist"

// // Initialize PDF.js with a proper HTTPS URL and version matching
// export function initPdfJs() {
//   if (typeof window !== "undefined") {
//     // Use HTTPS and dynamically get the version from the loaded library
//     pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
//   }
// }

// export async function convertPdfToImages(file: File): Promise<Blob[]> {
//   // Initialize PDF.js before processing
//   initPdfJs()

//   const imageBlobs: Blob[] = []

//   try {
//     const arrayBuffer = await file.arrayBuffer()
//     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i)
//       const viewport = page.getViewport({ scale: 2.0 })

//       const canvas = document.createElement("canvas")
//       canvas.width = viewport.width
//       canvas.height = viewport.height

//       const ctx = canvas.getContext("2d", { alpha: false })
//       if (!ctx) continue

//       // Set white background
//       ctx.fillStyle = "white"
//       ctx.fillRect(0, 0, canvas.width, canvas.height)

//       await page.render({
//         canvasContext: ctx,
//         viewport,
//       }).promise

//       // Convert canvas to Blob
//       const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 1.0))

//       if (blob) imageBlobs.push(blob)
//     }

//     return imageBlobs
//   } catch (error) {
//     console.error("Error converting PDF to images:", error)
//     throw error
//   }
// }

import * as pdfjsLib from 'pdfjs-dist';


pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export const convertPdfToImages = async (pdfFile) => {
  // Create a URL for the PDF file (so pdf.js can use it)
  const fileURL = URL.createObjectURL(pdfFile);

  const loadingTask = pdfjsLib.getDocument(fileURL);
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let images = [];

  // Iterate over each page in the PDF
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // Get the page's content
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page to the canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert the canvas to a Blob (image data)
    const imageBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    // Store the Blob in the images array
    if (imageBlob) {
      images.push(imageBlob);
    }
  }

  // Cleanup: revoke the object URL
  URL.revokeObjectURL(fileURL);

  return images;  // Array of image blobs
};

