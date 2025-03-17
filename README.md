# GSoC Spy - Track your GSoC Competition 🌟

## Overview
GSoC Spy is an open-source web application designed to analyze GitHub repository contributions and track pull request activity. It helps identify active contributors in open-source projects, making it especially useful for Google Summer of Code (GSoC) mentors, organization administrators, and participants who want to assess engagement levels in various repositories.

~ [Live link](https://gsoc-spy.vercel.app/)

## Features

### 1. GitHub Repository Analysis
- Enter any GitHub repository URL to fetch and analyze pull requests.
- Filter contributions by different time periods: **2 weeks, 1 month, 3 months, 6 months, or all time**.
- Handles pagination for repositories with many PRs (up to **500 PRs across 5 pages**).

### 2. Contributor Insights
- Identify and distinguish between **project maintainers** and **regular contributors**.
- View detailed statistics for each contributor:
  - Total number of PRs
  - Number of merged PRs
  - Number of open PRs
  - Number of closed PRs
- Sort contributors based on their **activity level**.

### 3. Pull Request Tracking
- View a **detailed list of recent PRs** in a repository.
- See **PR status** (open, merged, closed).
- Filter PRs by selected **time periods**.
- Access **direct links** to PRs on GitHub.

### 4. User Statistics
- Click on any contributor to see **detailed contribution stats**.
- View repository-specific **contribution metrics** for each user.
- See all **recent PRs created by a specific user**.
- Analyze the **distribution of PRs across different repositories**.

### 5. API Token Management
- Option to add a **GitHub Personal Access Token** to increase API rate limits (**from 60 to 5,000 requests/hour**).
- Tokens are **stored locally** for security (never sent to any server).
- **Notification system** for users without tokens, encouraging them to add one for better performance.

### 6. Performance Optimizations
- **In-memory caching system** to reduce redundant API calls.
- **Maintainer status caching** (1-hour TTL).
- **General data caching** (5-minute TTL).
- **Deduplication** of in-flight requests to avoid unnecessary API requests.
- **Request limiting** to prevent excessive API usage.

### 7. User Interface Features
- **Dark/light mode toggle** with persistent user preference.
- **Responsive design** that works across all screen sizes.
- **Loading indicators** with progress messages for long operations.
- **Error handling** with clear, user-friendly messages.
- **Collapsible sections** for better organization of information.

### 8. Special Functionality
- **Detection of repository maintainers** by checking for push/admin permissions.
- **User status tracking** across multiple repositories.
- **Repository ranking** for individual contributors.
- **Graceful handling of API rate limits** to prevent service interruptions.
- **Fallback mechanisms** for when GitHub data can't be fetched.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS.
- **API Integration**: Octokit (GitHub API).
- **Utilities**: date-fns (for date manipulation and filtering).
- **Performance Enhancements**:
  - Custom caching layer for efficiency.
  - Persistent storage for user preferences and tokens.
  - Component-based architecture with a clean separation of concerns.

## Getting Started

### Prerequisites
- Node.js (>=16.x recommended)
- GitHub Personal Access Token (optional but recommended for higher API limits)

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/gsoc-spy.git
cd gsoc-spy

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000/`.

### Running in Production
To build and run the app in production mode:
```bash
npm run build
npm start
```

## Contributing
We welcome contributions! There are **good first issues** available for beginners who want to contribute. Here’s how you can get started:

1. **Fork the repository** and create a new branch.
2. **Pick an issue** from the [Issues tab](https://github.com/JigyasuRajput/gsoc-spy/issues).
3. **Implement the changes** and submit a pull request.
4. **Wait for review and feedback!**


## Contact
If you have any questions, feel free to open an issue or reach out:
- **GitHub**: [JigyasuRajput](https://github.com/JigyasuRajput)
- **Email**: jigyasu2021@gmail.com
- **LinkedIn**: [jigyasu_rajput](https://www.linkedin.com/in/jigyasu-rajput-218657284/)

