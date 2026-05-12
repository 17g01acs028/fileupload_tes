
export type FileFormatTypes =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;';

interface DownloadBase64FileProps {
  base64str: string;
  fileFormat: FileFormatTypes;
  fileName: string;
}

export const handleDownloadOfBase64File = (downloadBase64FileProps: DownloadBase64FileProps) => {
  const { base64str, fileFormat, fileName } = downloadBase64FileProps;

  // decode base64 string, remove space for IE compatibility
  let binary = atob(base64str.replace(/\s/g, ''));
  let len = binary.length;
  let buffer = new ArrayBuffer(len);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }

  // create the blob object with content-type "application/pdf"
  let blob = new Blob([view], { type: fileFormat });
  let url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName); //or any other extension
  document.body.appendChild(link);
  link.click();
};

export const handleDownloadOfBase64PDFFile = (
  downloadBase64FileProps: Omit<DownloadBase64FileProps, 'fileFormat'>
) => {
  handleDownloadOfBase64File({
    ...downloadBase64FileProps,
    fileFormat: 'application/pdf'
  });
};

export const handleDownloadOfBase64XLSXFile = (
  downloadBase64FileProps: Omit<DownloadBase64FileProps, 'fileFormat'>
) => {
  handleDownloadOfBase64File({
    ...downloadBase64FileProps,
    fileFormat: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;'
  });
};

export const dummyRequest = ({ file, onSuccess }: any) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};


/**
 * Interface for base64 file download properties
 */
interface DownloadBase64FileProps {
  base64Data: string;
  fileName: string;
  fileFormat?: string;
}

/**
 * Maps common file extensions to their corresponding MIME types
 */
const extensionToMimeType: Record<string, string> = {
  // Images
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',

  // Documents
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'rtf': 'application/rtf',

  // Archives
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',

  // Audio
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'm4a': 'audio/mp4',

  // Video
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',

  // Other common formats
  'csv': 'text/csv',
  'json': 'application/json',
  'xml': 'application/xml',
  'html': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
};

/**
 * Detects the file format from a base64 string by examining its signature
 * @param base64Data - The base64 encoded file data
 * @returns The detected MIME type or 'application/octet-stream' as fallback
 */
export const detectFileFormat = (base64Data: string): string => {
  // Remove potential prefixes like "data:application/pdf;base64,"
  const cleanBase64 = base64Data.split(',').pop() || base64Data;

  // Convert the beginning of the base64 string to analyze its signature
  try {
    // Convert base64 to binary to check file signatures
    const binaryString = atob(cleanBase64.substring(0, 24));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check for common file signatures
    // PDF: starts with %PDF (hex: 25 50 44 46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return 'application/pdf';
    }

    // PNG: starts with ‰PNG (hex: 89 50 4E 47)
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }

    // JPEG: starts with ÿØÿ (hex: FF D8 FF)
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }

    // GIF: starts with GIF (hex: 47 49 46)
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }

    // ZIP: starts with PK (hex: 50 4B)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
      return 'application/zip';
    }

    // DOCX, XLSX, PPTX (Office Open XML)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      // These all use ZIP format, but without additional parsing we can't determine which Office format
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // MP3: starts with ID3 (hex: 49 44 33)
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      return 'audio/mpeg';
    }

    // If data URL format is present, try to extract MIME type
    if (base64Data.startsWith('data:')) {
      const mimeMatch = base64Data.match(/data:([^;]+);/);
      if (mimeMatch && mimeMatch[1]) {
        return mimeMatch[1];
      }
    }
  } catch (error) {
    console.error('Error detecting file format:', error);
  }

  // Default fallback
  return 'application/octet-stream';
};

/**
 * Extracts file extension from a filename
 * @param fileName - The filename to extract extension from
 * @returns The file extension or empty string if none found
 */
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  return '';
};

/**
 * Gets MIME type from file extension
 * @param fileName - The filename to determine MIME type for
 * @returns The corresponding MIME type or application/octet-stream if unknown
 */
export const getMimeTypeFromFileName = (fileName: string): string => {
  const extension = getFileExtension(fileName);
  return extensionToMimeType[extension] || 'application/octet-stream';
};

/**
 * Generic function to handle downloading of base64 encoded files with automatic format detection
 * @param downloadBase64FileProps - The download properties including base64 data and filename
 */
export const handleDownloadOfBase64File2 = (
  downloadBase64FileProps: DownloadBase64FileProps
) => {
  const { base64Data, fileName, fileFormat } = downloadBase64FileProps;

  try {
    // First try using provided fileFormat, then check filename, then analyze the base64 data
    const mimeTypeFromFileName = getMimeTypeFromFileName(fileName);
    const detectedFormat = fileFormat || mimeTypeFromFileName || detectFileFormat(base64Data);

    // Prepare the data URL
    let dataUrl = base64Data;

    // If it's not already a data URL, convert it
    if (!base64Data.startsWith('data:')) {
      dataUrl = `data:${detectedFormat};base64,${base64Data}`;
    }

    // Create an anchor element for downloading
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = fileName;

    // Append to the body, click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

/**
 * Function to handle downloading any base64 encoded file with automatic format detection
 * @param downloadBase64FileProps - The download properties (without needing fileFormat)
 */
export const handleDownloadOfAnyBase64File = (
  downloadBase64FileProps: Omit<DownloadBase64FileProps, 'fileFormat'>
) => {
  handleDownloadOfBase64File2({
    ...downloadBase64FileProps,
    // fileFormat will be automatically detected
  });
};


// File type configuration - easily customizable
export const FILE_TYPES = {
  png: { mime: 'image/png', ext: '.png' },
  jpg: { mime: 'image/jpeg', ext: '.jpg' },
  jpeg: { mime: 'image/jpeg', ext: '.jpeg' },
  gif: { mime: 'image/gif', ext: '.gif' },
  pdf: { mime: 'application/pdf', ext: '.pdf' },
  doc: { mime: 'application/msword', ext: '.doc' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: '.docx' },
  xls: { mime: 'application/vnd.ms-excel', ext: '.xls' },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' },
  txt: { mime: 'text/plain', ext: '.txt' },
  csv: { mime: 'text/csv', ext: '.csv' },
};

// Blocked extensions for security
export const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'vbs', 'js', 'jar', 'php', 'asp', 'jsp', 'sh', 'ps1'];
