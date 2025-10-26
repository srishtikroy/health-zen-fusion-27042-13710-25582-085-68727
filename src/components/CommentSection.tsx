import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Reply } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id: string | null;
  user_name: string;
  comment_likes: Array<{ user_id: string }>;
}

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

export const CommentSection = ({ postId, currentUserId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("post_comments")
        .select(`
          *,
          comment_likes (user_id)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch user profiles
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      const profilesMap = new Map(
        profiles?.map(p => [p.id, `${p.first_name} ${p.last_name || ""}`]) || []
      );

      const commentsWithUsers = commentsData?.map(comment => ({
        ...comment,
        user_name: profilesMap.get(comment.user_id) || "Unknown User"
      })) || [];

      setComments(commentsWithUsers);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUserId) {
      toast.error("Please sign in to comment");
      return;
    }

    try {
      await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: currentUserId,
        content: newComment,
      });
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    if (!currentUserId) {
      toast.error("Please sign in to reply");
      return;
    }

    try {
      await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: currentUserId,
        content: replyContent,
        parent_comment_id: parentId,
      });
      setReplyContent("");
      setReplyTo(null);
      toast.success("Reply added!");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!currentUserId) {
      toast.error("Please sign in to like comments");
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: currentUserId,
        });
      }
      fetchComments();
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Failed to update like");
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isLiked = comment.comment_likes.some(
      (like) => like.user_id === currentUserId
    );
    const replies = comments.filter((c) => c.parent_comment_id === comment.id);
    const initials = comment.user_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-8 mt-3" : "mt-4"}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarFallback className="bg-[image:var(--wellness-gradient)] text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-3">
              <p className="font-semibold text-sm">{comment.user_name}</p>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
            <div className="flex items-center gap-4 mt-1 ml-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto p-0 text-xs ${
                  isLiked ? "text-destructive" : "text-muted-foreground"
                }`}
                onClick={() => handleLikeComment(comment.id, isLiked)}
              >
                <Heart
                  className={`h-3 w-3 mr-1 ${isLiked ? "fill-current" : ""}`}
                />
                {comment.comment_likes.length > 0 &&
                  comment.comment_likes.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={() => setReplyTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {replyTo === comment.id && (
              <div className="mt-2 flex gap-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {replies.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          Post
        </Button>
      </div>
      <div className="space-y-2">
        {topLevelComments.map((comment) => renderComment(comment))}
      </div>
    </div>
  );
};
