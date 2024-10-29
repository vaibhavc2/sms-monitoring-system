import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ct from '../constants';

class FileMiddleware {
  public upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, ct.files.uploadPath);
      },
      filename: function (req, file, cb) {
        req.fileName = file.originalname;

        const serverFileName =
          uuidv4() + '-' + Date.now() + '-' + file.originalname;

        req.serverFileName = serverFileName;

        // send this original name to the
        cb(null, serverFileName);
      },
    }),
  }).single('file');
}

const fileMiddleware = new FileMiddleware();

export default fileMiddleware;
