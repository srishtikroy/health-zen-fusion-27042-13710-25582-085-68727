import { useState } from "react";

export interface Post {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  media: { url: string; type: string }[];
  likes: number;
  comments: number;
  user_liked: boolean;
}

const mockPosts: Post[] = [
  {
    id: "1",
    user_id: "user1",
    user_name: "nikhil",
    title: "moti",
    content: "ujrrik",
    category: "motivation",
    created_at: "2025-06-01T00:00:00Z",
    media: [],
    likes: 4,
    comments: 0,
    user_liked: false,
  },
  {
    id: "2",
    user_id: "user2",
    user_name: "nikhil",
    title: "poha",
    content: "vyhln",
    category: "tip",
    created_at: "2025-06-01T00:00:00Z",
    media: [],
    likes: 14,
    comments: 0,
    user_liked: false,
  },
  {
    id: "3",
    user_id: "user3",
    user_name: "csaAhya",
    title: "poha",
    content: "wwwnotGlG4",
    category: "recipe",
    created_at: "2025-01-01T00:00:00Z",
    media: [],
    likes: 1,
    comments: 0,
    user_liked: false,
  },
];

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);

  const refetch = () => {
    setPosts([...mockPosts]);
  };

  return { posts, loading, refetch };
};
