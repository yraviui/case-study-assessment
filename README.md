Claims Management Backend

A RESTful backend API for managing claims, including user authentication, claim creation, updates, assignment, deletion, and associated document retrieval.

Built using Node.js, Express.js, MongoDB, and Mongoose.

🚀 Features
User authentication and authorization using JWT.
User registration and login.
Access token refresh.
Secure logout.
Retrieve authenticated user details.
Create, view, update, and delete claims.
Assign claims.
Retrieve documents associated with claims.
Password hashing using bcrypt.
Request validation using Zod.
Security middleware using Helmet.
Rate limiting to protect API endpoints.
CORS configuration.
HTTP request logging using Morgan.
🛠️ Tech Stack
Technology	Purpose
Node.js	JavaScript runtime
Express.js 5	Backend framework
MongoDB	Database
Mongoose	MongoDB object modeling
JWT	Authentication
bcryptjs	Password hashing
Zod	Request validation
Helmet	HTTP security headers
CORS	Cross-origin resource sharing
Cookie Parser	Cookie handling
Express Rate Limit	API rate limiting
Morgan	HTTP request logging
dotenv	Environment configuration
Nodemon	Development server
📁 Project Structure
text
claims-management-be/
│
├── src/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── utils/
│
├── .env
├── .gitignore
├── package.json
└── README.md


Note: Update the folder structure above if your actual project structure differs.

⚙️ Installation & Setup
1. Clone the repository
bash
git clone <repository-url>

2. Navigate to the project directory
bash
cd claims-management-be

3. Install dependencies
bash
npm install

4. Configure environment variables

Create a .env file in the root directory.

env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/claims-management

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:3000


Adjust the environment variable names and values according to your actual application configuration.

5. Start the development server
bash
npm run dev

6. Start the production server
bash
npm start


The API will be available at:

text
http://localhost:5000

📡 API Documentation
Base URL
text
http://localhost:5000/api

1. Authentication APIs
Method	Endpoint	Description
GET	/api/auth/register	User registration
POST	/api/auth/login	User login
POST	/api/auth/refresh	Refresh access token
POST	/api/auth/logout	User logout
POST	/api/auth/me	Get authenticated user details
2. Claims APIs
Method	Endpoint	Description
GET	/api/claims	List all claims
GET	/api/claimsmy-assigned
GET	/api/claims/:id	Get claim details
POST	/api/claims	Create a new claim
PATCH	/api/claims/:id	Update an existing claim
DELETE	/api/claims/:id	Delete a claim
PATCH	/api/claims/:id/assign	Assign a claim
GET	/api/claims/:id/documents	List associated documents
🔐 Authentication

The application uses JSON Web Tokens (JWT) for authentication.

Authentication-related functionality includes:

User registration.
User login.
Access token generation.
Refresh token handling.
User logout.
Authenticated user information.

Protected endpoints require valid authentication credentials.

Depending on the implementation, tokens may be transmitted through HTTP-only cookies or the Authorization header.

Example Authorization header:

http
Authorization: Bearer <access_token>

📋 Available NPM Scripts
Command	Description
npm install	Install project dependencies
npm run dev	Start development server with Nodemon
npm start	Start production server
npm test	Run tests (not configured yet)
🛡️ Security

The application uses the following security-related packages:

bcryptjs: Secure password hashing.
jsonwebtoken: Token-based authentication.
helmet: Secure HTTP headers.
express-rate-limit: Request rate limiting.
cors: Cross-origin request handling.
zod: Input validation.
🌍 Environment Variables
Variable	Description
PORT	Server port
NODE_ENV	Application environment
MONGODB_URI	MongoDB connection string
JWT_SECRET	JWT access token secret
JWT_REFRESH_SECRET	JWT refresh token secret
CLIENT_URL	Frontend application URL
🧪 Testing

Automated tests are not configured yet.

The APIs can be tested using:

Postman
Thunder Client
cURL
📦 Dependencies
Production Dependencies
text
bcryptjs
cookie-parser
cors
dotenv
express
express-rate-limit
helmet
jsonwebtoken
mongoose
morgan
zod

Development Dependencies
text
nodemon

📄 License

This project is licensed under the ISC License.

Claims Management Backend API

Built with Node.js, Express.js, and MongoDB.