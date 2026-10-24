const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products');
const adminAuth = require('../middleware/admin');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'products'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/products - with filters and pagination
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// POST /api/products - admin create
router.post('/', adminAuth, upload.single('image'), createProduct);

// PUT /api/products/:id - admin edit
router.put('/:id', adminAuth, upload.single('image'), updateProduct);

// DELETE /api/products/:id - admin delete
router.delete('/:id', adminAuth, deleteProduct);

module.exports = router;
