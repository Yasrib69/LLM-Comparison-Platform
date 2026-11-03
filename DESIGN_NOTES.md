# Design Notes — LLM Comparison Platform

## 1. Development Approach

I divided the assignment into six core requirements: prompt submission, generating responses from two different language models, side-by-side comparison, voting, leaderboard tracking, and persistent history.

I focused on implementing these requirements first, keeping the application simple and functional rather than adding unnecessary features.

I chose a single Next.js project for the frontend and backend to reduce setup complexity and simplify development.

## 2. Architecture and Technical Decisions

### Frontend and Backend

The application uses Next.js, React, and TypeScript. Next.js API routes handle requests from the frontend, allowing both parts of the application to remain in one repository.

### LLM Integration

I integrated two different AI providers:

- GroqCloud — GPT-OSS 20B
- Cerebras Inference — GPT-OSS 120B

Both providers receive the same prompt, and requests are executed concurrently using `Promise.all()` to reduce response time.

API keys are stored in server-side environment variables rather than exposed in frontend code.

### Database

I initially used local JSON storage to simplify development and validate the core functionality.

After verifying the application locally, I migrated the storage layer to Neon PostgreSQL using `@neondatabase/serverless`.

PostgreSQL provides persistent storage that can be accessed by both local and deployed instances of the application.

### Voting and Leaderboard

Each comparison allows one recorded vote. Voting uses an atomic database update to prevent multiple votes on the same comparison.

The leaderboard calculates total votes, wins, and win percentages from the stored voting records.

### User History

An anonymous browser identifier stored in localStorage associates comparisons with returning visitors.

This provides persistent history without requiring users to create accounts, although the browser identifier is not a secure authentication mechanism.

## 3. Verification

I manually verified the following functionality:

1. Both Groq and Cerebras generated responses from the same prompt.
2. Both responses appeared side by side.
3. A user could vote for the preferred response.
4. The leaderboard displayed the correct voting statistics.
5. Previous comparisons and votes appeared in the History section.
6. History persisted after closing and reopening the browser.
7. History persisted after restarting the local development server.
8. Comparisons were successfully inserted into Neon PostgreSQL.
9. Voting results were successfully updated in the PostgreSQL database.
10. The application passed `npm run build`, including TypeScript and linting checks.

These tests verified the core application functionality locally. Comprehensive automated, load, and security tests were not performed.

## 4. Limitations and Future Improvements

With additional time, I would improve the application by:

- Adding secure user authentication.
- Implementing API rate limiting and usage monitoring.
- Adding automated integration and end-to-end tests.
- Handling individual provider failures more gracefully.
- Randomizing model positions and hiding identities until voting.
- Recording API latency and reliability metrics.
- Strengthening access controls and data privacy.

## 5. Deployment Considerations

The application uses Neon PostgreSQL for persistent cloud storage and is structured for deployment through Vercel.

The deployment environment requires valid Groq, Cerebras, and Neon credentials configured as server-side environment variables.

A public deployment should be tested separately to confirm that all application features function correctly in the hosted environment.