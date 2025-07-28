# Peer Bonus

[English](#english) | [日本語](#%E6%97%A5%E6%9C%AC%E8%AA%9E)

## 日本語

### プロジェクト概要
Peer Bonus は、チームメンバー同士が感謝の気持ちを送り合えるサービスです。Unipos のような機能を提供し、チームのモチベーション向上とポジティブなカルチャー醸成をサポートします。

### 主な機能
- **Kudos 送信**: チームメンバーに感謝のメッセージを送信
- **リアクション機能**: 送信された Kudos に絵文字でリアクション (❤️, 👏, 🎉, 🚀)
- **フィード表示**: チーム全体の Kudos をリアルタイムで表示
- **GraphQL API**: 効率的なデータ取得とリアルタイム更新

### クイックスタート

#### 前提条件
- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick start (local only)
```bash
docker compose up --build
open http://localhost:3000
```

Requires Docker Desktop or Podman.

- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
- GraphQL Playground: http://localhost:8000/graphql

### 開発

#### コードフォーマットとリント
```bash
# コードのフォーマット
$ make format

# リントの実行 (F821チェック含む)
$ make lint
```

#### テストの実行
```bash
$ make test
```

#### ログの確認
```bash
$ make logs
```

## English

### Project Overview
Peer Bonus is a service that allows team members to send appreciation to each other. It provides features similar to Unipos, supporting team motivation and fostering a positive culture.

### Key Features
- **Send Kudos**: Send appreciation messages to team members
- **Reaction System**: React to kudos with emojis (❤️, 👏, 🎉, 🚀)
- **Activity Feed**: Real-time display of team kudos
- **GraphQL API**: Efficient data fetching and real-time updates

### Quick Start

#### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)
- Git

#### Setup
```bash
# Clone the repository
$ git clone <repository-url> peer-bonus
$ cd peer-bonus

# Set up environment variables
$ cp .env.example .env
# Edit .env if needed

# Project structure
peer-bonus/
├── backend/
│   ├── alembic.ini
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── kudos.py
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── user_repository.py
│   │   │   └── kudos_repository.py
│   │   └── schemas/
│   │       ├── __init__.py
│   │       ├── user_schema.py
│   │       └── kudos_schema.py
│   ├── alembic/
│   │   └── versions/
│   ├── tests/
│   │   └── __init__.py
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── poetry.lock
│   └── pyproject.toml
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.local
│   ├── .gitignore
│   ├── next.config.js
│   ├── package.json
│   └── README.md
- Backend API Docs: http://localhost:8000/docs
- GraphQL Playground: http://localhost:8000/graphql

### Development

#### Code Formatting
```bash
$ make format
```

#### Running Tests
```bash
$ make test
```

#### Viewing Logs
```bash
$ make logs
```

### API & GraphQL Endpoints

#### REST API
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication

#### GraphQL
- `POST /graphql` - GraphQL endpoint

Example queries:
```graphql
# Get all users
query {
  users {
    id
    email
    name
  }
}

# Get kudos with reactions
query {
  kudos {
    id
    message
    sender {
      name
    }
    receiver {
      name
    }
    reactions {
      reactionType
      count
      userReacted
    }
  }
}

# Send kudos
mutation {
  send_kudos(input: {
    senderId: "user-id-1"
    receiverId: "user-id-2"
    message: "Great work on the project!"
  }) {
    id
    message
  }
}

# Toggle reaction
mutation {
  toggleReaction(input: {
    kudosId: "kudos-id"
    userId: "user-id"
    reactionType: "❤️"
  })
}
```

### Development Workflow
- Frontend hot-reloads on save
- Backend auto-reloads on save (development mode)
- Database migrations are managed with Alembic
- Pre-commit hooks for code quality

### Future Roadmap
- [ ] Slack OAuth integration
- [ ] AWS ECS/Fargate deployment
- [ ] Notification system
- [ ] Admin dashboard
- [ ] Analytics and reporting

### License
MIT
