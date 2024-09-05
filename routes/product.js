import express from 'express';
import Product from '../models/Product.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Import the auth middleware

const router = express.Router();

// Create a new product (protected route)
router.post('/create', authMiddleware, async (req, res) => {
  const { name, description, price } = req.body;

  try {
    // Create a new product associated with the authenticated user
    const product = new Product({
      name,
      description,
      price,
      user: req.user.userId,
    });

    // Save the product to the database
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products of the authenticated user (protected route)
router.get('/my-products', authMiddleware, async (req, res) => {
  try {
    // Find all products where the user is the current authenticated user
    const products = await Product.find({ user: req.user.userId });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }

});

// Update a product (protected route)
router.put('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
  
    try {
      // Find the product by ID and check if the product belongs to the current user
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      if (product.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to update this product' });
      }
  
      // Update the product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
  
      // Save the updated product
      await product.save();
  
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a product (protected route)
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the product by ID
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Check if the product belongs to the current user
      if (product.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this product' });
      }
  
      // Delete the product
      await product.deleteOne({_id: id});
  
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

    // Get all products for a specific user (protected route)
router.get('/user/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Check if the authenticated user is trying to get products for their own userId
      if (userId !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to view these products' });
      }
  
      // Find all products associated with the given userId
      const products = await Product.find({ user: userId }).populate('user', 'name email');;
  
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
