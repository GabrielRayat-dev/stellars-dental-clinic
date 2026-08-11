const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let fileTypeFromBuffer = null;

const detectFileType = async (buffer) => {
  if (!fileTypeFromBuffer) {
    const mod = await import('file-type');
    fileTypeFromBuffer = mod.fileTypeFromBuffer;
  }
  return fileTypeFromBuffer(buffer);
};

const verifyImageContent = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const type = await detectFileType(req.file.buffer);

    if (!type || !ALLOWED_TYPES.includes(type.mime)) {
      return res.status(400).json({ message: 'File content does not match an allowed image type' });
    }

    // Use the detected MIME type so stored files reflect their real content
    req.file.mimetype = type.mime;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = verifyImageContent;
