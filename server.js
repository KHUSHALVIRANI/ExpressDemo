import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auths.js'; 
import productRoutes from './routes/product.js'; 
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Use the product routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
