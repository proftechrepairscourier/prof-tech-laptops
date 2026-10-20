import mongoose from 'mongoose';

const laptopSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    productType: { 
      type: String, 
      enum: ['laptop', 'phone'], 
      default: 'laptop',
      index: true 
    },
    battery: { type: String, trim: true },
    camera: { type: String, trim: true },
    simSlots: { type: String, trim: true },
    categories: {
      type: [String],
      enum: ['students', 'office', 'gaming', 'engineering'],
      default: [],
      index: true,
    },

    processor: { type: String, trim: true },
    generation: { type: String, trim: true },
    ram: { type: String, trim: true },
    storage: { type: String, trim: true },
    screenSize: { type: String, trim: true },
    gpu: { type: String, trim: true },
    operatingSystem: { type: String, trim: true },
    condition: { type: String, trim: true },

    price: { type: Number, required: true, index: true },
    description: { type: String, default: '' },

    images: [{ url: String, publicId: String }],

    stockStatus: {
      type: String,
      enum: ['available', 'low_stock', 'sold_out'],
      default: 'available',
      index: true,
    },

    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Text index for search
laptopSchema.index({
  brand: 'text',
  model: 'text',
  processor: 'text',
  generation: 'text',
  battery: 'text',
  camera: 'text',
  description: 'text',
});

export default mongoose.model('Laptop', laptopSchema);