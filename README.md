# Finance Dream Lab

This project is a React + Vite classroom business simulator deployed on Vercel.

## AI architecture

Gemini-powered features now run through Vercel API routes:

- `POST /api/analyze-activity`
- `POST /api/review-pitch`

The frontend calls these routes directly with `fetch()`, so Supabase is no longer part of the AI flow.

## Environment setup

Set this in Vercel Project Settings -> Environment Variables:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Do not use `VITE_GEMINI_API_KEY`, because that would expose the key to the browser.

For local development, create a root `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment

Deploy the project to Vercel as a standard Vite app. The static frontend will be built from `dist`, and the backend endpoints will be served from the `api/` directory.
