# GATE Exam Preparation Web Portal (Full MERN Stack)

A full-stack, production-ready GATE preparation web application built with MongoDB, Express.js, React.js, Node.js, and Google Gemini AI API integration.

## Key Features
1. **Multi-Branch Coverage:** Complete curriculum for CSE, ECE, EE, ME, and CE.
2. **Video Lectures Navigation:** One-click red button per subject redirecting to curated high-yield YouTube lecture playlists.
3. **Structured Chapter Notes:** Direct Google Drive access links and summarized bullet points.
4. **Subject Quizzes & Mock Tests:** Immediate feedback, explanations, and scoring saved to MongoDB.
5. **Clean Official PYQs:** Direct PDF downloads without redundant distractors.
6. **24/7 AI Tutor Chatbot:** Multimodal doubt solver accepting both text questions and photo uploads with 50MB payload handling and automatic model fallbacks.

## Quick Start Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with your valid Gemini API key:
# GEMINI_API_KEY=AIzaSy...
npm start
```
Runs at `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Runs at `http://localhost:3000`
