import React from "react";
import {
  X,
  GitPullRequest,
  GitPullRequestClosed,
  GitMerge,
  Github,
  ExternalLink,
  Calendar,
  Activity,
  Shield, // Import Shield icon
  Users, // Import Users icon
} from "lucide-react";
import type { UserStats } from "../types";
import { format } from "date-fns";

interface UserStatsModalProps {
  stats: UserStats;
  onClose: () => void;
}

export function UserStatsModal({ stats, onClose }: UserStatsModalProps) {
  const sortedRepos = Object.entries(stats.repositories).sort(
    ([, a], [, b]) => b.totalPRs - a.totalPRs
  );

  // Close when clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent border-b dark:border-gray-600 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={stats.avatarUrl}
                alt={stats.username}
                className="w-14 h-14 rounded-full ring-2 ring-white dark:ring-gray-600 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-100 dark:bg-blue-900 p-1 rounded-full border-2 border-white dark:border-gray-700">
                <Github className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.username}
                </h2>
                {stats.isMaintainer ? (
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
                <a
                  href={`https://github.com/${stats.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Contribution Statistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] dark:text-gray-300 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900 transition-colors duration-300 hover:shadow-md group">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {stats.totalStats.totalPRs}
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Total PRs
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900 transition-colors duration-300 hover:shadow-md group">
              <div className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {stats.totalStats.mergedPRs}
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Merged
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900 transition-colors duration-300 hover:shadow-md group">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.totalStats.openPRs}
                </span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                Open
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900 transition-colors duration-300 hover:shadow-md group">
              <div className="flex items-center gap-2">
                <GitPullRequestClosed className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {stats.totalStats.closedPRs}
                </span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Closed
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {sortedRepos.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No repository data available for the selected time period.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Contributions by Repository
                </h3>
                <div className="space-y-4">
                  {sortedRepos.map(([repo, stats]) => (
                    <div
                      key={repo}
                      className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <a
                          href={`https://github.com/${repo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span>{repo}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                        <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {stats.totalPRs} contributions
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                        <div className="flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {stats.totalPRs} PRs
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitMerge className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {stats.mergedPRs} merged
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {stats.openPRs} open
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitPullRequestClosed className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {stats.closedPRs} closed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Pull Requests
            </h3>
            <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Repository
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                  {stats.pullRequests.map((pr) => (
                    <tr
                      key={`${pr.repository_name}-${pr.number}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {pr.repository_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1 line-clamp-2"
                        >
                          <span>{pr.title}</span>
                          <ExternalLink className="w-3 h-3 inline-block ml-1 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pr.state === "open"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : pr.merged_at
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {pr.merged_at ? "merged" : pr.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(pr.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stats.pullRequests.length === 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/30 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No pull requests found in the selected time period.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
