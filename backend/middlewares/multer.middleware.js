import multer from "multer";

const localStorageUsingMulter = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const uploader = multer({
  storage: localStorageUsingMulter,
});
