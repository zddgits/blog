import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Home, LogOut, LayoutDashboard } from 'lucide-react';
import { useBlogStore } from '@/store/useBlogStore';

export function Navbar() {
  const { isLoggedIn, logout } = useBlogStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold text-white">我的博客</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>管理</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-zinc-300 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
