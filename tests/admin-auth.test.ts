import { describe, expect, it } from 'vitest';
import { safeNext } from '@/lib/admin/auth';

describe('safeNext', () => {
  it('keeps admin paths', () => {
    expect(safeNext('/admin/produtos/1')).toBe('/admin/produtos/1');
  });
  it.each(['https://evil.com', '//evil.com', '/catalogo', '/administrador', '/admin/../catalogo', '/admin\\@evil.com', null, ''])('rejects %s', next => {
    expect(safeNext(next)).toBe('/admin');
  });
});
