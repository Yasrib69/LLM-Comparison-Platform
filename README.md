
# LLM Comparison Platform

A full-stack web application that allows users to compare responses from two different Large Language Models (LLMs), vote for the better response, and track model performance through a leaderboard and comparison history.

This project was developed as a technical assignment for Dr. Tian.

## Features

- Submit a text prompt to two different LLM providers.
- Display AI-generated responses side by side.
- Vote for the preferred response.
- Prevent duplicate votes for the same comparison.
- View a leaderboard showing model performance and win percentages.
- View previous comparisons and voting history.
- Preserve comparison history across browser sessions and server restarts.
- Store comparisons and votes in a cloud-hosted PostgreSQL database.

## Technology Stack

- Frontend: Next.js, React, TypeScript, CSS
- Backend: Next.js API Routes
- LLM Provider A: GroqCloud (GPT-OSS 20B)
- LLM Provider B: Cerebras Inference (GPT-OSS 120B)
- Database: Neon PostgreSQL
- Database Driver: @neondatabase/serverless
- Version Control: Git and GitHub
- Deployment Target: Vercel

## Prerequisites

Before running the application, you need:

- Node.js 20 or later
- npm
- A Groq API key
- A Cerebras API key
- A Neon PostgreSQL database and connection string

API providers:

- Groq: https://console.groq.com/keys
- Cerebras: https://cloud.cerebras.ai/
- Neon: https://console.neon.tech/

Groq and Cerebras provide free-tier API access, subject to account eligibility, model availability, and usage limits.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Yasrib69/LLM-Comparison-Platform.git
```

### 2. Navigate to the project directory

```bash
cd LLM-Comparison-Platform
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root using `.env.example` as a template.

Add the following configuration:

```env
GROQ_API_KEY=your_groq_api_key
CEREBRAS_API_KEY=your_cerebras_api_key

MODEL_A=openai/gpt-oss-20b
MODEL_B=gpt-oss-120b

DATABASE_URL=your_neon_postgresql_connection_string
```

Replace the placeholders with your actual API keys and Neon connection string.

Never commit `.env.local` or real credentials to GitHub.

## Database Setup

The application uses Neon PostgreSQL to store comparisons, model responses, votes, and timestamps.

### 1. Create a Neon project

Visit https://console.neon.tech/ and create a new PostgreSQL project.

### 2. Get the database connection string

Open the project's connection settings and copy the PostgreSQL connection string.

Add it to `DATABASE_URL` in `.env.local`.

### 3. Create the database table

Open the Neon SQL Editor and run the following SQL:

```sql
CREATE TABLE IF NOT EXISTS comparisons (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response_a TEXT NOT NULL,
    response_b TEXT NOT NULL,
    model_a TEXT NOT NULL,
    model_b TEXT NOT NULL,
    winner TEXT CHECK (
        winner IN ('A', 'B') OR winner IS NULL
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparisons_visitor
ON comparisons(visitor_id);

CREATE INDEX IF NOT EXISTS idx_comparisons_created
ON comparisons(created_at DESC);
```

The table stores each prompt, the two generated responses, model identifiers, the selected winner, and the comparison timestamp.

The indexes improve history retrieval and sorting performance.

## Running Locally

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

http://localhost:3000

## How to Use

1. Enter a text prompt.
2. Click **Compare Models**.
3. Wait for both Groq and Cerebras to generate responses.
4. View the responses side by side.
5. Vote for the model that provided the better answer.
6. Open the **Leaderboard** section to view voting statistics.
7. Open **History** to review previous comparisons and voting results.

Each comparison permits one recorded vote.

## API Endpoints

The backend exposes three API routes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/compare` | POST | Generate and save two LLM responses |
| `/api/vote` | POST | Save a vote for a comparison |
| `/api/data` | GET | Retrieve comparison history and leaderboard statistics |

The frontend communicates with these endpoints rather than calling the LLM providers directly.

API keys remain on the server.

## Architecture

The application uses a single Next.js project containing both the frontend and backend.

### LLM Integration

When a user submits a prompt, the backend sends requests to Groq and Cerebras concurrently using `Promise.all()`.

Both providers process the same prompt and return generated responses.

After both responses are received, the backend saves the comparison to Neon PostgreSQL.

### Database

The application uses Neon PostgreSQL for persistent storage.

The backend communicates with Neon using the `@neondatabase/serverless` package.

The database stores prompts, generated responses, model identifiers, timestamps, visitor identifiers, and recorded votes.

### Voting and Leaderboard

Votes are saved using an atomic PostgreSQL update that prevents a second vote from being recorded for the same comparison.

The leaderboard calculates each model's wins and win percentage from recorded votes.

### User History

The application uses an anonymous browser identifier stored in localStorage to associate comparisons with returning visitors.

This allows users to review their previous comparisons without creating accounts.

The browser identifier is not a secure authentication mechanism.

## Testing and Verification

The following tests were completed manually:

1. Submitted prompts and received responses from both Groq and Cerebras.
2. Verified that both responses displayed side by side.
3. Submitted a vote and confirmed that the application recorded it.
4. Verified the saved comparison directly in Neon PostgreSQL.
5. Verified that the database's `winner` column updated after voting.
6. Confirmed that the leaderboard displayed the correct voting statistics.
7. Confirmed that previous comparisons and votes appeared in History.
8. Verified browser-session persistence and local server restart persistence.
9. Executed `npm run build` successfully, including TypeScript validation and linting.

These tests confirm the application's core local functionality with Neon PostgreSQL. Comprehensive automated and security testing have not been completed.

## Production Build

To create a production build locally, run:

```bash
npm run build
```

To start the production server after building:

```bash
npm run start
```

## Deployment

The application is designed to be deployable through Vercel.

Deployment requires:

1. Importing the GitHub repository into Vercel.
2. Configuring the environment variables:
   - `GROQ_API_KEY`
   - `CEREBRAS_API_KEY`
   - `MODEL_A`
   - `MODEL_B`
   - `DATABASE_URL`
3. Ensuring the Neon PostgreSQL database schema has been created.
4. Deploying the application.
5. Testing the public application to verify both LLM integrations, voting, leaderboard, and history.

A public Vercel deployment has not yet been verified.

## Limitations and Future Improvements

The application currently uses anonymous browser identifiers instead of user accounts.

Potential improvements include:

- Implementing secure user authentication.
- Adding API rate limiting to prevent excessive usage.
- Improving handling of provider failures and timeouts.
- Adding automated integration and end-to-end tests.
- Randomizing model positions to reduce voting bias.
- Hiding model identities until after voting.
- Adding monitoring and API response-time measurements.
- Strengthening data privacy and access controls.

The current implementation is intended as a functional technical-assignment prototype rather than a production-hardened public service.

## Design Notes

See [DESIGN_NOTES.md](DESIGN_NOTES.md) for details about the development approach, architectural decisions, verification, and future improvements.
