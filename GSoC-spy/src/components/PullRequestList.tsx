import React from "react";
import { format } from "date-fns";
import { ExternalLink, Shield, Users } from "lucide-react";
import type { PullRequest } from "../types";

interface PullRequestListProps {
  pullRequests: PullRequest[];
  onUserClick: (username: string) => void;
  maintainers: Set<string>;
}

const PullRequestList = ({
  pullRequests,
  onUserClick,
  maintainers,
}: PullRequestListProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-700/80 transition-colors duration-300">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
          {pullRequests.map((pr) => (
            <tr
              key={`${pr.repository_name}-${pr.number}`}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onUserClick(pr.user.login)}
                  className="flex items-center gap-2 group text-left"
                >
                  <img
                    src={pr.user.avatar_url}
                    alt={pr.user.login}
                    className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 group-hover:ring-blue-500 transition-all duration-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {pr.user.login}
                    </span>
                    {/* Use Boolean() to ensure we cast potentially undefined values to boolean */}
                    {Boolean(maintainers.has(pr.user.login)) ? (
                      <span className="block ml-0.5 text-xs text-purple-700 dark:text-purple-400 flex items-center">
                        <Shield className="inline-block w-3 h-3 mr-0.5" />
                        Maintainer
                      </span>
                    ) : (
                      <span className="block ml-0.5 text-xs text-blue-700 dark:text-blue-400 flex items-center">
                        <Users className="inline-block w-3 h-3 mr-0.5" />
                        Contributor
                      </span>
                    )}
                  </div>
                </button>
              </td>
              <td className="px-6 py-4">
                <a
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center line-clamp-2"
                >
                  <span>{pr.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 inline-block ml-1 flex-shrink-0" />
                </a>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                  {pr.repository_name} #{pr.number}
                </span>
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
      {pullRequests.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No pull requests found in the selected time period.
          </p>
        </div>
      )}
    </div>
  );
};

export default PullRequestList;
