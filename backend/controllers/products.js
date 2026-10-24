const Product = require('../models/Product');
const axios = require('axios');

const getProducts = async (req, res) => {
  try {
    let { category, material, minPrice, maxPrice, sort, page = 1, limit = 100, search } = req.query;

    // Safe parsing and validation
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 100;
    minPrice = minPrice ? parseFloat(minPrice) : undefined;
    maxPrice = maxPrice ? parseFloat(maxPrice) : undefined;

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 100;
    if (minPrice !== undefined && isNaN(minPrice)) minPrice = undefined;
    if (maxPrice !== undefined && isNaN(maxPrice)) maxPrice = undefined;

    let query = {};
    
    // Search functionality
    if (search && String(search).trim() !== '') {
      const searchTerm = String(search).trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { material: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Normalize filters and ignore empty strings so "All" selections don't filter out everything
    const normalizedCategory = normalizeCategory(category);
    if (normalizedCategory) {
      query.category = normalizedCategory;
    }
    if (material && String(material).trim() !== '') {
      query.material = String(material).trim();
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    let sortOption = {};
    if (sort === 'price') sortOption.price = 1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'popularity') sortOption.rating = -1;
    else {
      // Default to newest first so newly added items are visible without selecting sort
      sortOption.createdAt = -1;
    }

    console.log('Product query:', JSON.stringify(query));
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await Product.countDocuments(query);
    console.log(`Found ${products.length} products (total: ${total})`);
    res.json({ products, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Compute live price using same logic as cart
    try {
      const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
      const base = `http://localhost:${backendPort}/api/prices`;
      await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
      const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
      
      const materialLower = String(product.material || '').trim().toLowerCase();
      const weight = Number(product.weight || 0);
      
      if (weight > 0) {
        if (materialLower === 'gold' && latest?.data?.gold?.price) {
          const perGram = Number(latest.data.gold.price) || 6500;
          const karat = Number(product.karat || 24);
          const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : karat === 18 ? 18/24 : karat/24;
          product.price = Math.round(perGram * weight * purity);
        } else if (materialLower === 'silver' && latest?.data?.silver?.price) {
          const perGram = Number(latest.data.silver.price) || 75;
          product.price = Math.round(perGram * weight);
        }
      }
    } catch (priceErr) {
      console.warn('Failed to compute live price for product detail:', priceErr.message);
    }
    
    res.json(product);
  } catch (err) {
    console.error('Error in getProductById:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const ALLOWED_CATEGORIES = [
  'rings', 'necklaces', 'bracelets', 'earrings', 'pendants', 'sets', 'wedding'
];

function normalizeCategory(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase();
}

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    // Normalize and validate category
    productData.category = normalizeCategory(productData.category);
    if (!productData.category || !ALLOWED_CATEGORIES.includes(productData.category)) {
      return res.status(400).json({ error: 'Invalid or missing category. Allowed: ' + ALLOWED_CATEGORIES.join(', ') });
    }
    // Basic numeric coercion
    if (productData.weight !== undefined) productData.weight = Number(productData.weight);
    if (productData.karat !== undefined) productData.karat = Number(productData.karat);

    // If material is gold, ensure karat and compute live price from backend pricing
    const materialLower = String(productData.material || '').trim().toLowerCase();
    if (materialLower === 'gold') {
      if (!productData.karat || ![24, 22, 18].includes(productData.karat)) {
        productData.karat = 24;
      }
      if (!productData.weight || isNaN(productData.weight) || productData.weight <= 0) {
        return res.status(400).json({ error: 'Weight (grams) is required to compute live price for gold products' });
      }
      try {
        // Populate/refresh cache and read per-gram
        const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
        const base = `http://localhost:${backendPort}/api/prices`;
        // Hit main endpoint to ensure cache has latest
        await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
        // Then compute directly using cached per-gram logic
        const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
        let perGram = 0;
        if (latest && latest.data && latest.data.gold && latest.data.gold.price) {
          perGram = Number(latest.data.gold.price) || 0;
        }
        if (!perGram || perGram <= 0) {
          // Fallback hardcoded per-gram to keep admin ops smooth
          perGram = 6500;
        }
        const purity = productData.karat === 24 ? 1.0 : productData.karat === 22 ? 22/24 : 18/24;
        productData.price = Math.round(perGram * productData.weight * purity);
      } catch (calcErr) {
        console.warn('Live price calc failed, using fallback:', calcErr && calcErr.message ? calcErr.message : calcErr);
        const purity = productData.karat === 24 ? 1.0 : productData.karat === 22 ? 22/24 : 18/24;
        const perGramFallback = 6500; // INR fallback
        productData.price = Math.round(perGramFallback * productData.weight * purity);
      }
    } else if (materialLower === 'silver') {
      if (!productData.weight || isNaN(productData.weight) || productData.weight <= 0) {
        return res.status(400).json({ error: 'Weight (grams) is required to compute live price for silver products' });
      }
      try {
        const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
        const base = `http://localhost:${backendPort}/api/prices`;
        await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
        const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
        let perGram = 0;
        if (latest && latest.data && latest.data.silver && latest.data.silver.price) {
          perGram = Number(latest.data.silver.price) || 0;
        }
        if (!perGram || perGram <= 0) {
          perGram = 75; // INR fallback for silver
        }
        productData.price = Math.round(perGram * productData.weight);
      } catch (calcErr) {
        console.warn('Live silver price calc failed, using fallback:', calcErr && calcErr.message ? calcErr.message : calcErr);
        const perGramFallback = 75;
        productData.price = Math.round(perGramFallback * productData.weight);
      }
    } else {
      // Other materials: keep price if provided, else default 0
      if (productData.price !== undefined) productData.price = Number(productData.price);
      else productData.price = 0;
    }

    if (req.file) {
      // Store path under /api/uploads so frontend dev server proxy can resolve correctly
      productData.images = [`/api/uploads/products/${req.file.filename}`];
    } else if (!productData.images || productData.images.length === 0) {
      // Ensure images array is never empty
      productData.images = ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='];
    }
    console.log('[PRODUCTS] create incoming data:', {
      name: productData.name,
      category: productData.category,
      material: productData.material,
      price: productData.price,
      weight: productData.weight,
      hasFile: !!req.file
    });
    const product = new Product(productData);
    await product.save();
    console.log('Product created successfully:', product._id, product.category);
    console.log('[PRODUCTS] persisted doc snapshot:', {
      _id: product._id.toString(),
      name: product.name,
      category: product.category,
      price: product.price,
      images: product.images,
      createdAt: product.createdAt
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(400).json({ error: err.message || 'Bad Request' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.category) {
      updateData.category = normalizeCategory(updateData.category);
      if (!ALLOWED_CATEGORIES.includes(updateData.category)) {
        return res.status(400).json({ error: 'Invalid category. Allowed: ' + ALLOWED_CATEGORIES.join(', ') });
      }
    }
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.weight !== undefined) updateData.weight = Number(updateData.weight);
    if (updateData.karat !== undefined) updateData.karat = Number(updateData.karat);
    if (req.file) {
      updateData.images = [`/api/uploads/products/${req.file.filename}`];
    }
    // If material provided, normalize lowercase for branching
    const materialLower = String(updateData.material || '').trim().toLowerCase();

    // Fetch existing product for context if needed
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Merge updates for decision-making
    const next = {
      ...product.toObject(),
      ...updateData,
    };

    // Auto-recalc logic
    if (materialLower === 'gold' || String(next.material || '').trim().toLowerCase() === 'gold') {
      const karatVal = (updateData.karat !== undefined ? updateData.karat : product.karat) || 24;
      const weightVal = (updateData.weight !== undefined ? updateData.weight : product.weight) || 0;
      if (weightVal > 0) {
        try {
          const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
          const base = `http://localhost:${backendPort}/api/prices`;
          await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
          const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
          let perGram = 0;
          if (latest && latest.data && latest.data.gold && latest.data.gold.price) {
            perGram = Number(latest.data.gold.price) || 0;
          }
          if (!perGram || perGram <= 0) perGram = 6500;
          const purity = karatVal === 24 ? 1.0 : karatVal === 22 ? 22/24 : 18/24;
          updateData.price = Math.round(perGram * weightVal * purity);
          updateData.karat = karatVal; // ensure persisted
        } catch (e) {
          const purity = karatVal === 24 ? 1.0 : karatVal === 22 ? 22/24 : 18/24;
          updateData.price = Math.round(6500 * weightVal * purity);
          updateData.karat = karatVal;
        }
      }
    } else if (materialLower === 'silver' || String(next.material || '').trim().toLowerCase() === 'silver') {
      const weightVal = (updateData.weight !== undefined ? updateData.weight : product.weight) || 0;
      if (weightVal > 0) {
        try {
          const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
          const base = `http://localhost:${backendPort}/api/prices`;
          await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
          const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
          let perGram = 0;
          if (latest && latest.data && latest.data.silver && latest.data.silver.price) {
            perGram = Number(latest.data.silver.price) || 0;
          }
          if (!perGram || perGram <= 0) perGram = 75;
          updateData.price = Math.round(perGram * weightVal);
        } catch (e) {
          updateData.price = Math.round(75 * weightVal);
        }
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(400).json({ error: err.message || 'Bad Request' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error in deleteProduct:', err);
    res.status(400).json({ error: err.message || 'Bad Request' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
