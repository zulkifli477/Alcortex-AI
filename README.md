# Alcortex AI - Clinical Diagnostic Suite

A high-performance medical diagnosis AI platform designed for medical professionals.

## Project Structure
- `/frontend`: React client application.
- `/backend`: Node.js Express server using TypeScript.
  - `/src/services`: Contains the OpenAI GPT-4o engine.
  - `/src/controllers`: API endpoint logic.

## AI Engine
Now exclusively using **OpenAI GPT-4o** for clinical synthesis and visual analysis. All Google Gemini dependencies have been removed for project consistency and performance.

## Getting Started
1. Configure `.env` in the `/backend` folder.
2. Run backend: `npm run server`
3. Run frontend: `npm run dev`