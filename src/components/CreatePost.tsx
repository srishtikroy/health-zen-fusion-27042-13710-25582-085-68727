import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Share2, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const uploadMedia = async (postId: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${postId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error("Not authenticated");

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(`${session.session.user.id}/${filePath}`, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("post-media")
      .getPublicUrl(`${session.session.user.id}/${filePath}`);

    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    await supabase.from("post_media").insert({
      post_id: postId,
      media_url: data.publicUrl,
      media_type: mediaType,
    });
  };

  const handleCreatePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content or media");
      return;
    }

    setUploading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast.error("Please sign in to create a post");
        return;
      }

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          content: content || "",
          user_id: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload media files
      for (const file of mediaFiles) {
        await uploadMedia(post.id, file);
      }

      toast.success("Post shared with the community!");
      setContent("");
      setMediaFiles([]);
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Share with Community
        </CardTitle>
        <CardDescription>
          Post recipes, cooking ideas, motivation, or wellness tips
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What would you like to share today?"
          className="min-h-[100px] resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {mediaFiles.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {mediaFiles.length} file(s) selected
          </div>
        )}
        <div className="flex justify-end gap-2">
          <label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="outline" className="gap-2" asChild>
              <span>
                <ImageIcon className="h-4 w-4" />
                Add Image
              </span>
            </Button>
          </label>
          <label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="outline" className="gap-2" asChild>
              <span>
                <Video className="h-4 w-4" />
                Add Video
              </span>
            </Button>
          </label>
          <Button onClick={handleCreatePost} className="gap-2" disabled={uploading}>
            <Share2 className="h-4 w-4" />
            {uploading ? "Posting..." : "Share Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
