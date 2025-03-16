import { Octokit } from 'octokit';
import { subDays, parseISO, isAfter } from 'date-fns';
import type { ContributorStats, PullRequest, RepoStats, UserStats, TimeFilter } from '../types';
import { getGitHubToken } from './env';

// Add simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Helper to get cached data or fetch new data
const getCachedOrFetch = async <T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const now = Date.now();
  const cachedItem = cache[key];
  
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data as T;
  }
  
  const data = await fetchFn();
  cache[key] = { data, timestamp: now };
  return data;
};

// Cache for maintainer data to avoid repeated API calls
const maintainerCache: Record<string, { usernames: Set<string>; timestamp: number }> = {};
const MAINTAINER_CACHE_TTL = 60 * 60 * 1000; // 1 hour cache for maintainer status

export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    
    const [, owner, repo] = urlObj.pathname.split('/');
    if (!owner || !repo) return null;
    
    return { owner, repo: repo.replace('.git', '') };
  } catch {
    return null;
  }
};

const getTimeFilterDate = (filter: TimeFilter): Date => {
  const now = new Date();
  switch (filter) {
    case '2w':
      return subDays(now, 14);
    case '1m':
      return subDays(now, 30);
    case '3m':
      return subDays(now, 90);
    case '6m':
      return subDays(now, 180);
    default:
      return new Date(0); // Beginning of time
  }
};

// Improved maintainer detection with optimized caching strategy
async function fetchMaintainers(octokit: Octokit, owner: string, repo: string): Promise<Set<string>> {
  const cacheKey = `maintainers_${owner}_${repo}`;
  const now = Date.now();
  const cachedItem = maintainerCache[cacheKey];
  
  if (cachedItem && now - cachedItem.timestamp < MAINTAINER_CACHE_TTL) {
    console.log(`Using cached maintainers for ${owner}/${repo}: ${cachedItem.usernames.size} maintainers`);
    return cachedItem.usernames;
  }
  
  try {
    setLoadingProgress?.("Fetching collaborators...");
    // Use explicit 'all' permission parameter to ensure we get everyone with push access
    const { data: collaborators } = await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
      owner,
      repo,
      affiliation: 'all',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    // Create set of maintainers (users with push or admin access)
    const maintainers = new Set(
      collaborators
        .filter((collab: any) => 
          collab.permissions?.push === true || 
          collab.permissions?.admin === true)
        .map((collab: any) => collab.login)
    );
    
    maintainerCache[cacheKey] = { usernames: maintainers, timestamp: now };
    console.log(`Found ${maintainers.size} maintainers for ${owner}/${repo}: ${[...maintainers].join(', ')}`);
    return maintainers;
  } catch (error) {
    console.warn(`Could not fetch collaborators for ${owner}/${repo}:`, error);
    return new Set(); // Return empty set as fallback
  }
}

// Global repository maintainers map to avoid duplicate API calls
const repoMaintainersMap: Map<string, Promise<Set<string>>> = new Map();

// Optimized function to get maintainers with deduplication of in-flight requests
async function getMaintainers(octokit: Octokit, owner: string, repo: string): Promise<Set<string>> {
  const key = `${owner}/${repo}`;
  
  // If we already have a request in flight for this repository, reuse it
  if (!repoMaintainersMap.has(key)) {
    const promise = fetchMaintainers(octokit, owner, repo);
    repoMaintainersMap.set(key, promise);
    
    // Clean up the map after the request is complete
    promise.finally(() => {
      setTimeout(() => repoMaintainersMap.delete(key), 5000); // Remove after 5 seconds
    });
  }
  
  return repoMaintainersMap.get(key) as Promise<Set<string>>;
}

// Modified function to create Octokit instance with token if available
function createOctokit(): Octokit {
  const token = getGitHubToken();
  if (token) {
    return new Octokit({ auth: token });
  }
  return new Octokit();
}

export const fetchRepoStats = async (repoUrl: string, timeFilter: TimeFilter): Promise<RepoStats> => {
  const repoInfo = parseGitHubUrl(repoUrl);
  if (!repoInfo) throw new Error('Invalid GitHub repository URL');

  const cacheKey = `repo_${repoInfo.owner}_${repoInfo.repo}_${timeFilter}`;
  return getCachedOrFetch(cacheKey, async () => {
    // Use our new createOctokit function to get an authenticated instance
    const octokit = createOctokit();
    const filterDate = getTimeFilterDate(timeFilter);
    
    // Use optimized maintainer fetching
    setLoadingProgress?.("Fetching repository information...");
    let maintainers: Set<string>;
    try {
      maintainers = await getMaintainers(octokit, repoInfo.owner, repoInfo.repo);
    } catch (error) {
      console.error("Failed to fetch maintainers:", error);
      maintainers = new Set();
    }
    
    // Add API rate limit checks
    setLoadingProgress?.("Fetching pull requests...");
    const pullRequests: PullRequest[] = [];
    let page = 1;
    let hasMore = true;
    const MAX_PAGES = 5; // Limit to first 500 PRs (5 pages with 100 PRs each)

    try {
      while (hasMore && page <= MAX_PAGES) {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          state: 'all',
          per_page: 100,
          page,
          sort: 'created',
          direction: 'desc',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        if (data.length === 0) {
          hasMore = false;
          break;
        }

        const filteredPRs = data.filter(pr => 
          isAfter(parseISO(pr.created_at), filterDate)
        );

        if (filteredPRs.length < data.length) {
          hasMore = false;
        }

        // Improved PR mapping with stronger type checking
        const mappedPRs = filteredPRs.map(pr => {
          // Ensure all fields are properly extracted
          return {
            number: pr.number,
            title: pr.title || `Pull Request #${pr.number}`, // Provide fallback for missing title
            state: pr.state || 'unknown',
            created_at: pr.created_at,
            merged_at: pr.merged_at || null, // Ensure null for unmerged PRs
            html_url: pr.html_url || '',
            repository_url: pr.base?.repo?.url || pr.repository_url || '',
            repository_name: `${repoInfo.owner}/${repoInfo.repo}`,
            user: {
              login: pr.user?.login || 'unknown-user',
              avatar_url: pr.user?.avatar_url || 'https://github.com/identicons/placeholder.png'
            }
          };
        });

        pullRequests.push(...mappedPRs);
        page++;
        setLoadingProgress?.(`Fetched page ${page-1} of pull requests...`);
      }
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      // Continue with whatever we've fetched so far
    }

    setLoadingProgress?.("Processing contributor data...");
    const contributorMap = new Map<string, ContributorStats>();

    // Process PRs more efficiently
    pullRequests.forEach((pr) => {
      const username = pr.user.login;
      const isMaintainer = maintainers.has(username);
      
      const current = contributorMap.get(username) || {
        username,
        avatarUrl: pr.user.avatar_url,
        totalPRs: 0,
        mergedPRs: 0,
        openPRs: 0,
        closedPRs: 0,
        isMaintainer // Set directly from maintainers set
      };
      
      // Update stats
      current.totalPRs++;
      if (pr.merged_at) {
        current.mergedPRs++;
      } else if (pr.state === "open") {
        current.openPRs++;
      } else {
        current.closedPRs++;
      }

      contributorMap.set(username, current);
    });

    // Use a more direct approach when creating the contributors array
    const contributors = Array.from(contributorMap.values())
      .sort((a, b) => b.totalPRs - a.totalPRs);
    
    // Log maintainer status to help debug
    for (const contributor of contributors) {
      if (maintainers.has(contributor.username)) {
        console.log(`✅ ${contributor.username} IS a maintainer`);
      } else {
        console.log(`❌ ${contributor.username} is NOT a maintainer`);
      }
    }

    return {
      totalPRs: pullRequests.length,
      contributors,
      recentPRs: pullRequests
    };
  });
};

// Create a utility to update loading progress
let setLoadingProgress: ((message: string) => void) | undefined;
export const registerLoadingHandler = (handler: (message: string) => void) => {
  setLoadingProgress = handler;
};

export const fetchUserStats = async (username: string, timeFilter: TimeFilter): Promise<UserStats> => {
  const cacheKey = `user_${username}_${timeFilter}`;
  return getCachedOrFetch(cacheKey, async () => {
    // Use our new createOctokit function to get an authenticated instance
    const octokit = createOctokit();
    const filterDate = getTimeFilterDate(timeFilter);

    setLoadingProgress?.(`Fetching user data for ${username}...`);
    const { data: userData } = await octokit.request('GET /users/{username}', {
      username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    const pullRequests: PullRequest[] = [];
    let page = 1;
    let hasMore = true;
    const MAX_PAGES = 3; // Limit to 300 PRs to improve performance

    // Fetch pull requests
    setLoadingProgress?.(`Fetching ${username}'s pull requests...`);
    try {
      while (hasMore && page <= MAX_PAGES) {
        const { data } = await octokit.request('GET /search/issues', {
          q: `author:${username} is:pr`,
          per_page: 100,
          page,
          sort: 'created',
          order: 'desc',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        if (!data.items || data.items.length === 0) {
          hasMore = false;
          break;
        }

        const filteredPRs = data.items.filter((pr: any) => 
          isAfter(parseISO(pr.created_at), filterDate)
        );

        if (filteredPRs.length < data.items.length) {
          hasMore = false;
        }

        pullRequests.push(...filteredPRs.map((pr: any) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          created_at: pr.created_at,
          merged_at: pr.pull_request?.merged_at || null,
          html_url: pr.html_url,
          repository_url: pr.repository_url,
          repository_name: pr.repository_url.split('/repos/')[1],
          user: {
            login: username,
            avatar_url: userData.avatar_url
          }
        })));

        page++;
        setLoadingProgress?.(`Fetched page ${page-1} of pull requests...`);
      }
    } catch (error) {
      console.error("Error fetching user pull requests:", error);
      // Continue with whatever we've fetched so far
    }

    setLoadingProgress?.(`Processing repositories for ${username}...`);
    const repositories: { [key: string]: any } = {};
    const totalStats = {
      totalPRs: 0,
      mergedPRs: 0,
      openPRs: 0,
      closedPRs: 0
    };

    // Process pull requests
    pullRequests.forEach((pr) => {
      const repoName = pr.repository_name!;
      if (!repositories[repoName]) {
        repositories[repoName] = {
          totalPRs: 0,
          mergedPRs: 0,
          openPRs: 0,
          closedPRs: 0
        };
      }

      repositories[repoName].totalPRs++;
      totalStats.totalPRs++;

      if (pr.merged_at) {
        repositories[repoName].mergedPRs++;
        totalStats.mergedPRs++;
      } else if (pr.state === "open") {
        repositories[repoName].openPRs++;
        totalStats.openPRs++;
      } else {
        repositories[repoName].closedPRs++;
        totalStats.closedPRs++;
      }
    });

    // Only check maintainer status for repositories with the most contributions
    // to avoid excessive API calls
    let isMaintainer = false;
    const repoEntries = Object.entries(repositories)
      .sort(([, a], [, b]) => b.totalPRs - a.totalPRs)
      .slice(0, 3); // Top 3 repos
    
    setLoadingProgress?.(`Checking maintainer status...`);
    
    // Use Promise.all instead of Promise.any for better performance
    if (repoEntries.length > 0) {
      const checkResults = await Promise.all(
        repoEntries.map(async ([repoName]) => {
          try {
            const [owner, repo] = repoName.split('/');
            if (!owner || !repo) return false;
            
            const maintainers = await getMaintainers(octokit, owner, repo);
            const isMaintainerForRepo = maintainers.has(username);
            
            console.log(`${username} maintainer status for ${repoName}: ${isMaintainerForRepo}`);
            return isMaintainerForRepo;
          } catch (e) {
            return false;
          }
        })
      );
      
      // If any check returns true, the user is a maintainer
      isMaintainer = checkResults.some(Boolean);
    }
    
    console.log(`Final maintainer status for ${username}: ${isMaintainer}`);

    return {
      username,
      avatarUrl: userData.avatar_url,
      repositories,
      pullRequests,
      totalStats,
      isMaintainer
    };
  });
};