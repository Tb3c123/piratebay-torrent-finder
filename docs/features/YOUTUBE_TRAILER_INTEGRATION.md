# YouTube API Integration Setup Guide

## 🎬 YouTube Trailer Feature

This guide will help you set up YouTube Data API v3 to display movie trailers.

## Prerequisites

- Google Account
- Google Cloud Console access

## Step 1: Create YouTube API Key

### 1.1 Go to Google Cloud Console

Visit: <https://console.cloud.google.com/>

### 1.2 Create a New Project (or select existing)

1. Click on project dropdown (top left)
2. Click "New Project"
3. Name it: "Pirate Bay Torrent Finder"
4. Click "Create"

### 1.3 Enable YouTube Data API v3

1. Go to: <https://console.cloud.google.com/apis/library>
2. Search for "YouTube Data API v3"
3. Click on it
4. Click "Enable"

### 1.4 Create API Credentials

1. Go to: <https://console.cloud.google.com/apis/credentials>
2. Click "+ CREATE CREDENTIALS" → "API Key"
3. Your API key will be created
4. **IMPORTANT**: Click "Restrict Key" to add restrictions:
   - **API restrictions**: Select "Restrict key"
   - Choose: "YouTube Data API v3"
   - **Optional but recommended**: Add HTTP referrers or IP restrictions
5. Click "Save"

## Step 2: Add API Key to Project

### 2.1 Add to Backend .env

```bash
# In backend/.env or root .env
YOUTUBE_API_KEY=AIzaSy... # Your actual API key
```

### 2.2 Add to Frontend .env (if using client-side calls)

```bash
# Optional: for client-side YouTube searches
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy... # Your actual API key
```

## Step 3: Restart Docker Containers

```bash
docker-compose build
docker-compose up -d
```

## Step 4: Test the Feature

1. Go to <http://localhost:3000>
2. Search for a movie (e.g., "The Matrix")
3. Click on a movie card
4. Click "Watch Trailer" button
5. Trailer should load from YouTube!

## API Usage Limits

### Free Tier Quotas

- **Default quota**: 10,000 units/day
- **Search request**: 100 units
- **Approximately**: 100 trailer searches per day

### Cost Optimization Tips

1. Enable result caching (already implemented)
2. Only search when user clicks "Watch Trailer"
3. Store videoId in session/cache
4. Monitor usage in Google Cloud Console

### Increase Quota (if needed)

1. Go to: <https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas>
2. Click on quota you want to increase
3. Request quota increase (requires billing account)

## Troubleshooting

### "YouTube API key not configured"

- Check `.env` file has `YOUTUBE_API_KEY`
- Restart backend: `docker-compose restart backend`

### "Failed to load trailer"

- Check API key is valid
- Check API is enabled in Google Cloud Console
- Check quota hasn't been exceeded
- Check browser console for errors

### "No trailer found"

- Movie may not have official trailer on YouTube
- Try alternative search with different movie title
- API searches for "official trailer" keyword

## Security Best Practices

1. **Never commit API keys to git**
   - `.env` is in `.gitignore`
   - Use `.env.example` for templates

2. **Restrict API key**
   - Add HTTP referrer restrictions
   - Add IP restrictions (for backend)
   - Limit to YouTube Data API v3 only

3. **Monitor usage**
   - Set up quota alerts in Google Cloud Console
   - Monitor daily usage

## API Endpoints

### Backend Routes

```bash
# Get single best trailer
GET /api/youtube/trailer?title=The Matrix&year=1999

# Get multiple trailer options
GET /api/youtube/trailers?title=Inception&year=2010
```

### Response Format

```json
{
  "success": true,
  "trailer": {
    "videoId": "m8e-FF8MsqU",
    "title": "The Matrix (1999) Official Trailer",
    "description": "Official trailer...",
    "thumbnail": "https://i.ytimg.com/vi/...",
    "channelTitle": "Warner Bros. Pictures",
    "publishedAt": "2013-05-18T00:00:00Z"
  }
}
```

## Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [API Reference](https://developers.google.com/youtube/v3/docs)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:

1. Check API key in `.env`
2. Verify API is enabled
3. Check quota limits
4. Review backend logs: `docker-compose logs backend`
