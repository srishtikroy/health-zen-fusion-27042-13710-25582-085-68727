import { Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Post } from "@/hooks/useCommunityPosts";
import { CommentSection } from "./CommentSection";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
}

export const PostCard = ({ post, currentUserId }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.user_liked);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm text-muted-foreground">
              by {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge>{post.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground">{post.content}</p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={liked ? "text-primary" : ""}
          >
            <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments}
          </Button>
        </div>

        {showComments && (
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        )}
      </CardContent>
    </Card>
  );
};
