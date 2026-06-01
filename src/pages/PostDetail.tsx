import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Tag, Edit2, Trash2 } from 'lucide-react';
import { useBlogStore } from '@/store/useBlogStore';
import { Navbar } from '@/components/Navbar';

export function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { posts, deletePost, isLoggedIn } = useBlogStore();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">文章不存在</h1>
            <Link
              to="/"
              className="text-primary-500 hover:text-primary-400 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除这篇文章吗？')) {
      deletePost(post.slug);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-white">{post.title}</h1>
              {isLoggedIn && (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/editor/${post.slug}`}
                    className="p-2 text-zinc-400 hover:text-primary-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xl text-zinc-400 mb-4">{post.description}</p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <div className="flex gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-invert prose-zinc max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold text-white mt-8 mb-4"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-semibold text-white mt-6 mb-3"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-medium text-white mt-5 mb-2"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="text-zinc-300 leading-relaxed mb-4"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc list-inside text-zinc-300 mb-4 space-y-1"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal list-inside text-zinc-300 mb-4 space-y-1"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li className="text-zinc-300" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary-500 pl-4 my-6 text-zinc-400 italic"
                    {...props}
                  />
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <pre className="bg-zinc-800 rounded-xl p-4 my-6 overflow-x-auto">
                      <code
                        className={className}
                        {...props}
                      >
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="bg-zinc-800 text-primary-400 px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
