import { create } from 'zustand';
import { BlogPost } from '@/types';
import { getPosts, createPost, updatePost, deletePost, isLoggedIn as apiIsLoggedIn, logout as apiLogout } from '@/lib/api';

interface BlogStore {
  posts: BlogPost[];
  isLoggedIn: boolean;
  loading: boolean;
  loadPosts: () => Promise<void>;
  addPost: (post: BlogPost) => Promise<boolean>;
  updatePost: (slug: string, post: BlogPost) => Promise<boolean>;
  deletePost: (slug: string) => Promise<boolean>;
  login: () => void;
  logout: () => void;
}

const initialPosts: BlogPost[] = [
  {
    slug: 'hello-world',
    title: 'Hello World!',
    description: '欢迎来到我的个人博客，这是我的第一篇文章。',
    date: '2024-01-01',
    content: '# Hello World!\n\n欢迎来到我的个人博客！\n\n这是一个使用 React 和 Tailwind CSS 构建的博客系统。\n\n## 功能特点\n\n- Markdown 编辑器\n- 实时预览\n- 深色主题\n\n\`\`\`javascript\nconsole.log("Hello, World!");\n\`\`\`\n\n希望你在这里玩得开心！',
    tags: ['入门', '欢迎'],
  },
];

export const useBlogStore = create<BlogStore>((set) => ({
  posts: initialPosts,
  isLoggedIn: apiIsLoggedIn(),
  loading: false,

  loadPosts: async () => {
    set({ loading: true });
    try {
      const posts = await getPosts();
      if (posts.length > 0) {
        set({ posts });
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
    set({ loading: false });
  },

  addPost: async (post) => {
    try {
      const success = await createPost({
        title: post.title,
        description: post.description,
        content: post.content,
        date: post.date,
        tags: post.tags,
      });
      if (success) {
        await useBlogStore.getState().loadPosts();
      }
      return success;
    } catch {
      return false;
    }
  },

  updatePost: async (slug, post) => {
    try {
      const success = await updatePost(slug, {
        title: post.title,
        description: post.description,
        content: post.content,
        date: post.date,
        tags: post.tags,
      });
      if (success) {
        await useBlogStore.getState().loadPosts();
      }
      return success;
    } catch {
      return false;
    }
  },

  deletePost: async (slug) => {
    try {
      const success = await deletePost(slug);
      if (success) {
        await useBlogStore.getState().loadPosts();
      }
      return success;
    } catch {
      return false;
    }
  },

  login: () => {
    set({ isLoggedIn: true });
  },

  logout: () => {
    apiLogout();
    set({ isLoggedIn: false });
  },
}));
