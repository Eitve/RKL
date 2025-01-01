export function normalizeLithuanian(text: string): string {
    const charMap: { [key: string]: string } = {
      'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
      'Ą': 'A', 'Č': 'C', 'Ę': 'E', 'Ė': 'E', 'Į': 'I', 'Š': 'S', 'Ų': 'U', 'Ū': 'U', 'Ž': 'Z',
    };
  
    return text
      .split('')
      .map((char) => charMap[char] || char)
      .join('');
  }
