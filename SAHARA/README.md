# SAHARA

SAHARA is a responsive, accessibility-first web prototype for independent everyday assistance.

## Run it

From this folder, run the secure local server:

```powershell
$env:OPENAI_API_KEY="your_key_here"
node server.mjs
```

Then visit `http://localhost:3000`. Chrome is recommended for camera, speech-recognition, and speech-output support. Location sharing requires HTTPS or localhost. Never put an API key in `app.js` or commit it to Git.

## Included working browser features

- Accessibility-profile onboarding and responsive interface
- Camera permission and live preview
- Browser text-to-speech
- Browser speech-recognition captions where supported
- Geolocation-based safety check-in, shared only after user review
- Keyboard focus styles and a skip-to-content link

## GPT-powered vision

The **Ask SAHARA** button captures one user-approved camera frame and sends it to the local server. The server sends it to the OpenAI Responses API using `gpt-5.6`; the API key remains server-side. The “Try demo result” control remains available for an offline UI demo.

## Important safety note

SAHARA should present its image and language outputs as assistive guidance, not certainty. Critical information such as medication, money, hazards, or navigation should prompt the user to verify before acting.
