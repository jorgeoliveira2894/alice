import type { ItemKind, Media, NewPlan, Plan, PlanBundle, Post, Status, Story } from './types';
import { demoApi } from './demo';
import { supabaseApi, supabaseConfigured } from './supabase';

export interface Api {
  /** true quando corre sem backend (dados só neste browser) */
  demo: boolean;

  // Sessão da agência
  getUser(): Promise<{ email: string } | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;

  // Área da agência
  listPlans(): Promise<PlanBundle[]>;
  getPlan(id: string): Promise<PlanBundle | null>;
  createPlan(input: NewPlan): Promise<Plan>;
  updatePlan(plan: Plan): Promise<void>;
  deletePlan(id: string): Promise<void>;
  savePost(post: Post): Promise<void>;
  deletePost(id: string): Promise<void>;
  saveStory(story: Story): Promise<void>;
  deleteStory(id: string): Promise<void>;
  uploadMedia(planId: string, file: File): Promise<Media>;

  // Área do cliente (acesso só pelo link secreto)
  getByToken(token: string): Promise<PlanBundle | null>;
  review(token: string, kind: ItemKind, id: string, status: Status, feedback: string): Promise<void>;
}

export const api: Api = supabaseConfigured ? supabaseApi : demoApi;
