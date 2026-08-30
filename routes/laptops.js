import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getLaptops,
  getLatest,
  getFeatured,
  getBySlug,
  getFilterOptions,
  createLaptop,
  updateLaptop,
  deleteLaptop,
  adminList,
} from '../controllers/laptopController.js';

const router = express.Router();

// Public
router.get('/', getLaptops);
router.get('/latest', getLatest);
router.get('/featured', getFeatured);
router.get('/filters', getFilterOptions);
router.get('/:slug', getBySlug);

// Admin
router.post('/', protect, createLaptop);
router.put('/:id', protect, updateLaptop);
router.delete('/:id', protect, deleteLaptop);
router.get('/admin/all', protect, adminList);

export default router;