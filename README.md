<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kVnB2BDfvCQMUmbEG8iGU7CFKaFauODw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_OPENAI_API_KEY` in [.env.local](.env.local) or in Vercel Environment Variables (do not commit API keys)
3. For LinkedIn OAuth, set `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, and `LINKEDIN_REDIRECT_URI` in Vercel Environment Variables. Optional: `LINKEDIN_SCOPES` (defaults to `openid profile email`). Deeper profile fields require PDF upload parsing in the browser.
4. Run the app:
   `npm run dev`
