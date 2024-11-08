import envConfig from '#/common/config/env.config';
import ct from '#/common/constants';

class CipherService {
  private readonly alphabet: string;
  private readonly base = ct.encoding.base;
  private readonly offset: number;

  constructor(alphabet: string, offset: number) {
    this.offset = offset;
    this.alphabet = alphabet;
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

const { ENCODING_ALPHABET, ENCODING_OFFSET } = envConfig;

const cipherService = new CipherService(ENCODING_ALPHABET, ENCODING_OFFSET);
export default cipherService;
