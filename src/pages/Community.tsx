import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";

const Community = () => {
  const { posts, loading, refetch } = useCommunityPosts();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Header */}
      <section className="bg-[image:var(--vitality-gradient)] text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <Users className="h-10 w-10" />
            Community
          </h1>
          <p className="text-lg opacity-90">
            Share recipes, motivation, and wellness tips with fellow health enthusiasts
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Create Post */}
        <CreatePost onPostCreated={refetch} />

        {/* Community Posts */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Community;
