const apiResponse = require("../helpers/apiResponse");
const db = require('../models/index');
const Teacher_class = db.teacher_class;
const Course = db.courses;
const Pd_Course = db.pd_Courses;
const Course_platform = db.course_platform;
const { constant } = require('./middleware.constants');
const { isFileValid } = require( '../services/common.service');
const { No_course_found, No_class_found, Course_exists } = constant
const classCodeExists = () => {
    return async (req, res, next) => {
        const class_Code_Exists = await Teacher_class.findOne({
            where: { class_code: req.body.class_code },
        });
        if (!class_Code_Exists) {
            return apiResponse.ErrorResponse(res, No_class_found);
        }
        else {
            next();
        }
    }
}

const courseCodeExisted = () => {
    return async (req, res, next) => {
        const course_Code_Exists = await Course_platform.findOne({
            where: { course_code: req.body.course_code },
        });
        if (!course_Code_Exists) {
            return apiResponse.ErrorResponse(res, No_class_found);
        }
        else {
            next();
        }
    }
}



// find if course code exists
const courseCodeExists = async obj => {
    return await Course_platform.findOne({
        where: obj,
    });
};


const classCoursesExists = () => {
    return async (req, res, next) => {
        const class_Course_Exists = await Course.findOne({
            where: { class_code: req.body.class_code, week_number: req.body.week_number },
        });
        if (!class_Course_Exists) {
            return apiResponse.ErrorResponse(res, No_course_found);
        }
        else {
            req.course_id = class_Course_Exists.dataValues.id;
            next();
        }
    }
}


const pdCoursesExists = () => {
    return async (req, res, next) => {
        const pd_Course_Exists = await Pd_Course.findOne({
            where: { course_code: req.body.course_code, week_number: req.body.week_number },
        });
        if (!pd_Course_Exists) {
            return apiResponse.ErrorResponse(res, No_course_found);
        }
        else {
            req.course_id = pd_Course_Exists.dataValues.id;
            next();
        }
    }
}


const courseIdExists = () => {
    return async (req, res, next) => {
        const { id } = req.params;
        const class_Course_Id_Exists = await Course.findOne({
            where: { id }
        });
        if (!class_Course_Id_Exists) {
            return apiResponse.ErrorResponse(res, No_course_found);
        }
        else {
            req.course_id = id;
            next();
        }
    }
}

const pdCourseIdExists = () => {
    return async (req, res, next) => {
        const { id } = req.params;
        const pd_Course_Id_Exists = await Pd_Course.findOne({
            where: { id }
        });
        if (!pd_Course_Id_Exists) {
            return apiResponse.ErrorResponse(res, No_course_found);
        }
        else {
            req.course_id = id;
            next();
        }
    }
}

const classCoursesDetailsExists = () => {
    return async (req, res, next) => {
        const class_Course_Exists = await Course.findOne({
            where: { class_code: req.body.class_code, week_number: req.body.week_number },
        });
        if (class_Course_Exists) {
            return apiResponse.ErrorResponseWithData(res, Course_exists, class_Course_Exists);
        }
        else {
            next();
        }
    }
}

const pdCoursesDetailsExists = () => {
    return async (req, res, next) => {
        const class_Course_Exists = await Pd_Course.findOne({
            where: { course_code: req.body.course_code, week_number: req.body.week_number },
        });
        if (class_Course_Exists) {
            return apiResponse.ErrorResponseWithData(res, Course_exists, class_Course_Exists);
        }
        else {
            next();
        }
    }
}

const weeklyCoursesDetailsExists = () => {
    return async (req, res, next) => {
        const weekly_Course_Exists = await Course.findOne({
            where: { class_code: req.body.class_code, week_number: req.body.week_id },
        });
        if (!weekly_Course_Exists) {
            return apiResponse.ErrorResponse(res, No_course_found);
        }
        else {
            req.course_id = weekly_Course_Exists.dataValues.id;
            next();
        }
    }
}


const validateFilesForCreateCourse = () => {
    return async (req, res, next) => {
        let files = req.body.files;
        if(files.file_details === undefined) {
            return apiResponse.ErrorResponse(res, "No file find");
        } else {            
            if(!Array.isArray(files.file_details)) {
                let file = files.file_details;
                if( !isFileValid(file) ) {
                    return apiResponse.ErrorResponse(res, 'File type not supported')
                }
            } else {
                files.file_details.forEach(file => {                    
                    if( !isFileValid(file) ) {
                        return apiResponse.ErrorResponse(res, 'File type not supported')
                    }
                });
            }            
        }
        next();
    }
}

module.exports = {
    classCodeExists,
    classCoursesExists,
    courseIdExists,
    classCoursesDetailsExists,
    weeklyCoursesDetailsExists,
    validateFilesForCreateCourse,
    courseCodeExists,
    courseCodeExisted,
    pdCoursesDetailsExists,
    pdCoursesExists,
    pdCourseIdExists
}