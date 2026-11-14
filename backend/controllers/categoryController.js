const { Category } = require('../models/Category');
const slugify = require('slugify');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, displayOrder, isActive, isFeatured, seoTitle, seoDescription } = req.body;
    const finalSlug = (slug || slugify(name, { lower: true, strict: true })).toLowerCase();

    const category = await Category.create({
      name,
      slug: finalSlug,
      description: description || '',
      image: image || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase().trim();
    } else if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name, { lower: true, strict: true });
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Category deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

