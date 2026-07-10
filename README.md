# Food Link 🍽️

A comprehensive food donation and distribution platform that connects restaurants, NGOs, and communities to reduce food waste and fight hunger.

## 🌟 Features

### For Restaurants
- **Food Listing Management**: Create and manage surplus food listings with detailed descriptions and images
- **Real-time Notifications**: Get instant updates via Socket.IO when NGOs request your food donations
- **Pickup Scheduling**: Coordinate pickup times and locations efficiently
- **Dashboard Analytics**: Track your donation impact and engagement
- **Listing Templates**: Save and reuse food listing templates for faster posting

### For NGOs
- **Browse Available Food**: View real-time food listings from nearby restaurants
- **Claim & Request Management**: Submit and track food donation claims and requests
- **Pickup Coordination**: Schedule pickups and manage logistics
- **Impact Tracking**: Monitor your organisation's food rescue efforts
- **Review System**: Leave and view reviews for restaurants

### For Administrators
- **User Management**: Oversee restaurant and NGO registrations
- **System Monitoring**: Track platform usage and performance metrics
- **Content Moderation**: Ensure quality and compliance across listings

## 🚀 Tech Stack

### Frontend
- **React 19** — Modern UI framework with hooks
- **Vite 6** — Fast build tool and development server
- **TailwindCSS 4** — Utility-first CSS framework
- **HeroUI / NextUI** — Accessible component library
- **React Router v7** — Client-side routing
- **Framer Motion** — Smooth animations and transitions
- **Socket.IO Client** — Real-time communication
- **Leaflet / React Leaflet** — Interactive maps for pickup locations
- **Axios** — HTTP client for API requests
- **i18next / react-i18next** — Internationalisation (i18n) support
- **React Icons & Heroicons** — Icon libraries

### Backend
- **Node.js** — Server-side JavaScript runtime
- **Express 5** — Web application framework
- **MongoDB + Mongoose** — NoSQL database with schema modelling
- **JWT Authentication** — Secure access and refresh token system
- **Socket.IO** — Real-time bidirectional event-based communication
- **Cloudinary + Multer** — Image upload and cloud storage
- **Nodemailer** — Email notifications via SMTP (Gmail)
- **PDFKit** — PDF report generation
- **node-cron** — Scheduled background jobs
- **bcryptjs** — Secure password hashing

## 📁 Project Structure

```
Food Link/
├── backend/                    # Server-side application
│   ├── config/                 # Database connection & seeder scripts
│   ├── jobs/                   # Scheduled cron jobs
│   ├── middleware/             # Authentication & validation middleware
│   ├── models/                 # Mongoose schemas & models
│   │   ├── Claim.js
│   │   ├── Food.js
│   │   ├── FoodListing.js
│   │   ├── Message.js
│   │   ├── Ngo.js
│   │   ├── Notification.js
│   │   ├── Restaurant.js
│   │   ├── Review.js
│   │   ├── User.js
│   │   └── ...
│   ├── routes/                 # API route handlers
│   │   ├── auth.js
│   │   ├── foodlisting.js
│   │   ├── listings.js
│   │   ├── claims.js
│   │   ├── messages.js
│   │   ├── ngo.js
│   │   ├── restaurant.js
│   │   ├── reviews.js
│   │   ├── notifications.js
│   │   └── ...
│   ├── utils/                  # Utility helpers
│   └── server.js               # Main server entry point
├── frontend/                   # Client-side application
│   ├── public/                 # Static assets
│   └── src/
│       ├── auth/               # Login & registration flows
│       ├── components/         # Reusable UI components
│       ├── context/            # React context providers
│       ├── foodlisting/        # Food listing management views
│       ├── i18n/               # Internationalisation config
│       ├── messages/           # In-app messaging components
│       ├── ngo_dashboard/      # NGO dashboard components
│       ├── ngo_login/          # NGO login page
│       ├── ngo_reg/            # NGO registration page
│       ├── pages/              # Main page components (Home, About, etc.)
│       ├── portals/            # User portal entry points
│       ├── profile/            # User profile components
│       ├── restaurant_dashboard/ # Restaurant dashboard components
│       ├── restraunt_login/    # Restaurant login page
│       ├── restraunt_reg/      # Restaurant registration page
│       ├── services/           # API service functions (Axios)
│       ├── App.jsx             # Root component & routes
│       └── main.jsx            # Application entry point
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher) or a MongoDB Atlas cluster
- npm package manager
- A Cloudinary account (for image uploads)
- A Gmail account with an App Password (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/food-link.git
cd food-link
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [Environment Variables](#-environment-variables) below), then:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (see [Environment Variables](#-environment-variables) below), then:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## 🔑 Environment Variables

### Backend — `backend/.env`
```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRES=15m

# Cloudinary (image uploads) — https://console.cloudinary.com/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP via Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=Food Link <your_email@gmail.com>
```

### Frontend — `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for secure authentication:
- **Restaurant Registration/Login**: Secure access to restaurant dashboard
- **NGO Registration/Login**: Secure access to NGO dashboard
- **Admin Access**: Restricted administrative functions
- **Access Tokens**: Short-lived tokens (default: 15 minutes)
- **Password Hashing**: Passwords are hashed using `bcryptjs`

## 📱 User Roles

### Restaurant Users
- Register restaurant information and profile
- Create food donation listings with images
- Manage pickup schedules
- View donation history and impact stats

### NGO Users
- Register organisation details
- Browse available food listings on a map
- Submit claim or donation requests
- Coordinate pickups and leave reviews

### Admin Users
- Approve user registrations
- Monitor platform activity
- Manage system settings
- Generate PDF reports

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration
- `POST /api/auth/logout` — User logout

### Food Listings
- `POST /api/foodlisting` — Create a new food listing
- `GET /api/foodlisting` — Get all food listings
- `PUT /api/foodlisting/:id` — Update a food listing
- `DELETE /api/foodlisting/:id` — Delete a food listing

### Claims & Requests
- `POST /api/claims` — Submit a food claim
- `GET /api/claims` — Get claims for the current user
- `PUT /api/claims/:id` — Update claim status

### Restaurants & NGOs
- `POST /api/restaurant/register` — Restaurant registration
- `POST /api/ngo/register` — NGO registration
- `GET /api/restaurant` — Get restaurant details
- `GET /api/ngo` — Get NGO details

### Messaging & Notifications
- `GET /api/messages` — Get conversation messages
- `POST /api/messages` — Send a message
- `GET /api/notifications` — Get user notifications

### Reviews & Impact
- `POST /api/reviews` — Submit a review
- `GET /api/reviews` — Get reviews
- `GET /api/impact` — Get impact statistics

## 🎨 UI/UX Features

- **Internationalisation (i18n)**: Multi-language support via i18next
- **Interactive Maps**: Leaflet-based maps for visualising food pickup locations
- **Real-time Messaging**: In-app chat powered by Socket.IO
- **Responsive Design**: Optimised for all device sizes
- **Smooth Animations**: Framer Motion for polished transitions
- **Accessible Components**: HeroUI / NextUI components with ARIA support

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with expiry
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side data validation on all endpoints
- **CORS Protection**: Configured cross-origin request security
- **Environment Secrets**: All sensitive credentials stored in `.env` files (never committed)

## 🗄️ Database Scripts

The backend includes utility scripts:
```bash
# Seed the database with initial data
npm run seed

# Migrate legacy user records
npm run migrate
```

## 🤝 Contributing

We welcome contributions to improve Food Link! Please read our contributing guidelines and submit pull requests for any enhancements.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- **Restaurants**: For donating surplus food and reducing waste
- **NGOs**: For distributing food to communities in need
- **Volunteers**: For supporting food rescue operations
- **Open Source Community**: For the amazing tools and libraries that power this platform

---

**Food Link** — Connecting surplus food with those who need it most. Together, we can make a difference in reducing food waste and fighting hunger. 🌍❤️
