import multer from "multer";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    cb(null, `${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const mimetypeOk = allowed.test(file.mimetype);
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mimetypeOk && extOk) cb(null, true);
  else cb(new Error("Only image files are allowed (jpg, png, gif)"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter,
});