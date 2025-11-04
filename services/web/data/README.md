# Global Statistics Data Directory

This directory contains global statistics for the ChildDev platform.

## Files

- `global-stats.json` - Current global statistics (gitignored, changes frequently)
- `global-stats.json.template` - Template for initializing statistics

## Structure

```json
{
  "filword": 0,           // Total filword puzzles generated
  "readingText": 0,       // Total reading text exercises generated
  "crossword": 0,         // Total crosswords generated
  "copyText": 0,          // Total copy text exercises generated
  "handwriting": 0,       // Total handwriting exercises generated
  "total": 0,             // Total of all generators
  "lastUpdate": "ISO8601" // Timestamp of last update
}
```

## API Endpoints

### GET /api/stats/global
Returns current global statistics.

### POST /api/stats/global
Increments counter for a specific generator type.

**Body:**
```json
{
  "type": "filword" | "readingText" | "crossword" | "copyText" | "handwriting"
}
```

## Docker Volume

In production, this directory is mounted as a Docker volume (`childdev-stats`) to persist statistics between container restarts.

## Initialization

On first deployment:
```bash
cp global-stats.json.template global-stats.json
```

This is done automatically in the Dockerfile build process.
