# Discord Copilot Bot

This is the Discord bot for the Brief 1 Discord Copilot project.

## for Render.com Deployment

1. Go to https://dashboard.render.com/
2. Click "New +" → "Background Worker"
3. Connect this GitHub repo
4. Set Root Directory to: `discord-bot`
5. Set Build Command: `npm install`
6. Set Start Command: `npm start`
7. Add Environment Variables:
   - `DISCORD_TOKEN` = your Discord bot token
   - `GEMINI_API_KEY` = your Gemini API key
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
8. Deploy!
