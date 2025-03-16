// Simple utility to manage environment variables and sensitive tokens

// Token storage key in localStorage
const TOKEN_STORAGE_KEY = 'github_pat';

/**
 * Get the GitHub token from localStorage if available
 */
export function getGitHubToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Save GitHub token to localStorage
 */
export function saveGitHubToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Remove GitHub token from localStorage
 */
export function removeGitHubToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Check if a GitHub token exists
 */
export function hasGitHubToken(): boolean {
  return Boolean(getGitHubToken());
}
