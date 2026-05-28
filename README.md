# 🚀 Collaborative Editor - Backend

A robust Node.js Express server with **MongoDB**, **Socket.io**, **JWT Authentication**, and **Real-time Collaboration**. Handles user authentication, document management, live document synchronization, and version history.

## 🎯 Features

- 🔐 **JWT Authentication** - Access tokens with automatic refresh token rotation
- 👥 **Role-based Access Control** - Editor and Viewer roles for document collaborators
- 📝 **Document Management** - CRUD operations with ownership and collaboration support
- 🔄 **Real-time Synchronization** - WebSocket-based live document updates via Socket.io
- 📜 **Version History** - Track and restore document versions
- 👤 **Active User Tracking** - Monitor connected users and cursor positions in real-time
- 🔒 **Security** - Helmet.js headers, CORS configuration, password hashing with bcryptjs
- ✅ **Input Validation** - Zod schema validation for all requests
- 🌐 **Token Blacklist** - Support for logout and token invalidation
- 📦 **MongoDB Integration** - Mongoose ODM with comprehensive data models

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x
- **MongoDB** >= 4.4 (local or MongoDB Atlas)
- **Environment Variables** - See configuration section

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/collaborative-editor.git
   cd collaborative-editor/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see below)

## ⚙️ Configuration

Create a `.env` file in the backend root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/collab-editor
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collab-editor

# JWT Secrets (generate strong random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_key_change_me_in_production
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_change_me_in_production
ACCESS_TOKEN_EXPIRE=1h
REFRESH_TOKEN_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
# Production:
# FRONTEND_URL=https://your-frontend-domain.com
```

## 🎯 Getting Started

### Development Server
```bash
npm run dev
```
Server runs at `http://localhost:3000`

### Production Server
```bash
npm start
```

### Testing
```bash
npm test
```

## 📁 Project Structure

```
backend/
├── server.js                    # HTTP & Socket.io server entry
├── package.json                 # Dependencies
├── render.yaml                  # Render.com deployment config
├── .env                         # Environment variables
└── src/
    ├── app.js                   # Express app setup with middleware
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── env.js              # Environment variable loader
    ├── models/
    │   ├── user.model.js       # User schema (name, email, password, tokens)
    │   ├── document.model.js   # Document schema (title, content, collaborators)
    │   ├── version.model.js    # Version history schema
    │   └── blacklist.model.js  # Token blacklist for logout
    ├── controllers/
    │   ├── authController.js   # Register, login, logout, refresh, get user
    │   └── documentController.js # Document CRUD, collaborators, versions
    ├── routes/
    │   ├── authRoutes.js       # Auth endpoints
    │   └── documentRoutes.js   # Document endpoints
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification & user extraction
    │   └── validateMiddleware.js # Zod schema validation
    ├── validators/
    │   ├── authValidator.js    # Register & login validation schemas
    │   └── documentValidator.js # Document & collaborator schemas
    └── socket/
        └── socketHandler.js    # Socket.io event handlers
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Documents
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/documents` | Get all user's documents | ✅ |
| POST | `/api/documents` | Create new document | ✅ |
| GET | `/api/documents/:id` | Get document by ID | ✅ |
| PUT | `/api/documents/:id` | Update document | ✅ |
| DELETE | `/api/documents/:id` | Delete document | ✅ |

### Collaborators
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/documents/:id/collaborators` | Get collaborators | ✅ |
| POST | `/api/documents/:id/collaborators` | Add collaborator | ✅ |
| DELETE | `/api/documents/:id/collaborators/:userId` | Remove collaborator | ✅ |

### Versions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/documents/:id/versions` | Get version history | ✅ |
| POST | `/api/documents/:id/versions/restore` | Restore version | ✅ |

## 🔌 Socket.io Events

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `document-loaded` | `{ document, activeUsers }` | Sends document content when user joins |
| `content-update` | `{ userId, delta }` | Broadcasts content changes |
| `active-users` | `{ users: [...] }` | List of connected users |
| `user-joined` | `{ userId, name, color }` | New user joined room |
| `user-left` | `{ userId }` | User disconnected |
| `error` | `{ message }` | Error message |
| `cursor-position` | `{ userId, position, color }` | User cursor movement |

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-document` | `documentId` | User joins document room |
| `content-changed` | `{ delta, version }` | Send content update |
| `save-document` | `{ content, title }` | Save document |
| `cursor-move` | `{ position, line, column }` | Send cursor position |
| `disconnect` | - | User leaves |

## 🔐 Authentication Flow

1. **Register**: User provides name, email, password
   - Password hashed with bcryptjs (10 salt rounds)
   - User created in MongoDB
   - Return user info (without password)

2. **Login**: User provides email, password
   - Password verified with bcrypt
   - Generate `accessToken` (1 hour expiry)
   - Generate `refreshToken` (7 days expiry)
   - Store refreshToken in database
   - Return both tokens to client

3. **Protected Routes**: All document endpoints require valid JWT
   - Extract token from `Authorization: Bearer <token>`
   - Verify token with ACCESS_TOKEN_SECRET
   - Attach user info to request

4. **Token Refresh**: When accessToken expires
   - Client sends `refreshToken` to `/auth/refresh`
   - Server generates new `accessToken`
   - Return new token to client

5. **Logout**: User logs out
   - Add refreshToken to blacklist
   - Client clears localStorage
   - Any further requests with old token fail

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | Web framework |
| `socket.io` | ^4.8.3 | Real-time WebSocket |
| `mongoose` | ^9.6.2 | MongoDB ODM |
| `jsonwebtoken` | ^9.0.3 | JWT authentication |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `zod` | ^4.4.3 | Schema validation |
| `cors` | ^2.8.6 | CORS middleware |
| `helmet` | ^8.1.0 | Security headers |
| `cookie-parser` | ^1.4.7 | Cookie parsing |
| `dotenv` | ^17.4.2 | Environment variables |

## 🚀 Deployment

### Deploy to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables in Render dashboard
5. Deploy

**Render.yaml** is configured for automatic deployments.

### Deploy to Other Platforms (Heroku, Railway, etc.)
1. Set environment variables
2. Run build command: `npm install`
3. Run start command: `npm start`

## 🔐 Security Considerations

✅ **Implemented:**
- Helmet.js for security headers
- CORS configured for specific origins
- Password hashing with bcryptjs
- JWT token-based authentication
- Input validation with Zod
- Socket.io authentication middleware
- Token blacklist for logout

⚠️ **Recommended Improvements:**
- Add rate limiting on auth routes
- Implement HTTPS in production
- Add request timeout configuration
- Add structured logging (Winston, Pino)
- Add input sanitization for XSS prevention
- Enable MongoDB connection pooling
- Add request size limits

## 📝 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  refreshTokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model
```javascript
{
  _id: ObjectId,
  title: String,
  content: String (HTML),
  owner: ObjectId (User),
  collaborators: [
    {
      user: ObjectId (User),
      role: 'editor' | 'viewer'
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Version Model
```javascript
{
  _id: ObjectId,
  documentId: ObjectId,
  content: String,
  title: String,
  snapshot: Object,
  createdAt: Date,
  createdBy: ObjectId (User)
}
```

### Blacklist Model
```javascript
{
  _id: ObjectId,
  token: String (unique),
  createdAt: Date,
  expiresAt: Date (auto-delete via TTL index)
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MONGODB_URI not found` | Create `.env` file with proper MongoDB connection string |
| `Access token secret missing` | Set `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` in `.env` |
| `CORS errors in browser` | Check `FRONTEND_URL` in `.env` matches frontend origin |
| `Socket.io connection fails` | Ensure HTTP server is listening and CORS is enabled |
| `Token always expires` | Check system time is synchronized, adjust `ACCESS_TOKEN_EXPIRE` |
| `401 Unauthorized on protected routes` | Verify JWT token is being sent in `Authorization` header |

## 📊 Performance Tips

1. **Database Indexing** - Add indexes on frequently queried fields:
   ```javascript
   // In models:
   email: { type: String, index: true }
   documentId: { type: String, index: true }
   ```

2. **Connection Pooling** - Mongoose handles this automatically

3. **Pagination** - Add to document list endpoints for large datasets

4. **Caching** - Consider Redis for frequently accessed documents

5. **Load Balancing** - Use reverse proxy (Nginx) in production

## 🧪 Testing Endpoints

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the [troubleshooting guide](#troubleshooting)
- Review the [frontend README](../frontend/README.md)
- Open an issue on GitHub

---

**Built with ❤️ for Real-time Collaboration**
