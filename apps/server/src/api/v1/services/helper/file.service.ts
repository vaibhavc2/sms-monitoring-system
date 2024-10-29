import { logger } from '#/common/utils/logger.util';
import fs from 'fs';
import path from 'path';

class FileService {
  deleteFile(fileName: string) {
    const filePath = path.join(process.cwd(), 'uploads', 'scripts', fileName);

    // delete the file asynchronously (built-in fs module)
    fs.unlink(filePath, (err: any) => {
      if (err) {
        logger.error('Error deleting file: ' + err);
        return;
      }
    });
  }
}

const fileService = new FileService();
export default fileService;
