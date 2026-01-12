# DBscope

<div align="center">

**The Modern UI for NoSQL Databases**

A unified, beautiful interface to connect, explore, and query your NoSQL databases.

[Features](#features) • [Quick Start](#quick-start) • [Docker](#docker-deployment) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

## Features

- 🗂️ **Multi-Database Support** - Cassandra, ScyllaDB (MongoDB, DynamoDB coming soon)
- 🌳 **Schema Explorer** - Interactive tree view of keyspaces, tables, and columns
- ⚡ **Query Editor** - Monaco editor with CQL syntax highlighting
- 📊 **Results Table** - Paginated results with column types and CSV export
- 💾 **Connection Profiles** - Save and manage multiple database connections (SQLite persistence)
- 📝 **Query History** - All queries logged with execution times
- 🐳 **Docker Ready** - One-command deployment with Docker Compose

---

## Quick Start

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd dbscope

# Install dependencies
npm install

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open http://localhost:3000

### Docker Deployment

```bash
# Build and start
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

---

## Usage

1. **Connect** - Click "Get Started" and select your database type
2. **Explore** - Browse keyspaces and tables in the schema explorer
3. **Query** - Write CQL queries with auto-complete and execute with Ctrl+Enter
4. **Export** - Download results as CSV for analysis

---

## Architecture

### Database Adapter Pattern

DBscope uses a flexible adapter architecture:

```
┌─────────────────────────────────────┐
│         React Frontend              │
│   (Next.js 15, ShadCN UI)           │
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
│  Cassandra  │ │   MongoDB   │ │  ...   │
│   Adapter   │ │   Adapter   │ │        │
└─────────────┘ └─────────────┘ └────────┘
```

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **UI**: ShadCN UI, Monaco Editor, TanStack Table
- **Backend**: GraphQL Yoga, Next.js API Routes
- **Database**: 
  - App Data: SQLite + Prisma 5
  - Target DBs: Cassandra Driver, MongoDB (planned), etc.

---

## API

### GraphQL Playground

http://localhost:3000/api/graphql

### REST Endpoints

- `GET /api/databases` - List supported databases
- `GET /api/profiles` - List connection profiles
- `POST /api/profiles` - Create connection profile
- `GET /api/health` - Health check

---

## Roadmap

### ✅ Phase 1-3 Complete
- Project setup with Next.js 15
- Cassandra adapter implementation
- Homepage and connection flow
- Schema explorer with tree view
- Query editor with Monaco

### ✅ Phase 4-5 Complete
- Docker distribution
- Health monitoring
- Error handling improvements
- Production-ready build

### 🔜 Future
- MongoDB adapter
- DynamoDB adapter
- Connection profile management UI
- Query history panel
- Saved queries feature
- Write operations (INSERT/UPDATE/DELETE)

---

## Development

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
│       └── db/            # Prisma client
├── prisma/                # Database schema
├── Dockerfile             # Production Docker image
└── docker-compose.yml     # Docker Compose config
```

### Adding a New Database Adapter

1. Create adapter file in `src/lib/adapters/<database>/adapter.ts`
2. Implement `DatabaseAdapter` interface
3. Register in `src/lib/adapters/registry.ts`
4. Add to GraphQL `DatabaseType` enum

See [Architecture Documentation](DBSCOPE_DOCS.md) for details.

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - see LICENSE file

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dbscope/issues)
- **Documentation**: See [DBSCOPE_DOCS.md](DBSCOPE_DOCS.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Built by developers, for developers** 🚀
