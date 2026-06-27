// ---- Token storage ----
const TOKEN_KEY = 'novuai_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---- Base fetch helper ----
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

// ---- Auth ----
export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export const auth = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  async me(): Promise<{ user: { id: string; email: string } } | null> {
    try {
      return await request('/api/auth/me');
    } catch {
      return null;
    }
  },

  logout(): void {
    clearToken();
  },

  isLoggedIn(): boolean {
    return !!getToken();
  },
};

// ---- Conversations ----
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export const conversations = {
  async list(): Promise<Conversation[]> {
    return request<Conversation[]>('/api/conversations');
  },

  async create(title: string): Promise<Conversation> {
    return request<Conversation>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async getMessages(id: string): Promise<Message[]> {
    return request<Message[]>(`/api/conversations/${id}/messages`);
  },

  async saveMessage(id: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    return request<Message>(`/api/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    });
  },
};

// ---- Streaming chat ----
export async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok || !res.body) throw new Error('Failed to reach AI');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) onChunk(parsed.text);
        } catch {
          // skip
        }
      }
    }
  }
}
