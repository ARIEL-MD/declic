<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/54913eeb-a102-4215-96bc-90dc83d4a947

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Set `OPENAI_API_KEY` to add ChatGPT as a second AI engine, tried automatically
   whenever Gemini is unavailable.
4. (Optional) Set `GOOGLE_TRANSLATE_API_KEY` for an extra paid safety net on `/api/translate-text` —
   not required, since that route already tries a free, keyless Google Translate endpoint first.
   See comments in [.env.example](.env.example) for details.
5. Run the app:
   `npm run dev`
