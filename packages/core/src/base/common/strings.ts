import { CharCode } from "base/common/charCode";

export function isUpperAsciiLetter(code: number): boolean {
  return code >= CharCode.A && code <= CharCode.Z;
}

export function regExpFlags(regexp: RegExp): string {
  return (regexp.global ? "g" : "") + (regexp.ignoreCase ? "i" : "") + (regexp.multiline ? "m" : "") + ((regexp as any) /* standalone editor compilation */.unicode ? "u" : "");
}

export function compare(a: string, b: string): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

export function compareIgnoreCase(a: string, b: string): number {
  return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
}

export function compareSubstring(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length): number {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    const codeA = a.charCodeAt(aStart);
    const codeB = b.charCodeAt(bStart);
    if (codeA < codeB) {
      return -1;
    } else if (codeA > codeB) {
      return 1;
    }
  }
  const aLen = aEnd - aStart;
  const bLen = bEnd - bStart;
  if (aLen < bLen) {
    return -1;
  } else if (aLen > bLen) {
    return 1;
  }
  return 0;
}

export function compareSubstringIgnoreCase(a: string, b: string, aStart: number = 0, aEnd: number = a.length, bStart: number = 0, bEnd: number = b.length): number {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    let codeA = a.charCodeAt(aStart);
    let codeB = b.charCodeAt(bStart);

    if (codeA === codeB) {
      // equal
      continue;
    }

    if (codeA >= 128 || codeB >= 128) {
      // not ASCII letters -> fallback to lower-casing strings
      return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
    }

    // mapper lower-case ascii letter onto upper-case varinats
    // [97-122] (lower ascii) --> [65-90] (upper ascii)
    if (isLowerAsciiLetter(codeA)) {
      codeA -= 32;
    }
    if (isLowerAsciiLetter(codeB)) {
      codeB -= 32;
    }

    // compare both code points
    const diff = codeA - codeB;
    if (diff === 0) {
      continue;
    }

    return diff;
  }

  const aLen = aEnd - aStart;
  const bLen = bEnd - bStart;

  if (aLen < bLen) {
    return -1;
  } else if (aLen > bLen) {
    return 1;
  }

  return 0;
}

export function equalsIgnoreCase(a: string, b: string): boolean {
  return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
}

export function isLowerAsciiLetter(code: number): boolean {
  return code >= CharCode.a && code <= CharCode.z;
}

export function startsWithIgnoreCase(str: string, candidate: string): boolean {
  const candidateLength = candidate.length;
  if (candidate.length > str.length) {
    return false;
  }

  return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
}

/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function rtrim(haystack: string, needle: string): string {
  if (!haystack || !needle) {
    return haystack;
  }

  const needleLen = needle.length,
    haystackLen = haystack.length;

  if (needleLen === 0 || haystackLen === 0) {
    return haystack;
  }

  let offset = haystackLen,
    idx = -1;

  while (true) {
    idx = haystack.lastIndexOf(needle, offset - 1);
    if (idx === -1 || idx + needleLen !== offset) {
      break;
    }
    if (idx === 0) {
      return "";
    }
    offset = idx;
  }

  return haystack.substring(0, offset);
}

/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export function isHighSurrogate(charCode: number): boolean {
  return 0xd800 <= charCode && charCode <= 0xdbff;
}

/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export function isLowSurrogate(charCode: number): boolean {
  return 0xdc00 <= charCode && charCode <= 0xdfff;
}

/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export function computeCodePoint(highSurrogate: number, lowSurrogate: number): number {
  return ((highSurrogate - 0xd800) << 10) + (lowSurrogate - 0xdc00) + 0x10000;
}

/**
 * Escapes regular expression characters in a given string
 */
export function escapeRegExpCharacters(value: string): string {
  return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, "\\$&");
}

/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function ltrim(haystack: string, needle: string): string {
  if (!haystack || !needle) {
    return haystack;
  }

  const needleLen = needle.length;
  if (needleLen === 0 || haystack.length === 0) {
    return haystack;
  }

  let offset = 0;

  while (haystack.indexOf(needle, offset) === offset) {
    offset = offset + needleLen;
  }
  return haystack.substring(offset);
}
