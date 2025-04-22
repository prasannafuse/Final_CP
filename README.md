# Home Service Management Web Application

A full-stack web application for managing home services like plumbing, electrical work, carpentry, etc.

## Features

- User authentication (Sign Up, Login, Logout)
- Service listing and details view
- Service booking system
- Admin dashboard for managing bookings
- Contact form

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript with Bootstrap for responsive design
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Template Engine**: EJS
- **Authentication**: JWT (JSON Web Tokens)

## Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   ```
4. Run the application
   ```
   npm run dev
   ```

## Project Structure

```
HomeServiceApp/
├── config/             # Configuration files
├── controllers/        # Controller functions
├── middleware/         # Middleware functions
├── models/             # Database models
├── public/             # Static files (CSS, JS, images)
├── routes/             # Route definitions
├── views/              # EJS templates
│   ├── pages/          # Page templates
│   └── partials/       # Reusable template parts
├── app.js              # Main application file
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Deployment

This application is designed to be easily deployed to platforms like Render or Vercel.

## License

MIT 