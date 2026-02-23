# AI Developer - Coze-Style AI Programming Platform

## Project Overview

- **Project Name**: AI Developer (AI编程助手)
- **Type**: Full-stack Web Application
- **Core Functionality**: An AI-powered programming assistant that allows users to describe projects in natural language, generates execution plans, and safely executes code in isolated sandboxes
- **Target Users**: Developers, students, and non-technical users who want to create applications through natural language

## Technology Stack

### Backend
- **Runtime**: Node.js with Express
- **LLM Integration**: DeepAgents (Anthropic, OpenAI, OpenRouter)
- **Sandbox**: OpenSandbox via Docker container
- **WebSocket**: Socket.io for real-time progress

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Custom components (Coze-inspired)
- **Code Editor**: Monaco Editor
- **State Management**: React Context + useReducer
- **Styling**: CSS Modules with CSS Variables

## UI/UX Specification

### Color Palette
```css
--bg-primary: #0d1117;
--bg-secondary: #161b22;
--bg-tertiary: #21262d;
--bg-hover: #30363d;
--border-primary: #30363d;
--border-secondary: #21262d;
--text-primary: #e6edf3;
--text-secondary: #8b949e;
--text-muted: #6e7681;
--accent-blue: #58a6ff;
--accent-green: #3fb950;
--accent-orange: #d29922;
--accent-red: #f85149;
--accent-purple: #a371f7;
--accent-cyan: #39d353;
```

### Typography
- **Font Family**: 'JetBrains Mono', 'Fira Code', monospace for code; 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif for UI
- **Heading Sizes**: H1: 28px, H2: 22px, H3: 18px
- **Body Text**: 14px regular, 13px small
- **Code**: 13px monospace

### Layout Structure

#### Main Layout (3-Column)
```
┌─────────────────────────────────────────────────────────────────┐
│  Header (56px height)                                           │
├──────────────┬──────────────────────────────┬──────────────────┤
│              │                              │                  │
│   Sidebar    │      Main Content Area       │   File Browser   │
│   (280px)    │      (flexible)              │   (320px)        │
│              │                              │                  │
│  - Chat      │  - Chat Messages             │  - Tree View     │
│  - History   │  - Plan Display              │  - File Actions  │
│  - Settings  │  - Code Preview              │                  │
│              │                              │                  │
└──────────────┴──────────────────────────────┴──────────────────┘
```

### Components

#### 1. Header
- Logo and app name (left)
- Model selector dropdown (center)
- Settings gear icon (right)
- Height: 56px
- Background: var(--bg-secondary)
- Border bottom: 1px solid var(--border-primary)

#### 2. Chat Panel (Left Sidebar + Main Area)
- **Chat Input Area**
  - Textarea with placeholder "描述你想要构建的项目..."
  - Send button (blue accent)
  - Attachment button for context
  - Height expands with content (max 200px)
  - Rounded corners: 12px

- **Message Bubbles**
  - User messages: Right-aligned, bg-tertiary background
  - AI messages: Left-aligned, bg-secondary background
  - Code blocks: Syntax highlighted, rounded 8px, dark background
  - Markdown support for explanations

#### 3. Plan Display (Modal/Panel)
- Appears after AI analyzes the request
- Shows numbered steps with descriptions
- Each step shows: Step number, action type icon, description
- Action types: CREATE_FILE, EDIT_FILE, RUN_COMMAND, INSTALL_PACKAGE
- "确认执行" button (green) and "取消" button (red outline)
- Estimated time display

#### 4. Progress Panel
- Appears during execution
- Vertical timeline style
- Each step shows:
  - Status icon (pending: circle, running: spinner, success: check, failed: X)
  - Step description
  - Duration
  - Expandable output/logs
- Real-time updates via WebSocket
- Progress bar at top (percentage)

#### 5. File Browser (Right Panel)
- Tree view with expand/collapse
- File icons by type (folder, js, ts, json, md, etc.)
- Context menu: New File, New Folder, Rename, Delete
- Double-click to open in editor
- Drag and drop support
- Search/filter input at top

#### 6. Code Editor (Modal or Split View)
- Monaco Editor integration
- Tabs for multiple files
- Save button
- Syntax highlighting
- Line numbers
- Minimap (optional)
- Theme: VS Code Dark+

#### 7. Settings Modal
- API Key inputs for each provider
- Model selection
- Sandbox configuration
- Theme toggle (future)
- Clear conversation button

### Responsive Breakpoints
- Desktop: >= 1200px (full 3-column)
- Tablet: 768px - 1199px (hide file browser, toggle button)
- Mobile: < 768px (single column, bottom navigation)

### Animations
- Message appear: fadeIn + slideUp (200ms ease-out)
- Panel transitions: 300ms ease
- Button hover: scale(1.02) + brightness increase
- Progress step: slideIn from left (150ms)
- Modal: fadeIn backdrop (200ms) + scale content (250ms)

## Functionality Specification

### Core Features

#### 1. Natural Language Input
- User types project description in Chinese or English
- Support for pasting code snippets
- Markdown formatting in input
- History suggestions dropdown

#### 2. Plan Generation & Confirmation
- AI analyzes requirements
- Generates step-by-step plan:
  - File operations (create, edit, delete)
  - Commands to run
  - Dependencies to install
- User reviews and confirms
- Can edit plan before confirmation

#### 3. Real-time Progress
- WebSocket connection for live updates
- Step-by-step execution
- Output streaming
- Error highlighting
- Ability to cancel execution

#### 4. OpenSandbox Integration
- Docker container management
- Isolate code execution
- Resource limits (CPU, memory, time)
- File system access
- Network access (optional)
- Clean up after execution

#### 5. File Management
- Create, read, update, delete files
- Directory structure visualization
- File content preview
- Multiple file editing
- Auto-save with debounce

#### 6. Multi-LLM Support
- **Anthropic**: Claude-3.5-Sonnet, Claude-3-Haiku
- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4-Turbo
- **OpenRouter**: Various models (DeepSeek, Qwen, etc.)
- Easy API key configuration
- Model fallback on failure

### User Interactions & Flows

#### Flow 1: Create New Project
1. User enters project description
2. AI analyzes and generates plan
3. User reviews plan, clicks confirm
4. Progress panel shows execution
5. Files created in sandbox
6. Success message with file tree

#### Flow 2: Edit Existing Project
1. User selects project from history
2. Or opens files in editor
3. Makes changes
4. Runs code in sandbox
5. Views output

#### Flow 3: Settings Configuration
1. Click settings icon
2. Enter API keys
3. Select default model
4. Test connection
5. Save settings

### Data Handling

#### Frontend State
```typescript
interface AppState {
  messages: Message[];
  currentPlan: PlanStep[];
  executionStatus: ExecutionStatus;
  files: FileNode[];
  openFiles: string[];
  activeFile: string | null;
  settings: Settings;
  model: string;
}
```

#### Backend API Endpoints
- `POST /api/chat` - Send message, get AI response
- `POST /api/plan` - Generate execution plan
- `POST /api/execute` - Execute confirmed plan
- `GET /api/files` - List project files
- `GET /api/files/:path` - Read file content
- `POST /api/files` - Create/update file
- `DELETE /api/files/:path` - Delete file
- `POST /api/sandbox/exec` - Run command in sandbox
- `WS /ws` - Real-time progress updates

### Edge Cases
- Empty input: Show validation message
- API key missing: Prompt to configure
- Network error: Retry with exponential backoff
- Sandbox timeout: Kill and clean up
- Invalid plan: Show error, allow retry
- File conflict: Prompt for overwrite

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme matches color palette exactly
- [ ] 3-column layout renders correctly on desktop
- [ ] Chat messages display with proper styling
- [ ] Plan modal appears and is readable
- [ ] Progress panel shows real-time updates
- [ ] File tree renders with proper icons
- [ ] Monaco editor loads and is functional
- [ ] Settings modal opens and saves

### Functional Checkpoints
- [ ] Can send message and receive response
- [ ] Plan generates and displays correctly
- [ ] Can confirm plan and see execution
- [ ] Files appear in file browser after execution
- [ ] Can open and edit files
- [ ] Settings save and persist
- [ ] Multiple LLM providers work
- [ ] WebSocket updates work in real-time

### Performance
- [ ] Initial load < 3 seconds
- [ ] Message response < 5 seconds (API dependent)
- [ ] UI remains responsive during execution
- [ ] No memory leaks during long sessions
