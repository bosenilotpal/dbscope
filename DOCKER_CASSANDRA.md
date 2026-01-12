# Connecting to Docker Cassandra

## From Host Machine (npm run dev)

When running `npm run dev` on your **host machine** and Cassandra in **Docker**, use:

```
Host: localhost
Port: 9042
```

**Why not `host.docker.internal`?**
- `host.docker.internal` is for container→host communication
- Your Next.js dev server is on the host, so use `localhost` for host→container

## Port Mapping Check

Make sure your Cassandra container has the port mapped:

```bash
docker ps | grep cassandra
```

Should show: `0.0.0.0:9042->9042/tcp`

If not mapped, restart with:
```bash
docker run -d --name cassandra -p 9042:9042 cassandra:latest
```

## Test Connection

From your host:
```bash
# Check if port is open
nc -zv localhost 9042

# Or use telnet
telnet localhost 9042
```

## Demo Viewer

To see the viewer design without connecting:
```
http://localhost:3000/demo
```

This shows the full 3-column layout with mock data.
