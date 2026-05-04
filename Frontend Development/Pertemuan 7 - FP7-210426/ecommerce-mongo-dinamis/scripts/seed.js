/**
 * Seed script to populate MongoDB with sample products
 * Run with: node scripts/seed.js
 * Make sure MongoDB is running and MONGODB_URI is set in .env.local
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  stock: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", ProductSchema);

const sampleProducts = [
  {
    id: 1,
    name: "Laptop Pro",
    price: 1299.99,
    description: "High-performance laptop with 16GB RAM and 512GB SSD",
    stock: 10,
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 29.99,
    description: "Ergonomic wireless mouse with 2.4GHz connection",
    stock: 50,
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 49.99,
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
    stock: 25,
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 129.99,
    description: "RGB mechanical keyboard with Cherry MX switches",
    stock: 15,
  },
  {
    id: 5,
    name: "Monitor 27 inch",
    price: 349.99,
    description: "4K UHD monitor with 60Hz refresh rate",
    stock: 8,
  },
  {
    id: 6,
    name: "Webcam 1080p",
    price: 79.99,
    description: "Full HD webcam with auto-focus and built-in microphone",
    stock: 20,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log("\nSample products:");
    insertedProducts.forEach((product) => {
      console.log(`- ${product.name}: $${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
