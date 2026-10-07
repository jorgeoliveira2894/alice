import { createClient } from '@supabase/supabase-js';
import type { Api } from './api';
import type { Plan, PlanBundle, Post, Story } from './types';
import { newToken } from './format';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);

const sb = supabaseConfigured ? createClient(url!, key!) : null;

function client() {
  if (!sb) throw new Error('Supabase não configurado');
  return sb;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const supabaseApi: Api = {
  demo: false,

  async getUser() {
    const { data } = await client().auth.getUser();
    return data.user ? { email: data.user.email ?? '' } : null;
  },

  async signIn(email, password) {
    const { error } = await client().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  },

  async signOut() {
    await client().auth.signOut();
  },

  async listPlans() {
    const plans = check(await client().from('plans').select('*').order('created_at', { ascending: false })) as Plan[];
    if (!plans.length) return [];
    const ids = plans.map((p) => p.id);
    const posts = (check(await client().from('posts').select('*').in('plan_id', ids).order('position')) ?? []) as Post[];
    const stories = (check(await client().from('stories').select('*').in('plan_id', ids).order('position')) ?? []) as Story[];
    return plans.map((plan) => ({
      plan,
      posts: posts.filter((p) => p.plan_id === plan.id),
      stories: stories.filter((s) => s.plan_id === plan.id),
    }));
  },

  async getPlan(id) {
    const plan = check(await client().from('plans').select('*').eq('id', id).maybeSingle()) as Plan | null;
    if (!plan) return null;
    const posts = (check(await client().from('posts').select('*').eq('plan_id', id).order('position')) ?? []) as Post[];
    const stories = (check(await client().from('stories').select('*').eq('plan_id', id).order('position')) ?? []) as Story[];
    return { plan, posts, stories };
  },

  async createPlan(input) {
    return check(
      await client().from('plans').insert({ ...input, share_token: newToken() }).select('*').single(),
    ) as Plan;
  },

  async updatePlan(plan) {
    const { id, client_name, client_handle, month, theme } = plan;
    check(await client().from('plans').update({ client_name, client_handle, month, theme }).eq('id', id));
  },

  async deletePlan(id) {
    check(await client().from('plans').delete().eq('id', id));
  },

  async savePost(post) {
    check(await client().from('posts').upsert(post));
  },

  async deletePost(id) {
    check(await client().from('posts').delete().eq('id', id));
  },

  async saveStory(story) {
    check(await client().from('stories').upsert(story));
  },

  async deleteStory(id) {
    check(await client().from('stories').delete().eq('id', id));
  },

  async uploadMedia(planId, file) {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${planId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await client().storage.from('media').upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    const { data } = client().storage.from('media').getPublicUrl(path);
    return { url: data.publicUrl, type: file.type.startsWith('video') ? 'video' : 'image' };
  },

  async getByToken(token) {
    return check(await client().rpc('get_plan_by_token', { p_token: token })) as PlanBundle | null;
  },

  async review(token, kind, id, status, feedback) {
    check(
      await client().rpc('review_item', {
        p_token: token,
        p_kind: kind,
        p_id: id,
        p_status: status,
        p_feedback: feedback,
      }),
    );
  },
};
