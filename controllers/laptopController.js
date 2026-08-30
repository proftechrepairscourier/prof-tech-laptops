import Laptop from '../models/Laptop.js';
import cloudinary from 'cloudinary';
import { makeSlug } from '../utils/slugify.js';

// ---------- PUBLIC ----------
export const getLaptops = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      ram,
      storage,
      generation,
      gpu,
      condition,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.categories = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (ram) query.ram = { $regex: ram, $options: 'i' };
    if (storage) query.storage = { $regex: storage, $options: 'i' };
    if (generation) query.generation = { $regex: generation, $options: 'i' };
    if (gpu) query.gpu = { $regex: gpu, $options: 'i' };
    if (condition) query.condition = { $regex: condition, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [laptops, total] = await Promise.all([
      Laptop.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Laptop.countDocuments(query),
    ]);

    res.json({
      laptops,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLatest = async (req, res) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 8);
    const laptops = await Laptop.find({ stockStatus: { $ne: 'sold_out' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ laptops });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const laptops = await Laptop.find({ featured: true, stockStatus: { $ne: 'sold_out' } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    res.json({ laptops });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBySlug = async (req, res) => {
  try {
    const laptop = await Laptop.findOne({ slug: req.params.slug }).lean();
    if (!laptop) return res.status(404).json({ message: 'Laptop not found' });
    res.json({ laptop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const [brands, generations, conditions] = await Promise.all([
      Laptop.distinct('brand'),
      Laptop.distinct('generation'),
      Laptop.distinct('condition'),
    ]);
    const priceRange = await Laptop.aggregate([
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]);
    res.json({
      brands: brands.sort(),
      generations: generations.filter(Boolean).sort(),
      conditions: conditions.filter(Boolean).sort(),
      priceRange: priceRange[0] || { min: 0, max: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- ADMIN ----------
export const createLaptop = async (req, res) => {
  try {
    const { brand, model } = req.body;
    let slug = makeSlug(`${brand}-${model}`);

    // ensure unique slug
    let existing = await Laptop.findOne({ slug });
    let counter = 1;
    while (existing) {
      slug = `${makeSlug(`${brand}-${model}`)}-${counter++}`;
      existing = await Laptop.findOne({ slug });
    }

    const laptop = await Laptop.create({ ...req.body, slug });
    res.status(201).json({ laptop });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLaptop = async (req, res) => {
  try {
    const laptop = await Laptop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!laptop) return res.status(404).json({ message: 'Not found' });
    res.json({ laptop });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLaptop = async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ message: 'Not found' });

    // Delete images from Cloudinary
    for (const img of laptop.images || []) {
      if (img.publicId) {
        await cloudinary.v2.uploader.destroy(img.publicId).catch(() => {});
      }
    }
    await laptop.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminList = async (req, res) => {
  try {
    const laptops = await Laptop.find().sort({ createdAt: -1 }).lean();
    res.json({ laptops });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};