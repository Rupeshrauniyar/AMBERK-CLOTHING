const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getFilters,
  searchSuggest,
  getRelated,
} = require('../controllers/storeProductController');

router.get('/', getProducts);
router.get('/filters', getFilters);
router.get('/search/suggest', searchSuggest);
router.get('/:slug/related', getRelated);
router.get('/:slug', getProductBySlug);

module.exports = router;
