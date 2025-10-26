import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, Apple, Brain, Pill, Users, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { User, Session } from "@supabase/supabase-js";
import { Activity } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("You've been successfully logged out.");
    navigate("/auth");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/diet-fitness", label: "Diet & Fitness", icon: Apple },
    { path: "/yoga-meditation", label: "Yoga & Meditation", icon: Brain },
    { path: "/medicine", label: "Medicine", icon: Pill },
    { path: "/community", label: "Community", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--wellness-gradient)]">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-[image:var(--wellness-gradient)] bg-clip-text text-transparent">
              NutriWell
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="flex justify-around p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full flex-col h-auto py-2 gap-1"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label.split(" ")[0]}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;