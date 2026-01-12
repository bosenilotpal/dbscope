# DBscope - Docker Publishing Guide

## Publishing to Docker Hub

### 1. Build the Image

```bash
docker build -t yourusername/dbscope:latest .
```

### 2. Tag for Version

```bash
docker tag yourusername/dbscope:latest yourusername/dbscope:1.0.0
```

### 3. Push to Docker Hub

```bash
# Login first
docker login

# Push latest
docker push yourusername/dbscope:latest

# Push version tag
docker push yourusername/dbscope:1.0.0
```

---

## Running on Any System

### Quick Start

```bash
docker run -d \
  -p 3847:3847 \
  -v dbscope-data:/app/data \
  --name dbscope \
  yourusername/dbscope:latest
```

### Using Docker Compose

```bash
# Pull and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Access

- **Application**: http://localhost:3847
- **GraphQL Playground**: http://localhost:3847/api/graphql
- **Health Check**: http://localhost:3847/api/health

---

## Data Persistence

All data (connection profiles, query history) is stored in the `/app/data` volume.

### Backup Data

```bash
docker cp dbscope-dbscope-1:/app/data ./backup
```

### Restore Data

```bash
docker cp ./backup/dbscope.db dbscope-dbscope-1:/app/data/dbscope.db
docker-compose restart
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3847 | Application port |
| `DATABASE_URL` | file:/app/data/dbscope.db | SQLite database path |
| `NODE_ENV` | production | Environment mode |

---

## Port 3847

DBscope uses port **3847** (unique unreserved port) to avoid conflicts with common applications.

If you need to change it:

```yaml
# docker-compose.yml
ports:
  - "8080:3847"  # Map host port 8080 to container port 3847
```

---

## Ready for Production ✅

The image is fully self-contained and portable:
- ✅ Multi-stage build (optimized size)
- ✅ Non-root user (security)
- ✅ Health checks enabled
- ✅ Volume persistence
- ✅ Automatic database initialization
- ✅ Standalone Next.js build

Pull and run on any system with Docker installed!
