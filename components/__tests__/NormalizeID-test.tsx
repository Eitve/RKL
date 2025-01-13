import { normalizeID } from '@/components/gameUtils';

describe('normalizeID', () => {
  test('should convert Lithuanian characters to their normalized counterparts', () => {
    expect(normalizeID('ąčęėįšųūž')).toBe('aceeisuuz');
  });

  test('should convert uppercase Lithuanian characters and normalize them', () => {
    expect(normalizeID('ĄČĘĖĮŠŲŪŽ')).toBe('aceeisuuz');
  });

  test('should make all characters lowercase', () => {
    expect(normalizeID('ABCDEF')).toBe('abcdef');
  });

  test('should remove spaces', () => {
    expect(normalizeID('hello world')).toBe('helloworld');
  });

  test('should handle a mix of Lithuanian characters, spaces, and uppercase letters', () => {
    expect(normalizeID('Ą čę Hello Ėį World Šųū Ž')).toBe('acehelloeiworldsuuz');
  });

  test('should return an empty string if the input is empty', () => {
    expect(normalizeID('')).toBe('');
  });

  test('should handle strings with no special characters or spaces', () => {
    expect(normalizeID('normaltext')).toBe('normaltext');
  });
});
