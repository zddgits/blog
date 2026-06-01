import { create } from 'zustand';
import { BlogPost } from '@/types';

interface BlogStore {
  posts: BlogPost[];
  isLoggedIn: boolean;
  setPosts: (posts: BlogPost[]) => void;
  addPost: (post: BlogPost) => void;
  updatePost: (slug: string, post: BlogPost) => void;
  deletePost: (slug: string) => void;
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

export const useBlogStore = create<BlogStore>((set) => {
  const savedPosts = localStorage.getItem('blog_posts');
  const savedLogin = localStorage.getItem('blog_logged_in');

  return {
    posts: savedPosts ? JSON.parse(savedPosts) : initialPosts,
    isLoggedIn: savedLogin === 'true',

    setPosts: (posts) => {
      localStorage.setItem('blog_posts', JSON.stringify(posts));
      set({ posts });
    },

    addPost: (post) =>
      set((state) => {
        const newPosts = [post, ...state.posts];
        localStorage.setItem('blog_posts', JSON.stringify(newPosts));
        return { posts: newPosts };
      }),

    updatePost: (slug, post) =>
      set((state) => {
        const newPosts = state.posts.map((p) => (p.slug === slug ? post : p));
        localStorage.setItem('blog_posts', JSON.stringify(newPosts));
        return { posts: newPosts };
      }),

    deletePost: (slug) =>
      set((state) => {
        const newPosts = state.posts.filter((p) => p.slug !== slug);
        localStorage.setItem('blog_posts', JSON.stringify(newPosts));
        return { posts: newPosts };
      }),

    login: () => {
      localStorage.setItem('blog_logged_in', 'true');
      set({ isLoggedIn: true });
    },

    logout: () => {
      localStorage.setItem('blog_logged_in', 'false');
      set({ isLoggedIn: false });
    },
  };
});
