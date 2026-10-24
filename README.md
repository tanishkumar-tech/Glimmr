# Glimmr - Timeless Elegance in Jewelry

A full-stack jewelry e-commerce website inspired by Tanishq, built with React (frontend) and Express (backend) using MongoDB. Glimmr brings you exquisite jewelry pieces crafted with passion and precision.

## Features

- **User Authentication**: Secure register/login system
- **Product Catalog**: Extensive collection with advanced filters and pagination
- **Product Details**: In-depth product pages with zoom and variants
- **Shopping Cart**: Seamless cart management with quantity updates
- **Secure Checkout**: Stripe integration for safe payments
- **Order History**: Track your purchases and order status
- **Admin Dashboard**: Comprehensive product management for administrators
- **AI Jewelry Recommender**: Personalized recommendations based on preferences
- **Live Price Charts**: Real-time gold and silver price tracking
- **Responsive Design**: Optimized for all devices with smooth animations
- **Luxury UI**: Elegant design with gold accents and premium typography

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Stripe account for payments

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   MONGO_URI=mongodb+srv://Ayush:12345@cluster0.qhs1btd.mongodb.net/
   JWT_SECRET=your_jwt_secret_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   OPENAI_API_KEY=your_openai_key_optional
   PRICE_API_KEY=your_price_api_key_optional
   ```

4. Seed the database with Glimmr products:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   Server runs on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

## Testing

### Stripe Payments
- Use test card: `4242 4242 4242 4242`
- Any future expiry date and CVC

### Sample Accounts
- **Admin**: admin@glimmr.com / password123
- **User**: user@glimmr.com / password123

## Project Structure

```
glimmr/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── seed/            # Database seeding
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   └── tailwind.config.js # Tailwind configuration
└── README.md
```

## Technologies Used

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Chart.js**: Data visualization for price charts
- **Framer Motion**: Smooth animations (planned)

### Backend
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Stripe**: Payment processing
- **OpenAI**: AI-powered recommendations (optional)
- **bcryptjs**: Password hashing

## Color Palette
- Primary: #C5A572 (Gold)
- Secondary: #FFFFFF (White)
- Text: #333333 (Dark Gray)
- Accent: #F7F2E8 (Light Cream)
- Hover: #B68D40 (Deep Gold)

## Typography
- Headings: Playfair Display (serif)
- Body: Poppins (sans-serif)

## API Endpoints

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Cart
- `POST /api/cart` - Add to cart
- `GET /api/cart/:userId` - Get user cart
- `PUT /api/cart/:userId` - Update cart item
- `DELETE /api/cart/:userId/:productId` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:userId` - Get user orders

### Recommendations
- `POST /api/recommend` - Get AI recommendations

### Prices
- `GET /api/prices` - Get live metal prices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2025 Glimmr. All rights reserved.
