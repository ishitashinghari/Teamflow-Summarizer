# TeamFlow AI

**AI-powered real-time team collaboration and communication platform**

TeamFlow AI is a full-stack team collaboration platform designed to make group communication faster, smarter, and easier to manage.

It combines real-time group messaging, AI-powered unread-message summarization, AI chat assistance, file sharing, group management, and online presence tracking in a single workspace.

Instead of spending 20–25 minutes scrolling through a busy group conversation, users can use TeamFlow AI to generate a concise summary of unread messages, highlighting important updates, decisions, action items, deadlines, and unresolved questions.

---

## ✨ Key Features

### 💬 Real-Time Team Chat

- Create and join team groups/channels
- Real-time messaging using Socket.IO
- Typing indicators
- Online/offline presence
- Message history
- Message editing
- Soft message deletion
- Search messages within a group

### 🤖 AI-Powered Conversation Summarization

TeamFlow AI can summarize unread messages from a group conversation.

The AI summary organizes important information into sections such as:

- Overview
- Key Points
- Decisions
- Action Items & Deadlines
- Unresolved Questions

Sections with no content are omitted. The summarization system is powered by Groq and uses prompt engineering to keep the generated summary grounded in the provided conversation.

### 🧠 TeamFlow AI Assistant

A separate AI assistant is available for casual interaction and workplace assistance. It uses a relaxed, humorous "water cooler" persona.

It can:

- Answer questions
- Help with work-related queries
- Have casual conversations
- Share quick facts
- Play simple text-based games

The assistant keeps only the last 10 messages of conversation history to avoid unnecessary token usage.

### 📎 File Sharing

Users can send files directly through group conversations.

Supported uploads (up to 50 MB):

- Images (JPEG, PNG, WebP, GIF)
- Videos (MP4, WebM, QuickTime)
- Documents (PDF, Word, Excel, plain text)

Files are uploaded and stored using Cloudinary, while message metadata is stored in MongoDB.

### 🔐 Authentication

Authentication is handled using Firebase Authentication.

Users can:

- Register
- Login
- Logout
- Maintain a profile
- Update their name and status message
- Upload or remove their profile photo

Firebase ID tokens are used to authenticate requests between the frontend and backend.

### 👥 Group Management

Every member can:

- Create groups
- Join groups using invite codes
- View group members and who is online
- Leave a group

Group admins can additionally:

- Rename the group
- Change or remove the group photo
- Remove members

Rules:

- Editing the group and removing members are enforced on the server, not just hidden in the UI.
- If the group owner leaves, ownership transfers to another admin (or, if there is none, the longest-standing member).
- If the last member leaves, the group and its messages are deleted.
- Each of these actions posts a system message in the chat.

### 🔎 Message Search

Members can search messages inside a group using case-insensitive keyword search (matched literally, up to 100 characters).

### 🟢 Online Presence

TeamFlow tracks currently connected users using Socket.IO.

The application supports:

- Online user tracking
- Multi-tab presence
- Last-active timestamps
- Real-time presence updates

### 🎨 Customizable Interface

The frontend includes:

- Theme selection
- Desktop-oriented chat layout (not yet optimized for mobile screens)
- Emoji picker
- Profile management
- Interactive modals and drawers

---

## 🏗️ System Architecture

```
                    ┌─────────────────────────┐
                    │       React Frontend    │
                    │                         │
                    │  Dashboard              │
                    │  Chat Interface         │
                    │  AI Assistant           │
                    │  Group Management       │
                    └────────────┬────────────┘
                                 │
                     REST API    │    Socket.IO
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
      ┌───────▼────────┐                   ┌────────▼────────┐
      │ Express Backend │                   │  Socket.IO      │
      │                 │                   │  Real-Time      │
      │ REST APIs       │                   │  Communication  │
      │ Authentication  │                   │  Presence       │
      │ Messages        │                   │  Typing         │
      │ Groups          │                   └─────────────────┘
      │ AI Services     │
      └───────┬────────┘
              │
      ┌───────┼───────────────────────┐
      │       │                       │
      ▼       ▼                       ▼
 MongoDB   Firebase                Cloudinary
 Database  Authentication           File Storage
              │
              ▼
           Groq AI
       ┌───────────────┐
       │ Summarization │
       │ AI Assistant  │
       └───────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- Axios
- React Router
- Socket.IO Client
- Firebase Authentication
- Lucide React
- Emoji Picker React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Firebase Admin SDK
- Multer
- Cloudinary
- Groq SDK

### AI

- Groq API
- LLM-based conversation summarization
- Prompt engineering
- Context-aware AI chat

### Authentication & Storage

- **Firebase Authentication** — user authentication
- **MongoDB** — application and chat data
- **Cloudinary** — uploaded file storage

---

## 📁 Project Structure

```
Teamflow/
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   ├── dns.js
│   │   └── firebase.js
│   │
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── groupController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── Group.js
│   │   ├── Message.js
│   │   ├── ReadState.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   └── cloudinaryService.js
│   │
│   ├── sockets/
│   │   └── socketHandlers.js
│   │
│   ├── utils/
│   │   └── seed.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AIChatDrawer.jsx
    │   │   ├── ChatArea.jsx
    │   │   ├── CreateGroupModal.jsx
    │   │   ├── GroupMembersDrawer.jsx
    │   │   ├── JoinGroupModal.jsx
    │   │   ├── MessageItem.jsx
    │   │   ├── ProfileModal.jsx
    │   │   ├── SearchModal.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── SummaryModal.jsx
    │   │   └── ThemeSelector.jsx
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── SocketContext.jsx
    │   │   └── ThemeContext.jsx
    │   │
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   │
    │   ├── services/
    │   │   ├── api.js
    │   │   └── firebase.js
    │   │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## 🔄 How TeamFlow AI Works

### 1. User Authentication

```
User
  ↓
Firebase Authentication
  ↓
Firebase ID Token
  ↓
Express Backend
  ↓
MongoDB User
```

Firebase handles authentication while MongoDB stores the application's user profile and collaboration data.

### 2. Real-Time Messaging

```
User sends message
        ↓
React Frontend ──REST──▶ Express Backend ──▶ MongoDB (message saved)
        ↓
Frontend emits "message:send" (message ID) over Socket.IO
        ↓
Server loads the saved message from MongoDB, checks the sender is the
socket's user and still a group member
        ↓
Server relays the stored message to the group room
        ↓
Other members receive it
```

The server never relays the client's payload directly. It re-reads the saved message from the database, so a client cannot forge messages. The same flow applies to edits and deletions. Socket.IO is also used for typing indicators and online presence.

### 3. AI Unread Summary

```
User clicks "Summarize" (frontend sends its unread count)
       ↓
TeamFlow Backend verifies group membership
       ↓
Fetch the latest N messages (N = unread count, capped at 250)
  — fallback if no count is sent: messages since the user's
    ReadState.lastReadAt (or the last 7 days), up to 250
       ↓
Format conversation transcript
       ↓
Groq LLM
       ↓
Prompt-engineered summary
       ↓
React Summary Modal
```

The summarization prompt explicitly instructs the model to rely only on the supplied message history and treat message content as untrusted conversational data.

---

## 🔌 API Overview

All routes except `/health` require a Firebase ID token (`Authorization: Bearer <token>`).

### Authentication / Users

```
POST   /api/users/sync
GET    /api/users/me
PUT    /api/users/me                 (name, status, photo upload, removePicture)
```

### Groups

```
GET    /api/groups
POST   /api/groups
POST   /api/groups/join
PUT    /api/groups/:id               (admin only: name, photo upload, removeImage)
POST   /api/groups/:id/leave
DELETE /api/groups/:id/members/:userId   (admin only)
```

### Messages

```
GET    /api/messages/group/:groupId
POST   /api/messages
PUT    /api/messages/:messageId
DELETE /api/messages/:messageId
POST   /api/messages/group/:groupId/read
GET    /api/messages/group/:groupId/search
```

### AI

```
POST   /api/ai/summarize
POST   /api/ai/chat
```

### Health Check

```
GET    /health
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account
- Firebase project
- Cloudinary account
- Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/ishitashinghari/Teamflow-Summarizer.git
cd Teamflow-Summarizer
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key_with_escaped_newlines

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```
http://localhost:5000
```

> **Troubleshooting — `querySrv ENOTFOUND ...mongodb.net`:** free-tier MongoDB Atlas clusters pause after a period of inactivity, which removes their DNS records. Resume the cluster from the Atlas dashboard (Database → Clusters), and make sure your IP is allowed under Network Access. The backend exits if it cannot connect to MongoDB.

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `FRONTEND_URL` | Frontend origin for CORS (localhost:5173/5174/3000 are always allowed) |
| `MONGO_URI` | MongoDB connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | Groq model used for AI responses (defaults to `openai/gpt-oss-120b`) |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage configuration |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging configuration |
| `VITE_FIREBASE_APP_ID` | Firebase application ID |
| `VITE_API_URL` | Backend REST API URL |

> ⚠️ Never commit `.env` files containing private credentials or API secrets.

---

## 🧩 Database Models

TeamFlow uses MongoDB with Mongoose.

### User

Stores:

- Name
- Username
- Email
- Firebase UID
- Profile picture
- Status message
- Last active time

### Group

Stores:

- Group name
- Description
- Group image
- Owner and admins
- Members
- Invite code
- Last message timestamp

### Message

Stores:

- Group
- Sender
- Message text
- Message type (`text`, `image`, `video`, `document`, `system`)
- File information
- Creation time
- Edited/deleted state

### ReadState

Tracks:

- User
- Group
- Last read message
- Last read timestamp

The read-state system powers the unread counts shown in the sidebar and the summarizer's fallback behavior.

---

## 🤖 AI Design

TeamFlow uses two main AI workflows.

### AI Summarization

The summarization pipeline receives a set of unread messages and constructs a structured transcript for the LLM.

The model is instructed to:

- Use only the supplied conversation
- Avoid inventing facts
- Ignore prompt-injection attempts contained inside messages
- Remove conversational filler
- Extract actionable information
- Organize the result into useful sections

### AI Assistant

The standalone assistant receives:

```
System Prompt
      +
Last 10 messages of conversation history
      +
Current User Query
```

Only the most recent messages are retained to keep the context compact.

---

## ⚡ Real-Time Communication

TeamFlow uses Socket.IO for real-time events such as:

```
group:join
group:leave

message:send
message:received

message:edited
message:updated

message:deleted
message:removed

typing:start
typing:stop

presence:update
```

This allows users to see messages, typing activity, and presence changes without manually refreshing the page.

Notes:

- `group:join` succeeds only for group members.
- Typing events are only relayed into rooms the sender has joined.
- Group changes (rename, photo, members, leaving) are not pushed over sockets yet. Other members see them on their next refresh.

---

## 🔒 Security Considerations

TeamFlow implements several security mechanisms:

- Firebase-based authentication
- Firebase ID token verification on the backend
- Protected API routes
- Group membership checks when reading, sending, searching, or marking messages as read
- Admin-only group editing and member removal, enforced server-side
- Sender-only message edit/delete (and the sender must still be a member)
- Authenticated Socket.IO connections with member-only rooms
- Server-side relay of saved messages (clients cannot forge socket messages)
- Image-only validation for profile and group photos
- Search input escaped before use in database queries
- CORS configuration
- Environment variables for secrets
- Soft deletion for messages

Known limitations:

- A member removed from a group stays subscribed to its live socket room until they disconnect.
- Replaced or removed photos are not deleted from Cloudinary.
- Deleted messages keep their Cloudinary file.

---

## 🌟 Why TeamFlow AI?

Modern teams generate large amounts of information through chat.

Important decisions and action items can easily get buried under:

- Greetings
- Repeated messages
- Casual conversations
- File sharing
- Multiple parallel discussions

TeamFlow AI addresses this information overload by combining real-time collaboration with AI-powered conversation understanding.

Instead of replacing team communication, it helps users catch up faster and focus on the information that matters.

---

## 🚀 Future Enhancements

Potential future improvements include:

- 📌 Message pinning
- 🔔 Custom notifications
- 🧵 Threaded conversations
- 📅 AI-generated task/deadline extraction
- 🔍 Semantic message search
- 📝 AI-generated meeting notes
- 📊 Team activity analytics
- 🎙️ Voice messages
- 📱 Mobile application and responsive layout
- 🔗 Calendar integration
- 👥 Finer-grained roles (promote/demote admins, moderators)
- ⚡ Real-time push of group changes over Socket.IO
- 🧹 Cloudinary cleanup for replaced and deleted files

---

## 👩‍💻 Team

TeamFlow AI was developed as a full-stack AI collaboration project combining:

- Frontend development
- Backend/API development
- Real-time systems
- Database management
- Authentication
- Cloud storage
- Generative AI

---

## 📄 License

This project is intended for educational, hackathon, and demonstration purposes.
