import { Outlet, Link, useLocation } from "react-router";
import { TrendingUp, LayoutDashboard, GitBranch, BarChart3, ShieldCheck, Database as DatabaseIcon } from "lucide-react";

export function Root() {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/datasets", label: "Datasets", icon: DatabaseIcon },
    { path: "/pipelines", label: "Pipelines", icon: GitBranch },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/quality", label: "Quality", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7dd0f1]/20 via-purple-100/30 to-[#f458d1]/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">
                Civic<span className="text-white/90">Metrics</span>
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-white hover:text-white/80 transition-colors ${
                      isActive ? 'font-semibold underline underline-offset-4' : 'font-normal'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={isDashboard ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#7dd0f1] to-[#f458d1] text-white"
                    : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}