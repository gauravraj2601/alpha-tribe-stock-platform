# Alpha Tribe Stock Discussion  Platform Backend

This is the backend service for a community platform where users can discuss various stocks in the market. The backend focuses on user authentication, stock post management, a commenting system, likes, and more. It is built using the MERN stack (MongoDB, Express.js, Node.js).
### Deployment
- Deployed on Render - Deployed Backend Link https://alpha-tribe-stock-platform.onrender.com
- API documentation is generated using Swagger - Access the documentation at https://alpha-tribe-stock-platform.onrender.com/api-docs/
  - ( Note: The backend is deployed on Render's free tier, so it might take a few seconds for the live server to start when you first access the link. )
## Features

- **User Authentication (JWT-based)**
  - Registration, Login, and Profile Management.
- **Stock Post Management**
  - Create, retrieve, delete stock-related posts with options for tags and filtering.
- **Commenting System**
  - Users can comment on posts.
- **Like System**
  - Users can like or unlike posts.
- **Filtering and Sorting**
  - Filter posts by stock symbol or tags, sort by creation date or likes.

 <!--
- **Real-time Updates (Optional)**
  - Real-time updates using Socket.io for new comments or likes (Bonus).
-->

## Tech Stack

- **MongoDB** - Database to store users, posts, comments, and likes.
- **Express.js** - Web framework for building RESTful APIs.
- **Node.js** - Backend runtime environment.
- **JWT (JSON Web Tokens)** - For user authentication.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (locally or a cloud instance like MongoDB Atlas)

## Getting Started

Follow these steps to set up the project on your local machine:

### 1. Clone the Repository
    https://github.com/gauravraj2601/alpha-tribe-stock-platform
    cd alpha-tribe-stock-platform

### 2. Install Dependencies
Run the following command to install the required packages:

      npm install
    
### 3. Environment Variables
Create a .env file in the root directory and add the following environment variables:

    MONGO_URL=<your-mongodb-connection-string>
    JWT_SECRET_KEY=<your-secret-key>
    PORT=8080  
      


### 4. Run the Application
To start the application in development mode:

    npm run dev
    The server will start on http://localhost:8080.


### 5. API Documentation
To view the API documentation, visit:

    http://localhost:8080/api-docs
  This Swagger documentation includes details about all the endpoints.

## API Endpoints
- **User Authentication and Management**
     - POST /api/auth/register - Register a new user.
     - POST /api/auth/login - Log in a user and get a token.
     - GET /api/user/profile/
         - Get a user's profile (JWT required).
     - PUT /api/user/profile - Update the authenticated user's profile.
        
      
- Stock Post Management
    - POST /api/posts - Create a new stock post (JWT required).
    - GET /api/posts - Get all stock posts, with optional filters and sorting.
    - GET /api/posts/
      - Get a single post by its ID.
    - DELETE /api/posts/
      - Delete a post (JWT required).
- Comment Management
    - POST /api/posts/:postId/comments
      - Add a comment to a post (JWT required).
    - DELETE /api/posts/:postId/comments/:commentId
      - Delete a comment (JWT required).
- Like System
    - POST /api/posts/:postId/like
      -  Like a post (JWT required).
    - DELETE /api/posts/:postId/like
      - Unlike a post (JWT required).
- Bonus Features (Optional)
  - GET /api/posts?page=1&limit=10 - Retrieve paginated posts.
- Database Schema :-
The MongoDB database is structured to handle the following collections:
   - Users
   - Posts
   - Comments
   - Likes
- Security
  - Password Hashing: User passwords are hashed using bcrypt before being stored.
  - JWT Authentication: Authentication is token-based, and only authenticated users can create posts, comment, and like posts.

