const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface PostFile {
  name: string;
  path: string;
  sha: string;
  content?: string;
}

function getConfig(): GitHubConfig {
  const owner = localStorage.getItem('github_owner') || '';
  const repo = localStorage.getItem('github_repo') || '';
  const token = localStorage.getItem('github_token') || '';
  const branch = localStorage.getItem('github_branch') || 'main';
  
  return { owner, repo, token, branch };
}

function saveConfig(config: Partial<GitHubConfig>) {
  if (config.owner) localStorage.setItem('github_owner', config.owner);
  if (config.repo) localStorage.setItem('github_repo', config.repo);
  if (config.token) localStorage.setItem('github_token', config.token);
  if (config.branch) localStorage.setItem('github_branch', config.branch);
}

export async function verifyGitHubConfig(): Promise<boolean> {
  const config = getConfig();
  if (!config.owner || !config.repo || !config.token) {
    return false;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchPosts(): Promise<PostFile[]> {
  const config = getConfig();
  
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/posts?ref=${config.branch}`,
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch posts');
    }

    const files = await response.json();
    return files.filter((file: PostFile) => file.name.endsWith('.md'));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function fetchPostContent(path: string): Promise<{ content: string; sha: string }> {
  const config = getConfig();
  
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
    {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch post content');
  }

  const data = await response.json();
  const content = atob(data.content);
  return { content, sha: data.sha };
}

export async function savePost(
  filename: string,
  frontmatter: { title: string; description: string; date: string; tags?: string[] },
  content: string
): Promise<void> {
  const config = getConfig();
  
  const existingFiles = await fetchPosts();
  const existingFile = existingFiles.find(f => f.name === filename);
  
  const slug = filename.replace('.md', '');
  let frontmatterStr = `---
title: "${frontmatter.title}"
date: ${frontmatter.date}
description: "${frontmatter.description}"
`;
  if (frontmatter.tags && frontmatter.tags.length > 0) {
    frontmatterStr += `tags: [${frontmatter.tags.map(t => `"${t}"`).join(', ')}]
`;
  }
  frontmatterStr += `---

`;
  
  const fullContent = frontmatterStr + content;
  const encodedContent = btoa(unescape(encodeURIComponent(fullContent)));
  
  const body: any = {
    message: `Update post: ${frontmatter.title}`,
    content: encodedContent,
    branch: config.branch,
  };
  
  if (existingFile) {
    body.sha = existingFile.sha;
  }
  
  const path = `posts/${filename}`;
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save post');
  }
}

export async function deletePost(filename: string): Promise<void> {
  const config = getConfig();
  
  const existingFiles = await fetchPosts();
  const existingFile = existingFiles.find(f => f.name === filename);
  
  if (!existingFile) {
    throw new Error('File not found');
  }
  
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/posts/${filename}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Delete post: ${filename}`,
        sha: existingFile.sha,
        branch: config.branch,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete post');
  }
}

export function setGitHubConfig(config: Partial<GitHubConfig>) {
  saveConfig(config);
}

export function clearGitHubConfig() {
  localStorage.removeItem('github_owner');
  localStorage.removeItem('github_repo');
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_branch');
}

export { getConfig };
