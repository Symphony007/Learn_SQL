# QueryLab

QueryLab is an interactive, browser-based SQL learning platform designed for software engineers and data professionals. It features a fully client-side SQL execution environment using WebAssembly (sql.js), allowing users to practice against real databases with instant feedback and no server latency.

## Features

- **Live SQL Execution**: Run real queries in the browser instantly with sql.js.
- **Structured Curriculum**: A 34-topic roadmap guiding learners from basic `SELECT` statements to advanced analytical window functions and recursive CTEs.
- **Premium Developer Aesthetic**: A polished UI inspired by top-tier developer tools, with full support for Light and Dark modes.
- **Syntax Highlighting**: Custom Monaco editor integration with real-time SQL syntax validation and autocomplete.
- **Progress Tracking**: Seamless integration with Supabase to track solved exercises and preserve your learning state across devices.

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **SQL Engine**: [sql.js](https://sql.js.org/) (SQLite compiled to WebAssembly)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Auth & Database**: [Supabase](https://supabase.com/)

## Getting Started

First, ensure you have set up your `.env.local` with the required Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Content Management

The curriculum content is completely detached from the application logic. All topics, theory, schemas, and questions are stored as JSON files within the `content/topics/` directory.

To add a new topic or exercise:
1. Create or modify a JSON file in `content/topics/`.
2. Adhere to the `Topic` schema (defined in `src/lib/types.ts`).
3. The platform will automatically load and render the new content.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
