const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("./aws");

const s3 = new aws.S3();

const multerStorageS3 = multerS3({
  s3: s3,
  bucket: "boldaws",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    let directory

    if (file.fieldname === "profile_picture"){
      directory = "images/profile";

    } else if (file.fieldname === "product_image"){
      directory = "images/products"

    } else {
      directory = "images/services"
    }

    const ext = file.mimetype.split("/")[1];
    const filename = `${file.fieldname}-${Date.now()}.${ext}`;
    const key = `${directory}/${filename}`;
    cb(null, key);
  }
})

const filter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
}

const upload = multer({
    storage: multerStorageS3,
    fileFilter: filter,
});

module.exports = upload;
