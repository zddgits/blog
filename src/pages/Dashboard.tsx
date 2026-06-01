import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Eye, RefreshCw } from 'lucide-react';
import { useBlogStore } from '@/store/useBlogStore';
import { Navbar } from '@/components/Navbar';

export function Dashboard() {
  const { posts, isLoggedIn, deletePost, loadPosts, loading } = useBlogStore();
  const navigate = useNavigate();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
    } else {
      loadPosts();
    }
  }, [isLoggedIn, navigate, loadPosts]);

  const handleDelete = async (slug: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    
    setDeletingSlug(slug);
    await deletePost(slug);
    setDeletingSlug(null);
  };

  const handleRefresh = () => {
    loadPosts();
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">文章管理</h1>
            <p className="text-zinc-400">管理你的所有博客文章</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'w-5 h-5 animate-spin' : 'w-5 h-5'} />
              刷新
            </button>
            <Link
              to="/admin/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              新建文章
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-800/30 rounded-2xl border border-zinc-700">
            <p className="text-zinc-500 text-lg mb-4">暂无文章</p>
            <Link
              to="/admin/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              写第一篇文章
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {post.title}
                    </h3>
                    <p className="text-zinc-400 mb-3 line-clamp-1">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Link
                      to={`/post/${post.slug}`}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="预览"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/admin/editor/${post.slug}`}
                      className="p-2 text-zinc-400 hover:text-primary-400 hover:bg-zinc-700 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      disabled={deletingSlug === post.slug}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
