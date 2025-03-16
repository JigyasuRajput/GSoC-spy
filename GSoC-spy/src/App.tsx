import React, { useState, useEffect } from "react";
import {
  Github,
  GitPullRequest,
  GitPullRequestClosed,
  GitMerge,
  Loader2,
  Users,
  MoonStar,
  Sun,
  RefreshCw,
  ArrowRight,
  Search,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Shield,
  Star, // Star icon for the button
  KeyRound,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import {
  fetchRepoStats,
  fetchUserStats,
  registerLoadingHandler,
} from "./utils/github";
import type { RepoStats, UserStats, TimeFilter } from "./types";
import { format } from "date-fns";
import { UserStatsModal } from "./components/UserStatsModal";
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import PullRequestList from "./components/PullRequestList";
import { TokenSettings } from "./components/TokenSettings";
import { hasGitHubToken } from "./utils/env";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1m");
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showPRs, setShowPRs] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference first
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // Otherwise default to true (dark mode)
    return true;
  });
  const [loadingProgress, setLoadingProgress] = useState("");
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [showTokenNotification, setShowTokenNotification] = useState(false);

  useEffect(() => {
    // Register loading progress handler
    registerLoadingHandler(setLoadingProgress);

    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Check for GitHub token
    const hasExistingToken = hasGitHubToken();
    setHasToken(hasExistingToken);

    // Show notification for users without a token
    const hasSeenNotification = localStorage.getItem("token_notification_seen");
    if (!hasExistingToken && !hasSeenNotification) {
      setShowTokenNotification(true);
    }
  }, [darkMode]); // Note: this dependency is fine as registerLoadingHandler only needs to be called once

  // Add an effect to update the token status when window gets focus
  // This ensures the UI updates if the token is added in another tab
  useEffect(() => {
    const checkTokenOnFocus = () => {
      const tokenExists = hasGitHubToken();
      setHasToken(tokenExists);
    };

    window.addEventListener("focus", checkTokenOnFocus);
    return () => {
      window.removeEventListener("focus", checkTokenOnFocus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStats(null);
    setShowPRs(false);
    setLoadingProgress("Fetching repository data...");

    try {
      const data = await fetchRepoStats(repoUrl, timeFilter);
      setStats(data);
      setLoadingProgress("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch repository statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (username: string) => {
    setLoadingUser(true);
    setLoadingProgress(`Loading details for ${username}...`);
    try {
      const userStats = await fetchUserStats(username, timeFilter);
      setSelectedUser(userStats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user statistics"
      );
    } finally {
      setLoadingUser(false);
      setLoadingProgress("");
    }
  };

  const togglePRs = () => {
    setShowPRs(!showPRs);
  };

  const dismissTokenNotification = () => {
    setShowTokenNotification(false);
    localStorage.setItem("token_notification_seen", "true");
  };

  const openTokenSettings = () => {
    setShowTokenSettings(true);
    setShowTokenNotification(false);
    localStorage.setItem("token_notification_seen", "true");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {showTokenNotification && (
        <div className="fixed bottom-4 right-4 max-w-md z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                  Increase API Rate Limits
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add your GitHub Personal Access Token to raise the API limit
                  from 60 to 5,000 requests per hour.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={openTokenSettings}
                    className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Add Token
                  </button>
                  <button
                    onClick={dismissTokenNotification}
                    className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={dismissTokenNotification}
                className="flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTokenSettings(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors duration-300 ${
                hasToken
                  ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {hasToken ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium hidden xs:inline">
                    API Token Added
                  </span>
                  <span className="text-sm font-medium xs:hidden">Token</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span className="text-sm font-medium hidden xs:inline">
                    Add API Token
                  </span>
                  <span className="text-sm font-medium xs:hidden">Token</span>
                </>
              )}
            </button>

            <a
              href="https://github.com/JigyasuRajput/GSoC-spy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-3 py-1.5 rounded-md transition-all duration-300 hover:shadow-md"
            >
              <Star className="w-4 h-4 fill-white" />
              <span className="text-sm font-medium hidden xs:inline">
                Star on GitHub
              </span>
              <span className="text-sm font-medium xs:hidden">Star</span>
            </a>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonStar className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-3">
            GSoC Spy
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Analyze GitHub repository contributions to discover active GSoC
            participants and track their pull request activity across projects.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10 transition-colors duration-300 border border-gray-100 dark:border-gray-700 hover:shadow-lg"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="repoUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Repository URL or Path
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="repoUrl"
                  type="text" // Changed from url to text to accept all formats
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="github.com/owner/repo"
                  className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors duration-300 text-ellipsis"
                  required
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label
                htmlFor="timeFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Time Period
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BarChart2
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <select
                  id="timeFilter"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  className="block w-full rounded-md border-0 py-3 pl-10 pr-10 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors duration-300 appearance-none"
                >
                  <option value="2w">2 Weeks</option>
                  <option value="1m">1 Month</option>
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="all">All Time</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <span>Get Statistics</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8 rounded-md animate-fadeIn transition-colors duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10 animate-pulse border border-gray-100 dark:border-gray-700 transition-colors duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-gray-700 dark:text-gray-300">
                {loadingProgress || "Loading..."}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This may take a moment for large repositories
              </p>
            </div>
          </div>
        )}

        {loadingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3 shadow-xl transition-colors duration-300">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-gray-700 dark:text-gray-200">
                Loading user statistics...
              </p>
            </div>
          </div>
        )}

        {selectedUser && (
          <UserStatsModal
            stats={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        {stats && (
          <div className="space-y-10 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300 hover:shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Contributors
                  </h2>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/70 px-3 py-1.5 rounded-full">
                  Total contributors:{" "}
                  <span className="font-semibold">
                    {stats.contributors.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.contributors.map((contributor) => (
                  <button
                    key={contributor.username}
                    onClick={() => handleUserClick(contributor.username)}
                    className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-left border border-gray-100 dark:border-gray-700 group hover:shadow-md"
                  >
                    <div className="relative">
                      <img
                        src={contributor.avatarUrl}
                        alt={contributor.username}
                        className="w-14 h-14 rounded-full ring-2 ring-white dark:ring-gray-800 group-hover:ring-blue-500 transition-all duration-300"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
                        <Github className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {contributor.username}
                        </h3>
                        {/* Force boolean evaluation to ensure deterministic rendering */}
                        {Boolean(contributor.isMaintainer) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Maintainer
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Users className="w-3 h-3 mr-1" />
                            Contributor
                          </span>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {contributor.totalPRs} PRs
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitMerge className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {contributor.mergedPRs} merged
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4 text-yellow-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {contributor.openPRs} open
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitPullRequestClosed className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {contributor.closedPRs} closed
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 hover:shadow-lg">
              <button
                onClick={togglePRs}
                className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-b dark:border-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Recent Pull Requests
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Showing PRs from selected time period
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm bg-white dark:bg-gray-700 px-3 py-1.5 rounded-full shadow-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{stats.totalPRs}</span>{" "}
                      pull requests
                    </div>
                    {showPRs ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {showPRs && (
                <PullRequestList
                  pullRequests={stats.recentPRs}
                  onUserClick={handleUserClick}
                  maintainers={
                    new Set(
                      stats.contributors
                        .filter((c) => Boolean(c.isMaintainer))
                        .map((c) => c.username)
                    )
                  }
                />
              )}
            </div>
          </div>
        )}

        {!stats && !loading && !error && (
          <div className="mt-16 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              No data to display
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter a GitHub repository URL and select a time period to analyze
              contributions and pull requests.
            </p>
          </div>
        )}
      </main>

      <TokenSettings
        isOpen={showTokenSettings}
        onClose={() => setShowTokenSettings(false)}
        onTokenSaved={() => {
          setHasToken(true);
          setShowTokenNotification(false);
        }}
      />

      <Footer />
    </div>
  );
}

export default App;
