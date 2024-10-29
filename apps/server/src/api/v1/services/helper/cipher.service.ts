import envConfig from '#/common/config/env.config';
import ct from '#/common/constants';

class CipherService {
  private readonly alphabet = ct.encoding.alphabet;
  private readonly base = ct.encoding.base;
  private readonly offset: number;

  constructor(offset: number) {
    this.offset = offset;
  }

  encodeId(id: number): string {
    let encoded = '';
    let value = id + this.offset;
    while (value > 0) {
      encoded = this.alphabet[value % this.base] + encoded;
      value = Math.floor(value / this.base);
    }
    return encoded;
  }

  decodeId(encodedId: string): number {
    let decoded = 0;
    for (let i = 0; i < encodedId.length; i++) {
      decoded = decoded * this.base + this.alphabet.indexOf(encodedId[i]);
    }
    return decoded - this.offset;
  }
}

const cipherService = new CipherService(envConfig.CIPHER_OFFSET);
export default cipherService;
