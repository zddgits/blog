import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Save } from 'lucide-react';
import { useBlogStore } from '@/store/useBlogStore';
import { Navbar } from '@/components/Navbar';
import { BlogPost } from '@/types';

export function Editor() {
  const { slug } = useParams<{ slug: string }>();
  const { posts, isLoggedIn, addPost, updatePost } = useBlogStore();
  const navigate = useNavigate();
  const isNew = slug === 'new';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: ''
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isNew && slug) {
      const post = posts.find((p) => p.slug === slug);
      if (post) {
        setFormData({
          title: post.title,
          description: post.description,
          date: post.date,
          content: post.content,
          tags: post.tags ? post.tags.join(', ') : ''
        });
      }
    }
  }, [slug, posts, isNew]);

  if (!isLoggedIn) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSlug = isNew
      ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : slug!;

    const postData: BlogPost = {
      slug: newSlug,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      content: formData.content,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    };

    if (isNew) {
      addPost(postData);
    } else {
      updatePost(slug!, postData);
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </Link>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? '新建文章' : '编辑文章'}
            </h1>
          </div>
          <button
            form="editor-form"
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Save className="w-5 h-5" />
            保存
          </button>
        </div>

        <form id="editor-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="输入文章标题"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="简短描述"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    发布日期
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    标签 (逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="技术, React, 前端"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  内容 (Markdown)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-96 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-sm resize-none"
                  placeholder="# 标题

欢迎使用 Markdown 编辑文章！

## 子标题

支持代码高亮：

```javascript
console.log('Hello World');
```

也支持列表：
- 第一项
- 第二项"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                预览
              </label>
              <div className="h-full min-h-[600px] bg-zinc-800 border border-zinc-700 rounded-xl p-6 overflow-y-auto">
                {formData.content ? (
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ ...props }) => (
                          <h1
                            className="text-2xl font-bold text-white mt-4 mb-3"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-xl font-semibold text-white mt-4 mb-2"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-lg font-medium text-white mt-3 mb-2"
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p
                            className="text-zinc-300 leading-relaxed mb-3"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul
                            className="list-disc list-inside text-zinc-300 mb-3 space-y-1"
                            {...props}
                          />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            className="list-decimal list-inside text-zinc-300 mb-3 space-y-1"
                            {...props}
                          />
                        ),
                        li: ({ ...props }) => (
                          <li className="text-zinc-300" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="border-l-4 border-primary-500 pl-4 my-4 text-zinc-400 italic"
                            {...props}
                          />
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <pre className="bg-zinc-900 rounded-lg p-3 my-4 overflow-x-auto">
                              <code
                                className={className}
                                {...props}
                              >
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code
                              className="bg-zinc-900 text-primary-400 px-1 py-0.5 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500">
                    在左侧输入内容进行预览
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
