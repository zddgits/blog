export interface Env {
  DB: D1Database;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface CreatePostRequest {
  title: string;
  description: string;
  content: string;
  date: string;
  tags?: string[];
}

interface UpdatePostRequest {
  title?: string;
  description?: string;
  content?: string;
  date?: string;
  tags?: string[];
}

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .trim();
}

function generateToken(username: string, secret: string): string {
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7
  };
  return btoa(JSON.stringify(payload)) + '.' + btoa(secret.slice(0, 16));
}

function verifyToken(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const payload = JSON.parse(atob(parts[0]));
    const signature = parts[1];
    const expectedSignature = btoa(secret.slice(0, 16));
    return signature === expectedSignature && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/api/login' && method === 'POST') {
      try {
        const body = await request.json();
        const { username, password } = body;
        
        if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
          const token = generateToken(username, env.JWT_SECRET);
          return new Response(JSON.stringify({ success: true, token }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ success: false, message: 'Bad request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice(7);
    if (!verifyToken(token, env.JWT_SECRET)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (path === '/api/posts' && method === 'GET') {
      try {
        const result = await env.DB.prepare(
          'SELECT id, slug, title, description, date, tags FROM posts ORDER BY date DESC'
        ).all();
        
        return new Response(JSON.stringify({ success: true, posts: result.results }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/api/posts' && method === 'POST') {
      try {
        const body: CreatePostRequest = await request.json();
        const slug = generateSlug(body.title);
        
        const result = await env.DB.prepare(
          'INSERT INTO posts (slug, title, description, content, date, tags) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          slug,
          body.title,
          body.description,
          body.content,
          body.date,
          JSON.stringify(body.tags || [])
        ).run();

        return new Response(JSON.stringify({ success: true, id: result.meta.last_insert_rowid }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (path.startsWith('/api/posts/') && method === 'GET') {
      const slug = path.split('/')[3];
      try {
        const result = await env.DB.prepare(
          'SELECT * FROM posts WHERE slug = ?'
        ).bind(slug).first();

        if (!result) {
          return new Response(JSON.stringify({ success: false, message: 'Post not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, post: result }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (path.startsWith('/api/posts/') && method === 'PUT') {
      const slug = path.split('/')[3];
      try {
        const body: UpdatePostRequest = await request.json();
        
        const updates: string[] = [];
        const params: unknown[] = [];

        if (body.title) {
          updates.push('title = ?');
          params.push(body.title);
          updates.push('slug = ?');
          params.push(generateSlug(body.title));
        }
        if (body.description) {
          updates.push('description = ?');
          params.push(body.description);
        }
        if (body.content) {
          updates.push('content = ?');
          params.push(body.content);
        }
        if (body.date) {
          updates.push('date = ?');
          params.push(body.date);
        }
        if (body.tags) {
          updates.push('tags = ?');
          params.push(JSON.stringify(body.tags));
        }
        updates.push('updated_at = CURRENT_TIMESTAMP');

        params.push(slug);

        await env.DB.prepare(
          `UPDATE posts SET ${updates.join(', ')} WHERE slug = ?`
        ).bind(...params).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (path.startsWith('/api/posts/') && method === 'DELETE') {
      const slug = path.split('/')[3];
      try {
        const result = await env.DB.prepare(
          'DELETE FROM posts WHERE slug = ?'
        ).bind(slug).run();

        if (result.meta.changes === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Post not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/api/init' && method === 'POST') {
      try {
        await env.DB.exec(`
          CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            content TEXT NOT NULL,
            date TEXT NOT NULL,
            tags TEXT DEFAULT '[]',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        return new Response(JSON.stringify({ success: true, message: 'Table created' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: 'Database error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
