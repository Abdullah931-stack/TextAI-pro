// ============================================
// TextAIpro - PDF Text Extraction Service
// ============================================
// Uses PDF.js loaded via CDN in index.html

/**
 * Extract text content from PDF file
 * Ignores images and binary data, extracts only text layers
 */
export async function extractTextFromPDF(file) {
    // Check if PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js library not loaded. Please check your internet connection.');
    }

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

                let fullText = '';

                // Extract text from each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Extract text items and join them
                    const pageText = textContent.items
                        .filter(item => item.str) // Only text items
                        .map(item => item.str)
                        .join(' ');

                    fullText += pageText + '\n\n';
                }

                resolve(fullText.trim());
            } catch (error) {
                reject(new Error('Failed to extract text from PDF: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
    });
}
