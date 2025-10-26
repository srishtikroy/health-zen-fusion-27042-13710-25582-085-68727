import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  post_media: Array<{
    id: string;
    media_url: string;
    media_type: string;
  }>;
  post_likes: Array<{ user_id: string }>;
  post_comments: Array<{ id: string }>;
}

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          post_media (id, media_url, media_type),
          post_likes (user_id),
          post_comments (id)
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch user profiles
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      const profilesMap = new Map(
        profiles?.map(p => [p.id, `${p.first_name} ${p.last_name || ""}`]) || []
      );

      const postsWithUsers = postsData?.map(post => ({
        ...post,
        user_name: profilesMap.get(post.user_id) || "Unknown User"
      })) || [];

      setPosts(postsWithUsers);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
        },
        () => {
          fetchPosts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading, refetch: fetchPosts };
};
