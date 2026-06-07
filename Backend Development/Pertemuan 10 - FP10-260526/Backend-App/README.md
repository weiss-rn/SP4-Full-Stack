# Express MySQL API

A simple Express.js application with MySQL database integration using async/await patterns.

## Project Structure

```
Backend-App/
├── config/           # Configuration files
│   └── index.js     # Configuration settings
├── controllers/      # Business logic
│   └── ProductController.js
├── middleware/       # Custom middleware
│   └── errorHandler.js
├── routes/          # API routes
│   └── products.js
├── db.js            # Database connection
├── server.js        # Main server file
├── package.json     # Dependencies
├── db.sql           # Database schema
├── .env.example     # Environment variables template
└── README.md        # This file
```

## Installation

1. Clone or download this project
2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=express_mysql
   DB_PORT=3306
   PORT=5000
   ```

5. Create the database and tables:
   ```bash
   mysql -u root -p < db.sql
   ```

## Available Scripts

- **Start development**: `pnpm dev`
- **Start production**: `pnpm start`

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `GET /api/health` - Health check
- `GET /api/test-db` - Test database connection

## Example Request

```bash
# Get all products
curl http://localhost:5000/api/products

# Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "description": "Product Description",
    "price": 50000,
    "stock": 10
  }'
```

## Technologies Used

- **Express.js** - Web framework
- **MySQL2** - MySQL database driver
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management
- **body-parser** - Request body parser

## Notes

- This is raw code without a running server
- Ensure MySQL server is running before starting the application
- Database must exist before running the server
- The project uses ES modules (import/export syntax)
