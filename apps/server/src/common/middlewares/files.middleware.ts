import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ct from '../constants';

class FilesMiddleware {
  public upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, ct.files.uploadPath);
      },
      filename: function (req, file, cb) {
        req.originalFileName = file.originalname
          .split('.')
          .slice(0, -1)
          .join('.');

        // send this original name to the
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
      },
    }),
  }).single('file');
}

const filesMiddleware = new FilesMiddleware();

export default filesMiddleware;
