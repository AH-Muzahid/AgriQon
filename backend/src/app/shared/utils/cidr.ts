/**
 * Verifies if a client IP address matches a target CIDR range or exact IP address.
 * Standardizes loopbacks (IPv6-mapped IPv4) and computes bitwise mask comparisons.
 */
export function ipMatchesCIDR(clientIp: string, cidr: string): boolean {
  try {
    // Normalize localhost loopback mappings
    const normalizedIp = clientIp === '::1' || clientIp === '::ffff:127.0.0.1' ? '127.0.0.1' : clientIp.replace('::ffff:', '');
    const cleanCidr = cidr.replace('::ffff:', '');

    const [range, bitsStr] = cleanCidr.split('/');
    if (!bitsStr) {
      return normalizedIp === range;
    }
    
    const bits = parseInt(bitsStr, 10);
    if (bits === 0) return true;
    if (bits < 0 || bits > 32) return false;

    const ipToLong = (ipAddr: string) => {
      const parts = ipAddr.split('.').map(Number);
      if (parts.length !== 4 || parts.some(isNaN)) {
        throw new Error('Invalid IPv4 address format');
      }
      return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const clientLong = ipToLong(normalizedIp);
    const rangeLong = ipToLong(range);
    
    const mask = bits === 32 ? 0xffffffff : ~((1 << (32 - bits)) - 1);
    return (clientLong & mask) === (rangeLong & mask);
  } catch (err) {
    return false;
  }
}
