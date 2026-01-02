# 🚀 How to Start SafeSpace AI from VS Code

## Quick Start

### Option 1: Using VS Code Tasks (Recommended)

1. **Open Command Palette**: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Run Task**: Type "Tasks: Run Task"
3. **Select Task**: Choose one of:
   - **"Start Both (Frontend + Backend)"** - Starts both services at once
   - **"Start Backend (FastAPI)"** - Starts only the backend server
   - **"Start Frontend (Next.js)"** - Starts only the frontend server

### Option 2: Using Integrated Terminal

#### Start Backend:
1. Open a new terminal in VS Code (`Terminal` → `New Terminal` or `` Ctrl+` ``)
2. Navigate to Server directory:
   ```bash
   cd Server
   ```
3. Start the backend:
   ```bash
   python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
   ```

#### Start Frontend:
1. Open another terminal (`Terminal` → `New Terminal` or `Ctrl+Shift+` ``)
2. Navigate to Client directory:
   ```bash
   cd Client
   ```
3. Start the frontend:
   ```bash
   pnpm dev
   ```
   OR if you prefer npm:
   ```bash
   npm run dev
   ```

## 📍 URLs

Once started:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend API Docs**: http://localhost:8080/docs

## ⚠️ Prerequisites

### Backend:
- Python 3.9+ installed
- All dependencies installed (`pip install -r Server/requirements.txt`)
- Model files in `Server/models/` directory

### Frontend:
- Node.js installed
- Dependencies installed (`pnpm install` or `npm install` in `Client/` directory)

## 🛠️ Troubleshooting

### Backend won't start:
- Make sure Python 3 is installed: `python3 --version`
- Check if dependencies are installed: `pip list | grep fastapi`
- Verify models directory exists: `ls Server/models/`

### Frontend won't start:
- Make sure Node.js is installed: `node --version`
- Check if dependencies are installed: `ls Client/node_modules`
- Try installing dependencies: `cd Client && pnpm install`

### Port already in use:
- Backend (port 8080): Kill the process using port 8080
  ```bash
  lsof -ti:8080 | xargs kill -9
  ```
- Frontend (port 3000): Kill the process using port 3000
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

## 💡 Pro Tips

1. **Use VS Code Terminal Split**: You can split the terminal to run both commands side by side
2. **Use the Task Runner**: The VS Code tasks will automatically handle running both services
3. **Auto-reload**: Both services have auto-reload enabled, so changes will be reflected automatically


