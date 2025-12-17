# File Uploader — Cloud Storage Platform

An elegant cloud storage platform built with Express, EJS, Prisma, and PostgreSQL. Features a cozy minimalistic design with folder organization, file uploads, secure sharing with expiration links, and session-based authentication for personal file management.

## 🌐 Live Demo

**[https://file-uploader-rtao.onrender.com/](https://file-uploader-rtao.onrender.com/)**

## Tech Stack

- **Backend**: Node.js + Express
- **Authentication**: Passport.js (Local Strategy) + bcryptjs
- **Database**: PostgreSQL + Prisma ORM
- **Session Store**: connect-pg-simple (PostgreSQL-backed sessions)
- **Templating**: EJS (Server-side rendering)
- **File Upload**: Multer (multipart/form-data processing)
- **Validation**: express-validator
- **Environment**: dotenv

## Features

### File Management System

- **Folder Organization**: Create nested folder structures with parent-child relationships
- **File Uploads**: Upload files up to 10MB with type validation
- **File Storage**: Local filesystem storage with unique filenames
- **File Downloads**: Secure file retrieval with original filenames
- **CRUD Operations**: Full create, read, update, and delete capabilities

### Sharing & Collaboration

- **Share Links**: Generate time-limited shareable links for folders
- **Expiration Control**: Set custom expiration times (1-30 days)
- **Public Access**: Share files without requiring recipient authentication
- **UUID Tokens**: Cryptographically secure share link generation
- **Automatic Expiration**: Links automatically become invalid after expiration

### Security & Validation

- **User Authentication**: Secure signup and login with session management
- **Password Hashing**: bcryptjs with 10 salt rounds
- **File Type Validation**: Whitelist of allowed MIME types
- **File Size Limits**: 10MB maximum upload size
- **Folder Ownership**: Users can only access their own folders
- **Session Security**: PostgreSQL-backed sessions with signed cookies

### Modern UI/UX

- Warm, cozy color palette with beige and brown tones
- Minimalistic design with soft shadows and blur effects
- Responsive grid layouts for folders and files
- Modal dialogs for user actions
- Emoji-based file type icons
- Smooth hover transitions and animations

## Project Structure

```
app.js                    # Main application entry point
package.json              # Dependencies and scripts
prisma.config.js          # Prisma configuration
controllers/
  controller.js           # Business logic for all routes
lib/
  prisma.js               # Prisma client instance
  script.js               # Database seeding script
routes/
  auth.js                 # Authentication routes (signup, login, logout)
  index.js                # Main routes (folders, files, shares, dashboard)
middleware/
  validation.js           # Form validation rules and authentication guards
prisma/
  schema.prisma           # Database schema and models
  migrations/             # Database migration history
generated/
  prisma/                 # Auto-generated Prisma Client
uploads/                  # Local file storage directory
views/
  index.ejs               # Landing page with features showcase
  error.ejs               # Error page with friendly messages
  dashboard.ejs           # Main file management interface
  shared.ejs              # Public shared folder view
  auth/                   # Authentication views (signup, login)
```

## Getting Started

### Prerequisites

- Node.js 18+ (or later)
- PostgreSQL database (local or cloud service like Neon)

### Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration (Neon, Railway, Supabase, etc.)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Session Secret (change in production!)
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Environment
NODE_ENV="development"
PORT=3000
```

### Install Dependencies

```bash
npm install
```

### Database Setup

**Generate Prisma Client**:

```bash
npx prisma generate
```

**Run Migrations**:

```bash
npx prisma migrate dev --name init
```

**Seed Database (Optional)**:

```bash
node lib/script.js
```

This creates a test user and sample data.

### Run the App

```bash
npm run dev
```

Then open http://localhost:3000

For production:

```bash
npm start
```

## Key Routes

### Public Routes

- **Home**: `/` — Landing page with features showcase
- **Sign Up**: `/auth/signup` — Create a new account
- **Log In**: `/auth/login` — Authenticate existing users
- **Shared Folder**: `/share/:token` — View publicly shared folders

### Authenticated Routes

- **Dashboard**: `/dashboard` — Main file management interface
- **View Folder**: `/folder/:id` — Browse folder contents
- **Create Folder**: `POST /folder/create` — Create new folder
- **Delete Folder**: `POST /folder/:id/delete` — Remove folder and contents
- **Upload File**: `POST /file/upload` — Upload file to folder
- **Download File**: `/file/:id/download` — Download your file
- **Delete File**: `POST /file/:id/delete` — Remove file
- **Share Folder**: `/folder/:id/share?days=7` — Generate share link
- **Logout**: `/auth/logout` — End session

### Public Share Routes

- **View Share**: `/share/:token` — Access shared folder (public)
- **Download Shared File**: `/share/:token/download/:fileId` — Download from share

## Database Schema

### User Model

- **Authentication**: email, username, hashed password
- **Relationships**: One-to-many with folders and files
- **Timestamps**: createdAt, updatedAt

### Folder Model

- **Organization**: name, parent-child hierarchy
- **Ownership**: userId foreign key with cascade delete
- **Relationships**: One-to-many with files and subfolders
- **Timestamps**: createdAt, updatedAt

### File Model

- **Metadata**: name, originalName, size, mimeType
- **Storage**: url path to filesystem location
- **Relationships**: Belongs to user and folder
- **Timestamps**: createdAt, updatedAt

### Session Model

- **Storage**: sid (session ID), sess (session data)
- **Expiration**: expire timestamp for automatic cleanup

### Share Model

- **Security**: UUID token for unique share links
- **Expiration**: expiresAt timestamp for automatic invalidation
- **Relationships**: Belongs to folder
- **Timestamps**: createdAt

## File Upload Details

### Multer Configuration

- **Storage**: Disk storage in `uploads/` directory
- **Filename Strategy**: `{timestamp}-{random}-{originalname}`
- **Processing**: Handles `multipart/form-data` encoding

### Allowed File Types

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Text
- Videos: MP4, MPEG

### Validation Rules

- Maximum file size: 10MB
- Required folder selection
- File type whitelist enforcement

## Styling & Design

- **Color Palette**:
  - Background: Warm Beige (#f5f1e8, #e8dfd0)
  - Cards: White with transparency (rgba(255, 255, 255, 0.8))
  - Text: Soft Brown (#6b5b4a, #8b7355)
  - Accents: Medium Brown (#8b7355)
- **Glassmorphism**: Cards use backdrop-filter blur with transparency
- **Cozy Effects**: Soft shadows, rounded corners, warm tones
- **Responsive**: Mobile-first grid layouts with Tailwind-inspired utilities
- **Animations**: Smooth transitions on hover and focus states

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- Signed session cookies with SESSION_SECRET
- SQL injection prevention with Prisma parameterized queries
- XSS protection with express-validator sanitization
- File type and size validation
- Folder ownership verification for all operations
- UUID-based share tokens (impossible to guess)
- Automatic share link expiration
- Secure file paths (unique filenames prevent overwriting)

## Deployment

This app is deployment-ready for cloud platforms:

- **Render/Railway/Heroku**: Add PostgreSQL addon and set DATABASE_URL
- **Vercel**: Use with Vercel Postgres or external database
- **Neon**: Cloud PostgreSQL with built-in connection pooling

The app automatically:

- Creates the `uploads/` directory if it doesn't exist
- Handles SSL connections for production databases
- Uses Prisma migrations for schema management

## Scripts

```json
{
  "start": "node app.js",
  "dev": "node --watch app.js"
}
```

- `npm start` — Start the server (production mode)
- `npm run dev` — Start with watch mode for development
- `npx prisma studio` — Open Prisma Studio (visual database editor)
- `npx prisma migrate dev` — Create and apply new migration
- `node lib/script.js` — Seed database with test data

## Development Notes

### Authentication Flow

1. User registers → Password hashed → Stored in database via Prisma
2. User logs in → Passport authenticates → Session created
3. Session stored in PostgreSQL → User stays logged in
4. Logout → Session destroyed

### File Upload Flow

1. User selects file → Form submits with `multipart/form-data`
2. Multer middleware processes upload → Saves to `uploads/`
3. Validation checks file size and type
4. Controller saves metadata to database via Prisma
5. File accessible via download route with ownership verification

### Share Link Flow

1. User clicks share → JavaScript prompts for expiration days
2. Controller calculates expiration date (current date + days)
3. Prisma creates Share record → Auto-generates UUID token
4. Share URL returned: `https://yourapp.com/share/{uuid}`
5. Public access allowed if link not expired
6. Automatic expiration check on every access

### Folder Hierarchy

- Folders can have parent folders (nested structure)
- Root folders have `parentId: null`
- Cascade delete ensures subfolder and file cleanup
- Breadcrumb navigation shows folder path

## Future Enhancements

- Cloud storage integration (Cloudinary/Supabase)
- File preview for images and PDFs
- Drag-and-drop file uploads
- Bulk file operations
- Search functionality
- File versioning
- Folder and file renaming
- Move files between folders
- Storage quota per user
- Activity logs and analytics

## License

ISC

## Author

Built as part of The Odin Project curriculum — a comprehensive web development learning path.
