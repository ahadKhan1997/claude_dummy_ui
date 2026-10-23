# Claude Gemma Local AI - React Frontend

A production-ready, Claude-style personal AI web interface built with **React 18**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**. It connects to a local FastAPI backend running an Ollama Gemma 4 model with real-time SSE token streaming, thread history persistence, and ephemeral in-memory attachments.

---

## 🌟 Feature Highlights

- **Claude-Inspired UI**: Sleek dark mode theme styled with Tailwind CSS, custom scrollbars, and fluid layout panels.
- **Real-Time Token Streaming**: Consumes Server-Sent Events (SSE) from FastAPI to render model outputs chunk-by-chunk with a pulsing cursor indicator.
- **Ephemeral File & Image Attachments**: Attach images or code/text files via in-memory Base64 conversion without clogging or cluttering disk storage.
- **Thread Management**: Create new chats, switch between historical threads, and delete sessions with real-time sidebar state updates.
- **Smart Auto-Scroll**: Smooth automatic scrolling anchor that tracks incoming response streams and session switches.
- **Robust Error Recovery**: Automatically unfreezes input controls and renders inline error badges if an SSE stream or backend connection drops.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (Slices, Async Thunks)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Architecture

```text
frontend/
├── src/
│   ├── api/
│   │   └── chatApi.ts           # REST and SSE API client integrations
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx # Main chat view, messages list, & auto-scroll anchor
│   │   │   └── ChatInput.tsx     # Textarea, file picker, & in-memory attachment preview
│   │   ├── layout/
│   │   │   └── Sidebar.tsx       # Session list navigation & model status badge
│   │   └── sidebar/
│   │       └── SessionItem.tsx   # Individual session item with delete actions
│   ├── store/
│   │   ├── hooks.ts              # Typed Redux hooks (useAppDispatch, useAppSelector)
│   │   ├── store.ts              # Redux store configuration
│   │   └── slices/
│   │       └── chatSlice.ts      # State management for sessions, streaming, & history
│   ├── types/
│   │   └── chat.ts               # Core TypeScript interfaces (Message, ChatSession)
│   ├── utils/
│   │   └── stream.ts             # SSE stream reader utility
│   ├── App.tsx                   # Main layout container
│   └── main.tsx                  # Application entry point
├── .env                          # Environment variables configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### 2. Installation

Navigate to the frontend directory and install the dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create or update the `.env` file in the root of the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the FastAPI backend service | `http://localhost:8000/api` |

### 4. Running the Development Server

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The app will be accessible at `http://localhost:5173`.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server |
| `npm run build` | Compiles TypeScript and builds production assets into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint checks across source code |

---

## 📑 Core Component Flow

1. **`ChatInput.tsx`**: Reads selected files via `FileReader.readAsDataURL()` for images or `readAsText()` for documents. Generates ephemeral in-memory previews and emits `AttachmentData`.
2. **`chatSlice.ts`**: Dispatches `sendMessageStream`, appending an optimistic user message and a empty assistant placeholder message to Redux state.
3. **`chatApi.ts` & `stream.ts`**: Dispatches a `POST` request to `/api/chat/stream` and processes streaming UTF-8 bytes using standard `ReadableStreamDefaultReader`.
4. **`ChatContainer.tsx`**: Automatically scrolls down using `messagesEndRef.current.scrollIntoView()` whenever new chunks append to the active thread state.