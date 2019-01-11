/**
 * Convert a number or array of integers to a string of padded hex octets.
 * @internal
 */
function asHex(value: number[] | Uint8Array): string {
  return Array.from(value)
    .map(i => `00${i.toString(16)}`.slice(-2))
    .join('');
}

/**
 * Attempt to securely generate random bytes/
 * @internal
 */
function getRandomBytes(size: number): number[] | Uint8Array {
  // SPRNG
  if (typeof Uint8Array === 'function' && window.crypto) {
    const buffer = new Uint8Array(size);
    const randomValues = window.crypto.getRandomValues(buffer) as Uint8Array;

    if (randomValues) {
      return randomValues;
    }
  }

  // Insecure random
  return Array.from(new Array(size), () => (Math.random() * 255) | 0);
}

/**
 * Generate a RFC4122-compliant v4 UUID.
 *
 * @see http://www.ietf.org/rfc/rfc4122.txt
 * @internal
 */
export function generateUuid(): string {
  const version = 0b01000000;
  const clockSeqHiAndReserved = getRandomBytes(1);
  const timeHiAndVersion = getRandomBytes(2);

  clockSeqHiAndReserved[0] &= 0b00111111 | 0b10000000;
  // tslint:disable-next-line:binary-expression-operand-order
  timeHiAndVersion[0] &= 0b00001111 | version;

  return [
    asHex(getRandomBytes(4)), // time-low
    '-',
    asHex(getRandomBytes(2)), // time-mid
    '-',
    asHex(timeHiAndVersion), // time-high-and-version
    '-',
    asHex(clockSeqHiAndReserved), // clock-seq-and-reserved
    asHex(getRandomBytes(1)), // clock-seq-loq
    '-',
    asHex(getRandomBytes(6)), // node
  ].join('');
}

// Default
export default generateUuid;
