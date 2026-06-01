import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { useBlogStore } from '@/store/useBlogStore';
import { Navbar } from '@/components/Navbar';

export function Home() {
  const { posts } = useBlogStore();

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            欢迎来到我的博客
          </h1>
          <p className="text-zinc-400 text-lg">
            分享技术，记录生活
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">暂无文章</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/post/${post.slug}`}
                className="group block bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl p-6 border border-zinc-700 hover:border-primary-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h2>
                </div>
                <p className="text-zinc-400 mb-4 line-clamp-2">
                  {post.description}
                </p>
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
                            className="px-2 py-0.5 bg-zinc-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
