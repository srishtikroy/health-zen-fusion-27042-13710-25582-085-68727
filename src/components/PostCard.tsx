import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Post } from "@/hooks/useCommunityPosts";
import { CommentSection } from "./CommentSection";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export const PostCard = ({ post, currentUserId }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.post_likes.some((like) => like.user_id === currentUserId)
  );

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
        setIsLiked(false);
      } else {
        await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const initials = post.user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="hover:shadow-[var(--shadow-soft)] transition-all">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-[image:var(--wellness-gradient)] text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{post.user_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.content && (
          <p className="text-foreground leading-relaxed">{post.content}</p>
        )}

        {/* Media Display */}
        {post.post_media.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {post.post_media.map((media) => (
              <div key={media.id} className="rounded-lg overflow-hidden">
                {media.media_type === "image" ? (
                  <img
                    src={media.media_url}
                    alt="Post media"
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                ) : (
                  <video
                    src={media.media_url}
                    controls
                    className="w-full h-auto max-h-[500px]"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${
              isLiked
                ? "text-destructive"
                : "text-muted-foreground hover:text-destructive"
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{post.post_likes.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.post_comments.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-accent"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {showComments && (
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        )}
      </CardContent>
    </Card>
  );
};
