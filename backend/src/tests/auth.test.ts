import { describe, it, expect } from 'vitest';
import { generatePasscode, hashPasscode, comparePasscode } from '../utils/crypto.js';

describe('SaathiCare Auth & Passcode Security', () => {
  it('generates a 6-digit cryptographically secure numeric passcode', () => {
    const code = generatePasscode(6);
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  it('hashes passcode with bcrypt and correctly verifies it', async () => {
    const rawCode = '748291';
    const hash = await hashPasscode(rawCode);

    expect(hash).not.toBe(rawCode);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix

    const isMatch = await comparePasscode(rawCode, hash);
    expect(isMatch).toBe(true);

    const isWrong = await comparePasscode('000000', hash);
    expect(isWrong).toBe(false);
  });
});
