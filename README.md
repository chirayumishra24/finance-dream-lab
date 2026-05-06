# Finance Dream Lab

This project is a React + Vite classroom business simulator with Supabase Edge Functions for AI features.

## Gemini activity analysis

The analytics screen now includes a `Gemini Analysis` panel that:

- analyzes the team activity month by month
- returns business insights and next-step recommendations
- suggests concrete visual improvements for the analytics and report UI

## Gemini API key setup

Do not put the Gemini key in a `VITE_` variable. That would expose it to every browser.

Use a Supabase Edge Function secret instead:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

For local function development, create `supabase/.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Then run your local stack or deploy the function:

```bash
supabase functions deploy analyze-activity
```

The existing frontend `.env` file should continue to hold only public Supabase values such as:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
