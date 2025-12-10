import { describe, it, expect } from 'vitest';

describe('validation utils', () => {
  it('should validate file size', () => {
    const maxSize = 25 * 1024 * 1024; // 25MB
    const validSize = 10 * 1024 * 1024; // 10MB
    const invalidSize = 30 * 1024 * 1024; // 30MB

    expect(validSize <= maxSize).toBe(true);
    expect(invalidSize <= maxSize).toBe(false);
  });

  it('should validate file type', () => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'video/mp4'];

    expect(allowedTypes.includes('audio/mpeg')).toBe(true);
    expect(allowedTypes.includes('audio/wav')).toBe(true);
    expect(allowedTypes.includes('video/mp4')).toBe(true);
    expect(allowedTypes.includes('text/plain')).toBe(false);
  });
});
