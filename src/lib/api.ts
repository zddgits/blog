const API_BASE = '/api';

export interface Post {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  tags: string[];
}

export interface CreatePostRequest {
  title: string;
  description: string;
  content: string;
  date: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  content?: string;
  date?: string;
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  posts?: Post[];
  post?: Post;
  token?: string;
}

function getToken(): string | null {
  return localStorage.getItem('blog_token');
}

function setToken(token: string): void {
  localStorage.setItem('blog_token', token);
}

function clearToken(): void {
  localStorage.removeItem('blog_token');
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function logout(): void {
  clearToken();
}

export async function getPosts(): Promise<Post[]> {
  const token = getToken();
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success && data.posts) {
      return data.posts.map((post: any) => ({
        ...post,
        tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/posts/${slug}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success && data.post) {
      return {
        ...data.post,
        tags: typeof data.post.tags === 'string' ? JSON.parse(data.post.tags) : data.post.tags,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createPost(post: CreatePostRequest): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });

    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function updatePost(slug: string, post: UpdatePostRequest): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });

    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function deletePost(slug: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/posts/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function initDatabase(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
