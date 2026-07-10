# Food Link 🍽️

A comprehensive food donation and distribution platform that connects restaurants, NGOs, and communities to reduce food waste and fight hunger.

## 🌟 Features

### For Restaurants
- **Food Listing Management**: Create and manage surplus food listings with detailed descriptions
- **Real-time Notifications**: Get instant updates when NGOs request your food donations
- **Pickup Scheduling**: Coordinate pickup times and locations efficiently
- **Dashboard Analytics**: Track your donation impact and engagement

### For NGOs
- **Browse Available Food**: View real-time food listings from nearby restaurants
- **Request Management**: Submit and track food donation requests
- **Pickup Coordination**: Schedule pickups and manage logistics
- **Impact Tracking**: Monitor your organization's food rescue efforts

### For Administrators
- **User Management**: Oversee restaurant and NGO registrations
- **System Monitoring**: Track platform usage and performance metrics
- **Content Moderation**: Ensure quality and compliance across listings

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **CSS Modules** - Scoped styling for components
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **JWT Authentication** - Secure user authentication system

## 📁 Project Structure

```
Food Link/
├── backend/                 # Server-side application
│   ├── config/            # Database and app configuration
│   ├── middleware/        # Authentication and validation
│   ├── models/            # Database models and schemas
│   ├── routes/            # API endpoints
│   └── server.js          # Main server file
├── frontend/               # Client-side application
│   ├── src/
│   │   ├── admin/         # Admin dashboard components
│   │   ├── auth/          # Authentication components
│   │   ├── components/    # Reusable UI components
│   │   ├── foodlisting/   # Food listing management
│   │   ├── ngo_dashboard/ # NGO dashboard components
│   │   ├── pages/         # Main page components
│   │   ├── portals/       # User portal components
│   │   └── restaurant_dashboard/ # Restaurant dashboard
│   └── public/            # Static assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for secure authentication:
- **Restaurant Registration/Login**: Secure access to restaurant dashboard
- **NGO Registration/Login**: Secure access to NGO dashboard
- **Admin Access**: Restricted administrative functions

## 📱 User Roles

### Restaurant Users
- Register restaurant information
- Create food donation listings
- Manage pickup schedules
- View donation history

### NGO Users
- Register organization details
- Browse available food listings
- Submit donation requests
- Coordinate pickups

### Admin Users
- Approve user registrations
- Monitor platform activity
- Manage system settings
- Generate reports

## 🌐 API Endpoints

### Food Management
- `POST /api/foodlisting` - Create new food listing
- `GET /api/foodlisting` - Get all food listings
- `PUT /api/foodlisting/:id` - Update food listing
- `DELETE /api/foodlisting/:id` - Delete food listing

### User Management
- `POST /api/restaurant/register` - Restaurant registration
- `POST /api/ngo/register` - NGO registration
- `POST /api/auth/login` - User authentication

### Request Management
- `POST /api/request` - Submit food request
- `GET /api/request` - Get user requests
- `PUT /api/request/:id` - Update request status

## 🎨 UI/UX Features

- **Dark/Light Theme Toggle**: User preference customization
- **Responsive Design**: Optimized for all device sizes
- **Modern Interface**: Clean, intuitive user experience
- **Accessibility**: WCAG compliant design principles

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side data validation
- **CORS Protection**: Cross-origin request security
- **Password Hashing**: Secure password storage

## 📊 Monitoring & Analytics

- **Real-time Statistics**: Live platform usage metrics
- **User Activity Tracking**: Monitor engagement patterns
- **Performance Metrics**: System health monitoring
- **Error Logging**: Comprehensive error tracking

## 🤝 Contributing

We welcome contributions to improve Food Link! Please read our contributing guidelines and submit pull requests for any enhancements.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- **Restaurants**: For donating surplus food and reducing waste
- **NGOs**: For distributing food to communities in need
- **Volunteers**: For supporting food rescue operations
- **Open Source Community**: For the amazing tools and libraries


**Food Link** - Connecting surplus food with those who need it most. Together, we can make a difference in reducing food waste and fighting hunger. 🌍❤️
