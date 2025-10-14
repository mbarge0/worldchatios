export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// --- Firestore Canvas/Shape Types (Client) ---

export type UserPresence = {
  userId: string
  displayName: string
  color: string
  online: boolean
  cursor?: { x: number; y: number; ts: number }
  ts: number // server timestamp millis
}

export type LockedBy = {
  userId: string
  ts: number // server timestamp millis
}

export type CanvasDoc = {
  id: string
  title?: string
  createdAt: number
  updatedAt: number
}

export type ShapeBase = {
  id: string
  type: 'rect' | 'text'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  fill?: string
  stroke?: string
  opacity?: number
  lockedBy?: LockedBy
  updatedAt: number
}

export type RectShape = ShapeBase & { type: 'rect' }
export type TextShape = ShapeBase & {
  type: 'text'
  text: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
}

export type ShapeDoc = RectShape | TextShape
