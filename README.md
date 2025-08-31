# Personalized Movie Recommendations through Chatbot Interaction

This project was developed as part of my Master's thesis.  
It is a **Next.js web application** that integrates a **CopilotKit chatbot**.  
The chatbot guides users through preference selection (e.g. genres, platforms) and provides **personalized movie recommendations** based on stored preferences and dynamic inputs.

## ✨ Features
- Chatbot interaction with prompt-engineered conversation flow
- Personalized movie recommendations from TMDb API
- User profile management for editing and saving preferences
- Dynamic UI adjustments based on user input

## 🖼️ Screenshots

**Start page**  
![Start Page](docs/Startseite.png)

**Profile page**  
![Profile Page](docs/Profilseite.png)



## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/)
- [CopilotKit](https://copilotkit.ai/)
- [MongoDB](https://www.mongodb.com/)
- [TMDb API](https://www.themoviedb.org/documentation/api)
- [OpenAI GPT-4o](https://openai.com)

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

