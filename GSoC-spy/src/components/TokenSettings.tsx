import React, { useState } from "react";
import { KeyRound, Shield, Check, X, Info } from "lucide-react";
import {
  saveGitHubToken,
  removeGitHubToken,
  hasGitHubToken,
} from "../utils/env";

interface TokenSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSaved?: () => void;
}

export function TokenSettings({
  isOpen,
  onClose,
  onTokenSaved,
}: TokenSettingsProps) {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(hasGitHubToken());

  const saveToken = () => {
    if (!token.trim()) {
      setError("Please enter a valid token");
      return;
    }

    try {
      saveGitHubToken(token);
      setSaved(true);
      setHasToken(true);
      setError("");

      // Call the callback if provided
      if (onTokenSaved) {
        onTokenSaved();
      }

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError("Failed to save token");
    }
  };

  const deleteToken = () => {
    removeGitHubToken();
    setToken("");
    setHasToken(false);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            GitHub Access Token
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            Add your GitHub Personal Access Token to increase API rate limits
            from 60 to 5,000 requests per hour. Your token is stored locally on
            your device and never sent to any server.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300 mb-4">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Create a token at{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                github.com/settings/tokens
              </a>{" "}
              with public repo access.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Personal Access Token
            </label>
            <div className="relative">
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setSaved(false);
                  setError("");
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                className="block w-full px-4 py-2.5 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
              {hasToken && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {saved && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Token saved successfully!
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {hasToken && (
              <button
                type="button"
                onClick={deleteToken}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Remove Token
              </button>
            )}
            <button
              type="button"
              onClick={saveToken}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Save Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
