# Open Developer

基于LLM的AI 编程助手，采用DeepAgents + OpenSandbox + Postgres全开源方案实现。

---

## 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [沙箱模式](#沙箱模式)
- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [API 参考](#api-参考)
- [Socket.io 事件](#socketio-事件)
- [Agent Server (Checkpoint)](#agent-server-checkpoint)

---

## 功能特性

- 自然语言输入 - 用自然语言描述项目需求
- 先规划后执行 - Agent 分析需求生成计划，用户确认后再执行
- 实时进度展示 - 步骤执行进度实时展示
- 沙箱执行 - 使用 OpenSandbox 安全执行代码
- 项目文件管理 - 可视化文件浏览器和代码编辑器
- 多 LLM 支持 - 支持 Anthropic、OpenAI、OpenRouter
- 实时预览 - 内置静态服务器，支持网页应用实时预览
- 多种沙箱模式 - 支持本地、Docker、远程 gRPC 模式
- Checkpoint 持久化 - 基于 PostgresSaver 的状态持久化，支持断点续传和调试回溯

---

## 快速开始

### 前置要求

| 要求     | 说明                            |
| -------- | ------------------------------- |
| Node.js  | 18+                             |
| Python   | 3 (用于静态文件服务器)          |
| API Keys | Anthropic / OpenAI / OpenRouter |

### 安装

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置

复制环境变量文件并配置 API Key：

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入你的 API Keys
```

### 启动

```bash
# 启动后端 (终端1)
cd backend
npm run dev

# 启动前端 (终端2)
cd frontend
npm run dev
```

访问 http://localhost:3000

---

## 沙箱模式

AI Developer 支持三种沙箱模式，通过环境变量 `SANDBOX_TYPE` 配置：

| 模式   | 配置值     | 说明                         | 适用场景               |
| ------ | ---------- | ---------------------------- | ---------------------- |
| 本地   | `local`  | 直接使用本地文件系统（默认） | 开发环境，最快         |
| Docker | `docker` | Docker 容器隔离              | 测试环境，需要 Docker  |
| 远程   | `remote` | 独立 gRPC 服务               | 生产环境，支持流式输出 |

### 本地模式 (默认)

```bash
SANDBOX_TYPE=local
```

直接使用本地文件系统执行代码，速度最快。

### Docker 模式

```bash
SANDBOX_TYPE=docker
```

使用 Docker 容器隔离项目，环境更干净。

### 远程模式 (gRPC)

```bash
SANDBOX_TYPE=remote
SANDBOX_HOST=192.168.1.100
SANDBOX_PORT=50051
```

连接到独立部署的远程沙箱服务，支持流式输出。

#### 启动远程沙箱服务

```bash
# 方式1: 直接运行
cd sandbox-server
pip install -r requirements.txt
python main.py

# 方式2: Docker 部署
cd sandbox-server
docker-compose up -d
```

### 沙箱配置参数

| 环境变量             | 默认值        | 说明               |
| -------------------- | ------------- | ------------------ |
| `SANDBOX_TYPE`     | `local`     | 沙箱类型           |
| `SANDBOX_HOST`     | `localhost` | 远程沙箱地址       |
| `SANDBOX_PORT`     | `50051`     | 远程沙箱端口       |
| `SANDBOX_TIMEOUT`  | `30000`     | 请求超时 (ms)      |
| `SANDBOX_RETRIES`  | `3`         | 重试次数           |
| `SANDBOX_FALLBACK` | `true`      | 远程失败时自动降级 |

---

## 项目架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐       │
│  │   Header    │  │   Sidebar   │  │ FileBrowser │  │  Preview  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘       │
│                           Socket.io / HTTP                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         后端服务 (Node.js)                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SandboxFactory (沙箱工厂)                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐        │   │
│  │  │    Local     │  │    Docker    │  │      Remote         │        │   │
│  │  │  (默认)      │  │  (容器)      │  │   (gRPC + Python)  │        │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐                │
│  │  /api/chat   │  │ /api/sandbox │  │ /api/preview-server│                │
│  └──────────────┘  └──────────────┘  └────────────────────┘                │
│         │                  │                       │                          │
│  ┌──────┴───────┐  ┌─────┴────────┐  ┌───────┴────────┐                 │
│  │ DeepAgents   │  │ Sandbox      │  │   Socket.io    │                 │
│  │ (LLM 代理)   │  │ Service      │  │  (实时通信)     │                 │
│  └──────────────┘  └──────────────┘  └────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Agent Server (Python FastAPI)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              LangGraph Agent + PostgresSaver                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │   │
│  │  │    Agent     │  │  Checkpoint   │  │    Checkpoint API    │    │   │
│  │  │   Graph      │  │   Manager     │  │  /api/checkpoints/*  │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                              ┌─────▼─────┐                                │
│                              │  Postgres │  (agent_db)                    │
│                              │  :5432    │                                │
│                              └───────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
   │   Local     │          │   Docker    │          │   Remote    │
   │  Sandbox    │          │  Container  │          │  gRPC Server│
   │ (本地文件)  │          │  (容器隔离)  │          │ (独立服务)  │
   └─────────────┘          └─────────────┘          └─────────────┘
```

### 端口说明

| 服务           | 端口      | 说明                 |
| -------------- | --------- | -------------------- |
| Frontend       | 3000      | 前端 Web UI          |
| Backend        | 4000      | 后端 API + Socket.io |
| Sandbox (gRPC) | 50051     | 远程沙箱服务         |
| Agent Server   | 8000      | Checkpoint API       |
| Postgres       | 5432      | Checkpoint 数据库    |
| Preview Server | 3001-9999 | 用户项目预览服务器   |

---

## 技术栈

### 后端

- Node.js + Express
- Socket.io (实时通信)
- Dockerode (容器管理，可选)
- DeepAgents (多 LLM 集成)
- Python (静态文件服务器)
- gRPC (远程沙箱通信)

### 前端

- React 18 + TypeScript
- Vite (构建工具)
- Monaco Editor (代码编辑器)
- Socket.io Client
- Lucide React (图标)

---

## 项目结构

```
opendevloper/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   └── deepAgents.ts      # DeepAgents LLM 代理服务
│   │   ├── sandbox/
│   │   │   ├── index.ts           # 沙箱工厂
│   │   │   ├── interfaces.ts      # 沙箱接口定义
│   │   │   ├── local/             # 本地沙箱实现
│   │   │   │   └── LocalSandboxService.ts
│   │   │   ├── docker/            # Docker 沙箱实现
│   │   │   │   └── DockerSandboxService.ts
│   │   │   ├── remote/           # 远程沙箱客户端
│   │   │   │   └── RemoteSandboxClient.ts
│   │   │   └── proto/            # gRPC 协议定义
│   │   │       └── sandbox.proto
│   │   ├── routes/
│   │   │   ├── chat.ts           # 聊天 API
│   │   │   ├── sandbox.ts         # 沙箱 API
│   │   │   └── files.ts           # 文件操作 API
│   │   ├── services/
│   │   │   └── socket.ts         # Socket.io 事件处理
│   │   ├── types.ts               # 后端类型定义
│   │   └── index.ts               # 服务入口
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # 顶部导航栏
│   │   │   ├── Sidebar.tsx        # 侧边栏
│   │   │   ├── FileBrowser.tsx    # 文件浏览器
│   │   │   ├── PreviewPanel.tsx   # 预览面板
│   │   │   ├── ProgressPanel.tsx   # 进度面板
│   │   │   ├── PlanModal.tsx      # 计划确认弹窗
│   │   │   └── SettingsModal.tsx   # 设置弹窗
│   │   ├── context/
│   │   │   └── AppContext.tsx     # 全局状态管理
│   │   ├── hooks/
│   │   │   └── useApi.ts          # API 和 Socket 钩子
│   │   ├── types/
│   │   │   └── index.ts           # 前端类型定义
│   │   ├── App.tsx                # 应用入口
│   │   └── main.tsx               # React 入口
│   ├── package.json
│   └── vite.config.ts
│
├── sandbox-server/                  # 远程沙箱服务 (可选)
│   ├── main.py                    # 入口
│   ├── sandbox/
│   │   ├── __init__.py
│   │   └── service.py             # gRPC 服务实现
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── agent-server/                    # Agent 服务 + Checkpoint 持久化
│   ├── main.py                    # FastAPI 入口
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── state.py               # Agent State schema
│   │   ├── nodes.py               # Agent 节点
│   │   └── graph.py               # LangGraph 定义
│   ├── checkpoint/
│   │   ├── __init__.py
│   │   ├── postgres_saver.py      # PostgresSaver 封装
│   │   └── api.py                 # Checkpoint REST API
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docker-compose.yml               # Docker 配置
├── README.md                       # 项目文档
└── SPEC.md                         # 详细规格说明
```

---

## API 参考

### 聊天 API

| 方法     | 路径                     | 说明         |
| -------- | ------------------------ | ------------ |
| `POST` | `/api/sandbox/plan`    | 生成执行计划 |
| `POST` | `/api/sandbox/execute` | 执行计划     |

### 沙箱 API

| 方法     | 路径                     | 说明         |
| -------- | ------------------------ | ------------ |
| `POST` | `/api/sandbox/create`  | 创建沙箱     |
| `POST` | `/api/sandbox/destroy` | 销毁沙箱     |
| `GET`  | `/api/sandbox/files`   | 获取文件列表 |
| `POST` | `/api/sandbox/exec`    | 执行命令     |

### 预览代理

| 方法  | 路径                            | 说明             |
| ----- | ------------------------------- | ---------------- |
| `*` | `/api/preview-server/:port/*` | 代理到本地服务器 |

### Agent Server API (Checkpoint 持久化)

> 需要启动 Agent Server (`agent-server/`)

| 方法       | 路径                                                                 | 说明                  |
| ---------- | -------------------------------------------------------------------- | --------------------- |
| `GET`    | `/`                                                                | 根路径，返回 API 信息 |
| `GET`    | `/health`                                                          | 健康检查              |
| `GET`    | `/api/checkpoints/threads`                                         | 列出所有会话          |
| `GET`    | `/api/checkpoints/threads/{thread_id}`                             | 获取会话详情          |
| `GET`    | `/api/checkpoints/threads/{thread_id}/history`                     | 获取 checkpoint 历史  |
| `GET`    | `/api/checkpoints/threads/{thread_id}/checkpoints/{checkpoint_id}` | 获取具体 checkpoint   |
| `GET`    | `/api/checkpoints/threads/{thread_id}/latest`                      | 获取最新 checkpoint   |
| `DELETE` | `/api/checkpoints/threads/{thread_id}`                             | 删除会话              |

---

## Socket.io 事件

### 客户端 → 服务端

| 事件              | 说明         |
| ----------------- | ------------ |
| `join-sandbox`  | 加入沙箱房间 |
| `leave-sandbox` | 离开沙箱房间 |

### 服务端 → 客户端

| 事件               | 说明           |
| ------------------ | -------------- |
| `progress`       | 步骤执行进度   |
| `log`            | 步骤日志输出   |
| `complete`       | 执行完成       |
| `server-started` | 服务器启动事件 |

---

## Agent Server (Checkpoint)

Agent Server 提供基于 LangGraph PostgresSaver 的 Checkpoint 持久化功能，支持：

- **断点续传** - Agent 崩溃后可从上次状态恢复
- **调试回溯** - 查看任意 checkpoint 的状态快照
- **状态历史** - 完整的执行历史记录

### 启动方式

```bash
# 方式1: Docker Compose (推荐)
docker-compose up -d agent-postgres agent-server

# 方式2: 本地运行
cd agent-server
pip install -r requirements.txt
python main.py
```

Agent Server 会在 `http://localhost:8000` 启动。

### 环境变量

| 环境变量         | 默认值                                                        | 说明            |
| ---------------- | ------------------------------------------------------------- | --------------- |
| `DATABASE_URL` | `postgresql://agent:agent_password@localhost:5432/agent_db` | Postgres 连接串 |
| `HOST`         | `0.0.0.0`                                                   | 服务监听地址    |
| `PORT`         | `8000`                                                      | 服务监听端口    |

### 数据表

LangGraph PostgresSaver 会自动创建以下表：

| 表名                      | 说明                             |
| ------------------------- | -------------------------------- |
| `checkpoints`           | 主表：存储每个执行步骤的状态快照 |
| `checkpoint_blobs`      | 存储大型数据（JSON）             |
| `checkpoint_writes`     | 存储中间写入操作                 |
| `checkpoint_migrations` | 迁移版本记录                     |
