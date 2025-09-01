# Windows Explorer Web Application

A modern web-based file explorer application that mimics the Windows Explorer interface with a two-panel layout. Built as a monorepo with Elysia/Bun backend and Vue 3 frontend.

## Features

- **Two-Panel Layout**: Left panel shows the complete folder structure, right panel displays direct subfolders
- **Hierarchical Navigation**: Support for unlimited folder levels and subfolders
- **Modern UI**: Clean, responsive design with Windows Explorer-like styling
- **Real-time Updates**: Dynamic folder creation and deletion with immediate UI updates
- **Database Persistence**: SQLite database for storing folder structure
- **RESTful API**: Clean API endpoints for all folder operations
- **TypeScript**: Full type safety across the entire stack

## Architecture

This project follows a monorepo structure with separate backend and frontend applications:

### Backend (Elysia + Bun + TypeScript)
- **Framework**: Elysia.js for fast, type-safe API development
- **Runtime**: Bun for high-performance JavaScript runtime
- **Database**: SQLite with automatic schema initialization
- **Architecture**: Repository pattern with service layer
- **Port**: 3001

### Frontend (Vue 3 + TypeScript)
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite for fast development and building
- **Styling**: Scoped CSS with Windows Explorer-like design
- **HTTP Client**: Axios for API communication
- **Port**: 3000 (with proxy to backend)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Node.js (v18 or higher)

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development servers**:
   ```bash
   # Start both backend and frontend
   bun run dev
   
   # Or start them individually:
   bun run dev --filter=@explorer-app/backend
   bun run dev --filter=@explorer-app/frontend
   ```

4. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## Project Structure

```
explorer-app/
├── apps/
│   ├── backend/                 # API (Elysia/Bun + TS)
│   │   ├── src/
│   │   │   ├── index.ts         # Main server entry point
│   │   │   ├── routes/
│   │   │   │   └── folders.ts   # Folder API routes
│   │   │   ├── services/
│   │   │   │   └── folderService.ts # Business logic
│   │   │   └── repositories/
│   │   │       └── folderRepository.ts # Database operations
│   │   ├── db/
│   │   │   └── schema.sql       # Database schema
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── frontend/                # Vue 3 Composition API
│       ├── src/
│       │   ├── main.ts          # Vue app entry point
│       │   ├── App.vue          # Main app component
│       │   ├── components/
│       │   │   ├── FolderTree.vue    # Left panel component
│       │   │   └── SubFolderList.vue # Right panel component
│       │   └── services/
│       │       └── api.ts       # API client
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── package.json                 # Root config (workspace/monorepo)
├── turbo.json                   # Build system configuration
└── README.md
```

## API Endpoints

### GET `/api/folders`
Returns all folders for the left panel tree view.

### GET `/api/folders/:id/subfolders`
Returns direct subfolders of a specific folder for the right panel.

### GET `/api/folders/:id`
Returns a specific folder by ID.

### POST `/api/folders`
Creates a new folder.
- Body: `{ "name": "Folder Name", "parent_id": 123 }`

### DELETE `/api/folders/:id`
Deletes a folder and all its subfolders.

## Development

### Backend Development
```bash
cd apps/backend
bun run dev
```

### Frontend Development
```bash
cd apps/frontend
bun run dev
```

### Building for Production
```bash
# Build all applications
bun run build

# Build individual applications
bun run build --filter=@explorer-app/backend
bun run build --filter=@explorer-app/frontend
```

## Usage

1. **Viewing Folders**: The left panel displays the complete folder hierarchy. Click on any folder to view its direct subfolders in the right panel.

2. **Creating Folders**: Click the "New Folder" button in the header to open the creation modal. Enter a folder name and optionally select a parent folder.

3. **Deleting Folders**: Hover over any subfolder in the right panel and click the trash icon to delete it. This will also delete all subfolders within it.

4. **Navigation**: The folder tree supports unlimited nesting levels. Each folder can have unlimited subfolders.

## Sample Data

The application comes with sample folder data including:
- Documents (with Work and Personal subfolders)
- Pictures (with Photos and Screenshots subfolders)
- Music (with Rock and Jazz subfolders)
- Videos (with Movies and TV Shows subfolders)

And various nested subfolders to demonstrate the hierarchical structure.

## Database Schema

The folder structure is stored in a simple `folders` table:
```sql
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER NULL,
  path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);
```

## Technology Stack

### Backend
- **Elysia.js**: Fast, type-safe web framework
- **Bun**: High-performance JavaScript runtime
- **SQLite**: Lightweight database
- **TypeScript**: Type safety

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **Composition API**: Modern Vue 3 API
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Axios**: HTTP client

### Build System
- **Turbo**: Monorepo build system
- **Bun**: Package manager and runtime

## Troubleshooting

### Port Conflicts
If ports are in use, you can change them:
- Backend: Set `PORT` environment variable
- Frontend: Modify `vite.config.ts`

### Database Issues
The SQLite database is created automatically. If you encounter issues:
- Delete `folder_explorer.db` file
- Restart the backend server

### CORS Issues
The frontend is configured to proxy API requests to the backend. If you encounter CORS issues, ensure the proxy configuration in `vite.config.ts` is correct.

## Browser Support

The application works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Fetch API

## License

This project is open source and available under the MIT License.
