import multer from "multer";

exports.bulkKYCApproveUpload = function (name) {
  const max = 100;
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./public/users/`);
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    },
  });
  return storage;
};