# DBscope

<div align="center">

![DBscope](https://img.shields.io/badge/DBscope-v1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**The Modern UI for NoSQL Databases**

A unified, beautiful interface to connect, explore, and query your NoSQL databases.  
Built with Next.js, Docker-ready, and designed for developer productivity.

[Features](#-features) • [Quick Start](#-quick-start) • [Docker](#-docker) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 🚀 Quick Start

### Docker (Recommended)

Get up and running in seconds:

```bash
# Pull and run the latest image
docker run -d -p 3847:3847 -v dbscope-data:/app/data dbscope/app:latest

# Access at http://localhost:3847
```

### Docker Compose

```yaml
version: '3.8'
services:
  dbscope:
    image: dbscope/app:latest
    ports:
      - "3847:3847"
    volumes:
      - dbscope-data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/dbscope.db
    restart: unless-stopped

volumes:
  dbscope-data:
```

```bash
docker-compose up -d
```

### Local Development

```bash
# Clone repository
git clone https://github.com/bosenilotpal/dbscope.git
cd dbscope

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

- 🗂️ **Multi-Database Support** - Cassandra, ScyllaDB (MongoDB, DynamoDB coming soon)
- 🌳 **Schema Explorer** - Interactive tree view of keyspaces, tables, and columns
- ⚡ **Query Editor** - Monaco editor with CQL syntax highlighting and shortcuts (⌘ Enter)
- 📊 **Results Table** - Paginated results with column types and CSV export
- 💾 **Connection Profiles** - Save, pin, and quickly access your favorite connections
- 📝 **Query History** - All queries logged with execution times and status
- 🐳 **Docker Ready** - One-command deployment with persistent data
- 🔒 **Secure** - Encrypted connection storage with session management
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS v4

---

## 🐳 Docker

### Port Configuration

DBscope uses port **3847** (an unreserved port) to avoid conflicts with common applications.

### Volume Persistence

All data (connection profiles, query history) is stored in `/app/data/dbscope.db`:

```bash
# Backup your data
docker cp dbscope:/app/data/dbscope.db ./backup.db

# Restore data
docker cp ./backup.db dbscope:/app/data/dbscope.db
docker restart dbscope
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3847 | Application port |
| `DATABASE_PATH` | /app/data/dbscope.db | SQLite database path |
| `NODE_ENV` | production | Environment mode |

---

## 🏗 Architecture

### Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- ShadCN UI Components
- Monaco Editor
- TanStack Table

**Backend**
- GraphQL Yoga
- Next.js API Routes
- better-sqlite3 (lightweight, ~2MB)

**Deployment**
- Docker & Docker Compose
- Node.js 20 Alpine
- Multi-stage optimized build

**Database Adapters**
- App Data: SQLite (better-sqlite3)
- Target DBs: Cassandra Driver, ScyllaDB

### Database Adapter Pattern

```
┌─────────────────────────────────────┐
│         React Frontend              │
│   (Next.js 16, ShadCN UI)           │
└──────────────┬──────────────────────┘
               │ GraphQL
┌──────────────┴──────────────────────┐
│      GraphQL API (Yoga)             │
│  - Type-safe resolvers              │
│  - Schema introspection             │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│      Adapter Registry               │
│  - Dynamic adapter routing          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┬─────────────┐
       │                │             │
┌──────┴──────┐ ┌──────┴──────┐ ┌───┴────┐
│  Cassandra  │ │  ScyllaDB   │ │  More  │
│   Adapter   │ │   Adapter   │ │  Soon  │
└─────────────┘ └─────────────┘ └────────┘
```

### Project Structure

```
dbscope/
├── app/                    # Next.js app router
│   ├── api/               # API routes (GraphQL, REST)
│   ├── connect/           # Connection page
│   └── viewer/            # Integrated viewer
├── src/
│   ├── components/        # React components
│   │   └── features/      # Feature-specific components
│   └── lib/
│       ├── adapters/      # Database adapters
│       ├── graphql/       # GraphQL schema & resolvers
│       └── db/            # SQLite helper
├── Dockerfile             # Production Docker image
└── docker-compose.yml     # Docker Compose config
```

---

## 🔌 Connecting to Dockerized Databases

### From DBscope Docker Container

When connecting to a database running in another Docker container **from** DBscope running in Docker:

1. **Enable "Dockerized Database" toggle** in the connection form
2. Host will auto-configure to `host.docker.internal`

Or manually use:
- **Host**: `host.docker.internal`
- **Port**: Your database port (e.g., 9042 for Cassandra)

### Same Docker Network

If both DBscope and your database are on the same network:

```bash
docker network create dbscope-net

docker run -d --network dbscope-net --name cassandra cassandra:latest
docker run -d --network dbscope-net -p 3847:3847 dbscope:latest

# Connect using hostname: cassandra
```

---

## 🔑 Key Features

### Connection Profiles

- **Save**: Store connection details for quick access
- **Pin**: Mark favorites for instant access
- **Recent**: Auto-tracked recent connections
- **Secure**: Passwords stored in SQLite (TODO: encryption)

### Query Editor

- **Monaco Integration**: Industry-standard code editor
- **Syntax Highlighting**: CQL support out of the box
- **Keyboard Shortcuts**: ⌘ Enter (Mac) / Ctrl+Enter (Windows)
- **Font**: JetBrains Mono for optimal readability

### Results Table

- **Pagination**: Handle large result sets efficiently
- **Export**: Download as CSV
- **Type Display**: Column types visible
- **Performance**: Execution time tracking

---

## 🛠 Development

### Adding a New Database Adapter

1. Create adapter file in `src/lib/adapters/<database>/adapter.ts`
2. Implement `DatabaseAdapter` interface
3. Register in `src/lib/adapters/registry.ts`
4. Add to GraphQL `DatabaseType` enum

See existing adapters for reference.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🌟 Support

- **Issues**: [GitHub Issues](https://github.com/bosenilotpal/dbscope/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bosenilotpal/dbscope/discussions)

---

<div align="center">

**Built by developers, for developers** 🚀

[⭐ Star on GitHub](https://github.com/bosenilotpal/dbscope)

</div>
