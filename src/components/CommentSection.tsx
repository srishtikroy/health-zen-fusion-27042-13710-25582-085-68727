import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  likes: number;
  user_liked: boolean;
}

interface CommentSectionProps {
  postId: string;
  currentUserId: string | null;
}

export const CommentSection = ({ postId, currentUserId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!currentUserId) {
      toast.error("Please sign in to comment");
      return;
    }

    setIsSubmitting(true);
    
    const comment: Comment = {
      id: Date.now().toString(),
      user_id: currentUserId,
      user_name: "User",
      content: newComment,
      created_at: new Date().toISOString(),
      likes: 0,
      user_liked: false,
    };

    setComments([...comments, comment]);
    setNewComment("");
    setIsSubmitting(false);
    toast.success("Comment added!");
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId
        ? { ...comment, user_liked: !comment.user_liked, likes: comment.user_liked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px]"
        />
        <Button
          onClick={handleAddComment}
          disabled={isSubmitting || !newComment.trim()}
        >
          Post
        </Button>
      </div>
      
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm">{comment.user_name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className={comment.user_liked ? "text-primary" : ""}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.user_liked ? "fill-current" : ""}`} />
              {comment.likes > 0 && comment.likes}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
