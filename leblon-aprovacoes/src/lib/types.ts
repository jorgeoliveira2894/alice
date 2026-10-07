export type PostKind = 'post' | 'carrossel' | 'reel';
export type Status = 'pendente' | 'aprovado' | 'alteracoes';
export type ItemKind = 'post' | 'story';

export interface Media {
  url: string;
  type: 'image' | 'video';
}

export interface Plan {
  id: string;
  client_name: string;
  client_handle: string;
  /** yyyy-mm */
  month: string;
  theme: string;
  share_token: string;
  created_at: string;
}

export interface Post {
  id: string;
  plan_id: string;
  position: number;
  kind: PostKind;
  title: string;
  caption: string;
  /** yyyy-mm-dd ou '' */
  date: string;
  /** hh:mm ou '' */
  time: string;
  media: Media[];
  status: Status;
  feedback: string;
  reviewed_at: string | null;
}

export interface StoryFrame {
  text: string;
  /** Opções de enquete / caixa de perguntas (opcional) */
  options: string[];
}

export interface Story {
  id: string;
  plan_id: string;
  position: number;
  week: number;
  /** ex.: "Quarta-feira" */
  day: string;
  title: string;
  frames: StoryFrame[];
  status: Status;
  feedback: string;
  reviewed_at: string | null;
}

export interface PlanBundle {
  plan: Plan;
  posts: Post[];
  stories: Story[];
}

export type NewPlan = Pick<Plan, 'client_name' | 'client_handle' | 'month' | 'theme'>;
