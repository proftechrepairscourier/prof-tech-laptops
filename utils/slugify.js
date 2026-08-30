import slugifyLib from 'slugify';

export const makeSlug = (text) =>
  slugifyLib(text, { lower: true, strict: true, trim: true });