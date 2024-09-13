const express = require("express")
const cors = require("cors");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { connection } = require("./config/db");
const { authRouter } = require("./routes/auth");
const { userRouter } = require("./routes/users");
const { Post_Router } = require("./routes/posts");
const { Comment_Router } = require("./routes/comments");
require("dotenv").config();

const app = express();

app.use(express.json())
app.use(cors());


// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Stock Discussion Platform Backend',
        version: '1.0.0',
        description: 'API documentation for the Stock Social Platform',
      },
      servers: [
          {
              url: 'https://alpha-tribe-stock-platform.onrender.com',
              description: 'Production Server (Render)'
            },
            {
              url: 'http://localhost:8080',
              description: 'Local Development Server'
            },
      ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Specify the format as JWT
        },
      },
    },
    security: [
      {
        BearerAuth: [], // Apply BearerAuth globally to all endpoints
      },
    ],
  },
    apis: ['./routes/*.js'], // Path to the API routes
  };


// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Use Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Routes
app.use("/api/auth",authRouter)
app.use("/api/user", userRouter)
app.use("/api/posts", Post_Router)
app.use("/api/posts", Comment_Router)

app.get("/",(req, res)=>{
    res.send("Welcome to Alpha-Trive: Stock Platform")
})


app.listen(process.env.PORT, async()=>{
    try {
        await connection
        console.log(`Server is Running on PORT ${process.env.PORT}`)
        console.log("DB connected")
    } catch (error) {
        console.log(error.message)
    }
})