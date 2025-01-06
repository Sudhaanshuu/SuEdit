export interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    created_at: string;
  }
  
  export interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    profile?: Profile;
    likes_count?: number;
    comments_count?: number;
    user_has_liked?: boolean;
  }