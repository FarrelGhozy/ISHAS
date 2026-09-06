import { describe, expect, test } from 'bun:test';
import { resolveWorkspaceAccess } from '@/features/routing/access-policy';

describe('workspace access policy', () => {
  test('menunggu sampai sesi siap', () => {
    expect(resolveWorkspaceAccess(false, null, 'admin')).toBe('loading');
  });

  test('mengarahkan pengguna tanpa sesi ke login', () => {
    expect(resolveWorkspaceAccess(true, null, 'admin')).toBe('login');
  });

  test('menolak URL role lain dan role yang tidak dikenal', () => {
    expect(resolveWorkspaceAccess(true, 'asesor', 'admin')).toBe('denied');
    expect(resolveWorkspaceAccess(true, 'asesor', 'superadmin')).toBe('denied');
  });

  test('mengizinkan role yang sama', () => {
    expect(resolveWorkspaceAccess(true, 'pengelola', 'pengelola')).toBe(
      'allowed',
    );
  });
});
