#!/bin/sh
set -e

# Initialize global stats if not exists
if [ ! -f /app/data/global-stats.json ]; then
  echo "Initializing global-stats.json from template..."
  cp /app/data/global-stats.json.template /app/data/global-stats.json
fi

# Ensure correct permissions (in case volume was mounted)
chmod 664 /app/data/global-stats.json 2>/dev/null || true

# Execute the main command
exec "$@"
