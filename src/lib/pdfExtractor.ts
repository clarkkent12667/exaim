import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  success: boolean;
  error?: string;
}

export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  try {
    console.log('Starting PDF text extraction for file:', file.name);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      
      console.log(`Extracted text from page ${pageNum}, length:`, pageText.length);
    }
    
    // Clean up the text
    const cleanedText = fullText
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    console.log('PDF text extraction completed. Total length:', cleanedText.length);
    
    return {
      text: cleanedText,
      pageCount,
      success: true
    };
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper function to get PDF text preview (first 500 characters)
export const getPDFTextPreview = (text: string): string => {
  if (!text) return '';
  return text.length > 500 ? text.substring(0, 500) + '...' : text;
};
