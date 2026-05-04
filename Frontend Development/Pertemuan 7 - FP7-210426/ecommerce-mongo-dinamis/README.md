This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Database Configuration

This project uses **MongoDB with Mongoose** for data storage.

### Setup Instructions

1. **Copy the environment file:**
```bash
cp .env.local.example .env.local
```

2. **Update `.env.local` with your MongoDB connection URI:**
   - For local MongoDB: `mongodb://localhost:27017/ecommerce`
   - For MongoDB Atlas (cloud): `mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority`

3. **Install dependencies:**
```bash
npm install
```

4. **Seed the database with sample products:**
```bash
node scripts/seed.js
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000)** with your browser to see the result.

## Features

### Dynamic E-Commerce Platform

✅ **Product Listing** - Browse all products dynamically fetched from database
✅ **Product Details** - View detailed product information with dynamic routing
✅ **Shopping Cart** - Add products to cart and manage quantities
✅ **Cart Management** - Update quantities, remove items, view totals
✅ **RESTful API** - Complete CRUD operations for products and cart

## API Endpoints

### Products

- **GET `/api/products`** - Fetch all products
  ```json
  Response: [{ _id, name, price, description, image, stock, createdAt, updatedAt }]
  ```

- **POST `/api/products`** - Create a new product (Admin)
  ```json
  Request: { name, price, description?, image?, stock?, id? }
  Response: { message, data }
  ```

- **GET `/api/products/[id]`** - Fetch single product
  ```json
  Response: { _id, name, price, description, image, stock, createdAt, updatedAt }
  ```

- **PATCH `/api/products/[id]`** - Update product (Admin)
  ```json
  Request: { name?, price?, description?, image?, stock? }
  Response: { message, data }
  ```

- **DELETE `/api/products/[id]`** - Delete product (Admin)
  ```json
  Response: { message, data }
  ```

### Cart

- **GET `/api/cart`** - Fetch all cart items with product details
  ```json
  Response: [{ _id, product_id, user_id, quantity, createdAt, updatedAt }]
  ```

- **POST `/api/cart`** - Add product to cart
  ```json
  Request: { product_id, qty, user_id? }
  Response: { message, data }
  ```

- **PATCH `/api/cart/[id]`** - Update cart item quantity
  ```json
  Request: { quantity }
  Response: { message, data }
  ```

- **DELETE `/api/cart/[id]`** - Remove item from cart
  ```json
  Response: { message, data }
  ```

## Pages

- **Home** (`/`) - Welcome page with link to products
- **Products** (`/products`) - Product listing with add to cart buttons
- **Product Detail** (`/product/[id]`) - Individual product page with full details and add to cart
- **Shopping Cart** (`/cart`) - Cart management with quantity adjustment and checkout button

## UI Components

- **NavBar** - Navigation with links to Home, Products, and Cart
- **ProductCard** - Product display card with price, stock info, and quick add to cart button
- **ProductDetail** - Full product information and add to cart form
- **CartPage** - Interactive cart with quantity controls and order summary

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Mongoose Documentation](https://mongoosejs.com/) - learn about Mongoose ODM.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
