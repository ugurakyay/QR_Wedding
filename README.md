# Wedding Gallery

Full-stack wedding photo and video sharing application.

## Project Structure

```
wedding-gallery/
├── client/                 # React + Vite + TailwindCSS (step 2)
├── server/                 # Express API
│   └── src/
│       ├── config/         # Environment configuration
│       ├── middleware/     # Express middleware
│       ├── routes/         # API route handlers
│       ├── services/       # AWS S3 integration
│       └── utils/          # Shared utilities
├── docker/                 # Docker setup (later step)
├── .env.example            # Environment variable template
└── package.json            # npm workspaces root
```

## Step 1: Folder Structure & AWS S3 (current)

The backend generates **presigned S3 URLs** so clients upload directly to S3 without passing files through the server.

### Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Fill in your AWS credentials and bucket name in `.env`.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm run dev:server
   ```

### AWS S3 Bucket Configuration

Create an S3 bucket and configure CORS so the browser can PUT files directly:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Ensure the IAM user/role has at least:
- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`
- `s3:DeleteObject`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/upload/config` | Upload limits and allowed MIME types |
| POST | `/api/upload/presign` | Generate presigned upload URL |
| GET | `/api/upload/media` | List media with presigned view URLs |

### Presign Request Example

```bash
curl -X POST http://localhost:3001/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "wedding-photo.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 2048000
  }'
```

Response:
```json
{
  "uploadUrl": "https://your-bucket.s3.amazonaws.com/...",
  "key": "uploads/uuid-wedding-photo.jpg",
  "bucket": "your-wedding-gallery-bucket",
  "expiresIn": 300,
  "mimeType": "image/jpeg"
}
```

Upload the file directly to S3:
```bash
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @wedding-photo.jpg
```

## Step 2: React Frontend (current)

### Run both servers

```bash
# Terminal 1 — API
npm run dev:server

# Terminal 2 — Frontend
npm run dev:client
```

Open http://localhost:5173

### Frontend pages

| Route | Description |
|-------|-------------|
| `/` | Upload photos & videos with progress |
| `/gallery` | Responsive masonry gallery |
| `/admin` | Password-protected media management |

Configure couple name and admin password in `client/.env` (see `client/.env.example`).

## Next Steps

- [ ] Backend admin routes (login, delete)
- [ ] Docker support
