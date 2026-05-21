# Client — AI-Powered Interview Platform

React 19 single-page application built with Vite. Handles authentication, session management, AI-generated interview Q&A, and concept explanations powered by Google Gemini.

## Tech Stack

| Concern | Library / Version |
|---|---|
| Framework | React 19.1, Vite 7 |
| Language | JavaScript (ES2022+) |
| Styling | Tailwind CSS 4, Framer Motion 12 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios 1.11 |
| Markdown Rendering | react-markdown, react-syntax-highlighter |
| Notifications | react-hot-toast |
| Date Formatting | Moment.js |

## Project Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx              # Public homepage with auth modal
│   │   ├── Auth/
│   │   │   ├── Login.jsx                # Login form
│   │   │   └── Signup.jsx               # Signup form + avatar upload
│   │   ├── Home/
│   │   │   ├── Dashboard.jsx            # User's session list
│   │   │   └── CreateSessionForm.jsx    # New session form (role, exp, topics)
│   │   └── InterviewPrep/
│   │       ├── InterviewPrep.jsx        # Question list for a session
│   │       └── components/
│   │           ├── AIResponsePreview.jsx  # Renders Gemini explanation
│   │           └── RoleInfoHeader.jsx     # Session metadata header
│   │
│   ├── components/
│   │   ├── Cards/
│   │   │   ├── QuestionCard.jsx         # Expandable Q&A + pin/note/learn
│   │   │   ├── ProfileInfoCard.jsx      # User info in nav
│   │   │   └── SummaryCard.jsx          # Session card on dashboard
│   │   ├── Inputs/
│   │   │   ├── Input.jsx                # Styled text input
│   │   │   └── ProfilePhotoSelector.jsx # Image picker with preview
│   │   ├── Loader/
│   │   │   ├── SkeletonLoader.jsx       # Question placeholder
│   │   │   └── SpinnerLoader.jsx        # Generic spinner
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx      # Sidebar + main area wrapper
│   │   │   └── Navbar.jsx               # Top navigation bar
│   │   ├── Modal.jsx                    # Generic modal
│   │   ├── Drawer.jsx                   # Slide-in panel (notes/explanations)
│   │   └── DeleteAlertContent.jsx       # Confirm-delete dialog
│   │
│   ├── context/
│   │   └── userContext.jsx              # Global auth state
│   │
│   ├── utils/
│   │   ├── axiosInstance.js             # Configured Axios + JWT interceptors
│   │   ├── apiPaths.js                  # Centralized API endpoint constants
│   │   ├── helper.js                    # Utility functions
│   │   ├── uploadImage.js               # Profile image upload helper
│   │   └── data.js                      # Static data (role options, etc.)
│   │
│   ├── App.jsx                          # Route definitions
│   └── main.jsx                         # Entry point
│
├── public/
├── Dockerfile
├── vite.config.js
└── package.json
```

## Routing

| Path | Component | Auth Required |
|---|---|---|
| `/` | `LandingPage` | No |
| `/dashboard` | `Dashboard` | Yes — redirects to `/` if no user |
| `/interview-prep/:sessionId` | `InterviewPrep` | Yes — redirects to `/` if no user |

## Global State — UserContext

`UserContext` wraps the entire application and exposes three values:

```js
{
  user: null | { _id, name, email, profileImageUrl },
  loading: boolean,
  updateUser(userData): void,  // saves user + JWT to localStorage
  clearUser(): void            // logout — wipes localStorage
}
```

On mount, if a JWT token exists in `localStorage`, the context calls `GET /api/auth/profile` to rehydrate the user object without requiring a new login.

## HTTP Client — Axios Instance

`src/utils/axiosInstance.js` pre-configures every outgoing request:

```js
baseURL: 'https://interview-platform-backend-uawb.onrender.com/'
timeout: 80000   // 80 s — Gemini generation can be slow
headers: { 'Content-Type': 'application/json' }
```

**Request interceptor** attaches the JWT bearer token automatically:

```js
config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
```

**Response interceptor** handles errors centrally:

- `401 Unauthorized` → clears user state, redirects to `/`
- `500 Server Error` → logs the server error message
- Network/timeout error → logs a timeout notice

---

## System Architecture

```mermaid
graph TB
    subgraph Client ["Client (Vercel)"]
        UI[React UI]
        CTX[UserContext]
        AX[Axios Instance]
        UI --> CTX
        UI --> AX
    end

    subgraph Server ["Server (Render)"]
        EX[Express App]
        AM[Auth Middleware]
        subgraph Routes
            AR[Auth Routes]
            SR[Session Routes]
            QR[Question Routes]
            AIR[AI Routes]
        end
        subgraph Controllers
            AC[AuthController]
            SC[SessionController]
            QC[QuestionController]
            AIC[AIController]
        end
        UP[/uploads/]
        EX --> AM
        AM --> Routes
        AR --> AC
        SR --> SC
        QR --> QC
        AIR --> AIC
    end

    subgraph Data ["Data Layer"]
        MDB[(MongoDB Atlas)]
        UM[User Model]
        SM[Session Model]
        QM[Question Model]
        MDB --> UM
        MDB --> SM
        MDB --> QM
    end

    subgraph External ["External Services"]
        GEM[Google Gemini API]
    end

    AX -->|HTTPS + JWT Bearer| EX
    AC --> MDB
    SC --> MDB
    QC --> MDB
    AIC -->|Gemini API Key| GEM
    EX --> UP
```


## Client ↔ Server Interaction

### Full Application Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant R as React Component
    participant AX as Axios Instance
    participant MW as Auth Middleware (Server)
    participant C as Controller (Server)
    participant DB as MongoDB
    participant G as Google Gemini API

    Note over U,G: ── Registration & Login ──────────────────────────
    U->>R: Fill signup form (name, email, password, avatar)
    R->>AX: POST /api/auth/upload-image (FormData)
    AX->>C: multipart/form-data (no JWT needed)
    C-->>AX: { imageUrl }
    R->>AX: POST /api/auth/register { name, email, password, profileImageUrl }
    AX->>C: JSON body
    C->>DB: Create User (password hashed with bcrypt)
    DB-->>C: Saved User
    C-->>AX: { token, user }
    AX-->>R: Success
    R->>R: updateUser() → token saved to localStorage

    Note over U,G: ── Page Load (Token Rehydration) ──────────────────
    U->>R: Open app (token in localStorage)
    R->>AX: GET /api/auth/profile
    AX->>AX: Interceptor adds Authorization: Bearer <token>
    AX->>MW: Request with JWT header
    MW->>MW: jwt.verify(token, JWT_SECRET)
    MW->>C: req.user = decoded { id }
    C->>DB: User.findById(req.user.id)
    DB-->>C: User document
    C-->>AX: { user }
    AX-->>R: User rehydrated into UserContext

    Note over U,G: ── Create Interview Session ───────────────────────
    U->>R: Submit session form (role, experience, topics)
    R->>AX: POST /api/sessions/create { role, experience, topicsToFocus }
    AX->>MW: Request + JWT
    MW->>MW: Verify token
    MW->>C: Authenticated request
    C->>G: generateContent(role + topics prompt)
    G-->>C: JSON array of { question, answer }
    C->>DB: Save Session document
    C->>DB: Save Question documents (bulk insert)
    C-->>AX: { session, questions }
    AX-->>R: Navigate to /interview-prep/:sessionId

    Note over U,G: ── Load Interview Prep Page ───────────────────────
    U->>R: Open /interview-prep/:sessionId
    R->>AX: GET /api/sessions/:id
    AX->>MW: Request + JWT
    MW->>C: Verified
    C->>DB: Session.findById().populate('questions')
    DB-->>C: Session with embedded questions
    C-->>AX: Full session object
    AX-->>R: Render QuestionCard list (Framer Motion animate-in)

    Note over U,G: ── AI Concept Explanation ─────────────────────────
    U->>R: Click "Learn More" on a QuestionCard
    R->>AX: POST /api/ai/generate-explanation { question }
    AX->>MW: Request + JWT
    MW->>C: Verified
    C->>G: generateContent(explanation prompt)
    G-->>C: JSON { title, explanation }
    C-->>AX: Explanation object
    AX-->>R: Open Drawer → render AIResponsePreview (Markdown)

    Note over U,G: ── Pin / Unpin Question ───────────────────────────
    U->>R: Click pin icon on QuestionCard
    R->>AX: POST /api/questions/:id/pin
    AX->>MW: Request + JWT
    MW->>C: Verified
    C->>DB: Question.findByIdAndUpdate { isPinned: !current }
    DB-->>C: Updated question
    C-->>AX: { isPinned }
    AX-->>R: Update local state, re-sort pinned to top

    Note over U,G: ── Add Personal Note ──────────────────────────────
    U->>R: Type note and save on QuestionCard
    R->>AX: POST /api/questions/:id/note { note }
    AX->>MW: Request + JWT
    MW->>C: Verified
    C->>DB: Question.findByIdAndUpdate { note }
    DB-->>C: Updated question
    C-->>AX: { note }
    AX-->>R: Close note editor, show saved note

    Note over U,G: ── Load More Questions ────────────────────────────
    U->>R: Click "Generate More Questions"
    R->>AX: POST /api/questions/add { sessionId, role, experience, topics }
    AX->>MW: Request + JWT
    MW->>C: Verified
    C->>G: generateContent(prompt)
    G-->>C: New { question, answer } array
    C->>DB: Save new Question documents, push IDs to Session
    C-->>AX: New questions array
    AX-->>R: Append QuestionCards to list

    Note over U,G: ── Delete Session ─────────────────────────────────
    U->>R: Confirm delete in modal
    R->>AX: DELETE /api/sessions/:id
    AX->>MW: Request + JWT
    MW->>C: Verified
    C->>DB: Delete Session + all linked Questions (cascade)
    DB-->>C: Deletion confirmed
    C-->>AX: { message: 'Deleted' }
    AX-->>R: Navigate back to /dashboard
```

### Profile Photo Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Signup Component
    participant AX as Axios
    participant MU as Multer Middleware
    participant FS as uploads/ directory
    participant DB as MongoDB

    U->>R: Select profile photo
    R->>R: FileReader.readAsDataURL() — local preview
    U->>R: Submit signup form
    R->>AX: POST /api/auth/upload-image (FormData, key: "image")
    AX->>MU: multipart/form-data (no JWT)
    MU->>MU: Validate MIME type (jpeg / png / jpg only)
    MU->>FS: Save as {timestamp}-{originalName}
    FS-->>MU: Stored path
    MU-->>AX: { imageUrl: "/uploads/{filename}" }
    R->>AX: POST /api/auth/register { ...formData, profileImageUrl }
    AX->>DB: Create User document with image URL
    DB-->>AX: { token, user }
    AX-->>R: updateUser() — logged in
```

---

## Key Component Behaviours

### QuestionCard

- Collapsed by default; click to expand answer
- **Pin** — toggles `isPinned`, pinned cards sort to top
- **Note** — inline editor that saves to the server on blur/submit
- **Learn More** — triggers Gemini explanation, opens Drawer with markdown-rendered content

### Dashboard

- Lists all sessions as `SummaryCard` tiles
- "+" button opens `CreateSessionForm` in a Modal
- Each tile links to `/interview-prep/:sessionId`

### InterviewPrep

- Fetches session + questions on mount
- Skeleton loaders shown during fetch/generation
- `RoleInfoHeader` displays role, experience, topics
- Framer Motion stagger animation for card list

---

## Environment

For local development, update the `baseURL` in `src/utils/axiosInstance.js`:

```js
baseURL: 'http://localhost:8000'
```

## Scripts

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build locally
npm run lint      # run ESLint
```

## Docker

```bash
# Build image
docker build -t interview-client .

# Run
docker run -p 5173:5173 interview-client
```

Or use Docker Compose from the repo root — see the root [README](../README.md) for the compose file.
