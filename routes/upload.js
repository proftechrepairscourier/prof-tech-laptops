import express from 'express';
import cloudinary from 'cloudinary';
import  DataUriParser  from 'datauri/parser.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
const parser = new DataUriParser();

// Upload multiple images at once (array field 'images')
router.post(
  '/images',
  protect,
  upload.array('images', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      const results = await Promise.all(
        req.files.map((file) => {
          const dataUri = parser.format(file.originalname, file.buffer);
          return cloudinary.v2.uploader.upload(dataUri.content, {
            folder: 'proftech/laptops',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1200, crop: 'limit' },
            ],
          });
        })
      );
      const uploaded = results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
      }));
      res.json({ images: uploaded });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete a single image by publicId
router.post('/images/delete', protect, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId required' });
    await cloudinary.v2.uploader.destroy(publicId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;