#!/bin/bash
echo "📊 Container Status:"
docker ps --filter name=piratebay-backend --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n🔍 Health Check:"
curl -s http://localhost:3001/api/system/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/system/health

echo -e "\n📝 Recent Logs (last 20 lines):"
docker logs --tail 20 piratebay-backend
