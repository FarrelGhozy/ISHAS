'use client';

import { useSyncExternalStore } from 'react';
import {
  demoAccounts,
  getDemoAccount,
  isRoleId,
  type DemoAccount,
  type RoleId,
} from '@/shared/auth/demo-accounts';

const SESSION_KEY = 'ishas-demo-session-v1';
const DEMO_PASSWORD = 'demo1234';

type AuthSnapshot = {
  account: DemoAccount | null;
  ready: boolean;
};

const serverSnapshot: AuthSnapshot = { account: null, ready: false };
let browserSnapshot: AuthSnapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();

function readStoredAccount() {
  if (typeof window === 'undefined') return null;
  const storedRole = window.sessionStorage.getItem(SESSION_KEY);
  if (storedRole && isRoleId(storedRole)) return getDemoAccount(storedRole);
  if (storedRole) window.sessionStorage.removeItem(SESSION_KEY);
  return null;
}

function initialize() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  browserSnapshot = { account: readStoredAccount(), ready: true };
}

function persistRole(role: RoleId | null) {
  if (typeof window === 'undefined') return;
  if (role) window.sessionStorage.setItem(SESSION_KEY, role);
  else window.sessionStorage.removeItem(SESSION_KEY);
}

function emit(account: DemoAccount | null) {
  browserSnapshot = { account, ready: true };
  persistRole(account?.role ?? null);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  initialize();
  return browserSnapshot;
}

function signIn(email: string, password: string) {
  const matched = demoAccounts.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!matched || password !== DEMO_PASSWORD) return null;
  emit(matched);
  return matched;
}

function signInAs(role: RoleId) {
  const matched = getDemoAccount(role);
  emit(matched);
  return matched;
}

function signOut() {
  emit(null);
}

export function useAuthStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot,
  );
  return { ...snapshot, signIn, signInAs, signOut };
}
