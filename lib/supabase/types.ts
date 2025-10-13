export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    display_name: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    display_name?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    display_name?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            channels: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    is_private: boolean
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    is_private?: boolean
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    is_private?: boolean
                    created_by?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "channels_created_by_fkey"
                        columns: ["created_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    id: string
                    channel_id: string
                    user_id: string | null
                    content: string
                    message_type: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    channel_id: string
                    user_id?: string | null
                    content: string
                    message_type?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    channel_id?: string
                    user_id?: string | null
                    content?: string
                    message_type?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_channel_id_fkey"
                        columns: ["channel_id"]
                        referencedRelation: "channels"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            channel_members: {
                Row: {
                    channel_id: string
                    user_id: string
                    joined_at: string
                }
                Insert: {
                    channel_id: string
                    user_id: string
                    joined_at?: string
                }
                Update: {
                    channel_id?: string
                    user_id?: string
                    joined_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "channel_members_channel_id_fkey"
                        columns: ["channel_id"]
                        referencedRelation: "channels"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "channel_members_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_presence: {
                Row: {
                    user_id: string
                    online: boolean
                    last_seen: string
                }
                Insert: {
                    user_id: string
                    online?: boolean
                    last_seen?: string
                }
                Update: {
                    user_id?: string
                    online?: boolean
                    last_seen?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_presence_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

