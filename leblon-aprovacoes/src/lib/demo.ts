/**
 * Modo demonstração: sem backend. Tudo fica guardado no IndexedDB deste browser,
 * por isso o link do cliente só abre neste mesmo browser. Serve para experimentar
 * a app antes de ligar o Supabase (ver README).
 */
import type { Api } from './api';
import type { Plan, PlanBundle, Post, Story } from './types';
import { newId, newToken } from './format';
import { seedData } from './seed';

interface Db {
  plans: Plan[];
  posts: Post[];
  stories: Story[];
}

const DB_NAME = 'leblon-aprovacoes';
const STORE = 'state';
const KEY = 'db';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function load(): Promise<Db> {
  const idb = await openIdb();
  const stored = await new Promise<Db | undefined>((resolve, reject) => {
    const req = idb.transaction(STORE).objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result as Db | undefined);
    req.onerror = () => reject(req.error);
  });
  if (stored) return stored;
  const seeded = seedData();
  await save(seeded);
  return seeded;
}

async function save(db: Db): Promise<void> {
  const idb = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(db, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function mutate(fn: (db: Db) => void): Promise<void> {
  const db = await load();
  fn(db);
  await save(db);
}

function bundle(db: Db, plan: Plan): PlanBundle {
  return {
    plan,
    posts: db.posts.filter((p) => p.plan_id === plan.id).sort((a, b) => a.position - b.position),
    stories: db.stories.filter((s) => s.plan_id === plan.id).sort((a, b) => a.position - b.position),
  };
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  const i = list.findIndex((x) => x.id === item.id);
  if (i >= 0) list[i] = item;
  else list.push(item);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const demoApi: Api = {
  demo: true,

  async getUser() {
    return { email: 'demonstracao@leblon' };
  },
  async signIn() {},
  async signOut() {},

  async listPlans() {
    const db = await load();
    return db.plans
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((p) => bundle(db, p));
  },

  async getPlan(id) {
    const db = await load();
    const plan = db.plans.find((p) => p.id === id);
    return plan ? bundle(db, plan) : null;
  },

  async createPlan(input) {
    const plan: Plan = { ...input, id: newId(), share_token: newToken(), created_at: new Date().toISOString() };
    await mutate((db) => db.plans.push(plan));
    return plan;
  },

  async updatePlan(plan) {
    await mutate((db) => upsert(db.plans, plan));
  },

  async deletePlan(id) {
    await mutate((db) => {
      db.plans = db.plans.filter((p) => p.id !== id);
      db.posts = db.posts.filter((p) => p.plan_id !== id);
      db.stories = db.stories.filter((s) => s.plan_id !== id);
    });
  },

  async savePost(post) {
    await mutate((db) => upsert(db.posts, post));
  },

  async deletePost(id) {
    await mutate((db) => {
      db.posts = db.posts.filter((p) => p.id !== id);
    });
  },

  async saveStory(story) {
    await mutate((db) => upsert(db.stories, story));
  },

  async deleteStory(id) {
    await mutate((db) => {
      db.stories = db.stories.filter((s) => s.id !== id);
    });
  },

  async uploadMedia(_planId, file) {
    return { url: await readFile(file), type: file.type.startsWith('video') ? 'video' : 'image' };
  },

  async getByToken(token) {
    const db = await load();
    const plan = db.plans.find((p) => p.share_token === token);
    return plan ? bundle(db, plan) : null;
  },

  async review(token, kind, id, status, feedback) {
    await mutate((db) => {
      const plan = db.plans.find((p) => p.share_token === token);
      if (!plan) throw new Error('Link inválido');
      const list: Array<Post | Story> = kind === 'post' ? db.posts : db.stories;
      const item = list.find((x) => x.id === id && x.plan_id === plan.id);
      if (!item) throw new Error('Conteúdo não encontrado');
      item.status = status;
      item.feedback = feedback;
      item.reviewed_at = new Date().toISOString();
    });
  },
};
