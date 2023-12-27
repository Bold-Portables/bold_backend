const multer = require("multer");


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "profile_picture") {
            cb(null, "public/profile");
        } else if (file.fieldname === "product_image") {
            cb(null, "public/products");
        } else if (file.fieldname === "service_image") {
            cb(null, "public/services");
        } else {
            cb(new Error("Invalid field name"), false);
        }
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

module.exports = upload;
