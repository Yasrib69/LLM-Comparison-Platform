# Design Notes — LLM Comparison Platform

## 1. Development Approach

I started by breaking the assignment into six main requirements: prompt submission, generating responses from two different LLMs, displaying responses side by side, voting, leaderboard tracking, and persistent comparison history.

My priority was to build a functional application with a simple architecture rather than spending unnecessary time on UI complexity.

I chose to keep the frontend and backend in a single Next.js project to simplify development, testing, and maintenance.

## 2. Architecture and Technical Decisions

**Frontend and Backend**

I used Next.js with React and TypeScript. Next.js allows the frontend and backend API routes to exist in the same project, reducing the need to maintain separate applications.

**LLM Integration**

I integrated two different API providers:

- GroqCloud using GPT-OSS 20B.
- Cerebras Inference using GPT-OSS 120B.

Both models receive the same user prompt. API requests run concurrently using `Promise.all()` to reduce the total response time.

The API keys are stored in environment variables and accessed only from the backend.

**Data Storage**

I used local JSON file storage to keep the initial implementation simple and avoid requiring a separate database installation.

The application stores comparisons, model responses, timestamps, and voting results on the server.

**Voting and Leaderboard**

Each comparison allows one recorded vote. Votes are associated with the visitor who created the comparison.

The leaderboard calculates model performance from stored votes rather than maintaining manually updated counters.

**User History**

I used an anonymous browser identifier stored in localStorage to associate comparisons with returning visitors.

This approach avoids the complexity of user registration while allowing users to view their previous comparisons and votes.

The identifier is not a secure authentication mechanism, so a production application would require stronger user identification and access controls.

## 3. Verification and Testing

I manually tested the application and verified the following functionality:

1. Submitted a prompt and received responses from both Groq and Cerebras.
2. Confirmed that both responses displayed side by side.
3. Submitted a vote and received confirmation that it was saved.
4. Verified that the leaderboard reflected the recorded vote.
5. Confirmed that previous prompts and votes appeared in the History section.
6. Closed and reopened the browser and verified that comparison history remained available.
7. Restarted the Next.js development server and confirmed that saved comparisons and votes persisted.
8. Executed `npm run build` successfully, confirming that the application compiled and passed TypeScript and linting checks.

These tests confirmed the core functionality of the local application. They do not replace comprehensive automated, load, or security testing.

## 4. Limitations and Future Improvements

Given additional development time, I would prioritize:

- **Hosted database:** Replace local JSON storage with PostgreSQL or another managed database for reliable persistence during deployment.
- **User authentication:** Implement secure accounts and user-specific comparison history.
- **Rate limiting:** Prevent excessive API usage and protect free API quotas.
- **Error handling:** Improve handling of provider failures, timeouts, and partial responses.
- **Automated testing:** Add integration and end-to-end tests for API requests, voting, and history.
- **Blind comparison:** Randomize model positioning and hide model identities until after voting to reduce evaluation bias.
- **Performance monitoring:** Track API response times and provider reliability.

## 5. Deployment Considerations

The application currently uses a local JSON file for persistence. This is appropriate for local development but is not reliable on Vercel's serverless infrastructure.

Before deploying a fully functional public version, the storage layer should be migrated to a hosted database.

The application also needs its API keys configured as server-side environment variables during deployment.