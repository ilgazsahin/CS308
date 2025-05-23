# Online Bookstore Application

A MERN stack online bookstore application with features for customers, product managers, and sales managers.

## Features

- User authentication and role-based access control
- Book browsing, filtering, and searching
- Shopping cart and wishlist functionality
- Order processing and tracking
- Product management (add, edit, delete books)
- Sales analytics and reporting
- Order cancellation and refund processing

## Docker Deployment Instructions

This application is containerized using Docker for easy deployment and scalability.

### Prerequisites

- Docker and Docker Compose installed on your system
- Git for cloning the repository

### Deployment Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3001

### Container Structure

- **Frontend**: React application served via Nginx
- **Backend**: Node.js Express API
- **Database**: MongoDB

### Environment Variables

The application uses the following environment variables which can be modified in the `docker-compose.yml` file:

- `MONGO_URI`: MongoDB connection string
- `PORT`: Backend API port
- `NODE_ENV`: Application environment (development, production)
- `JWT_SECRET`: Secret key for JWT token generation

## Development Without Docker

### Backend

```
npm install
npm run dev
```

### Frontend

```
cd client
npm install
npm start
```

## Testing

```
npm test
``` 