import { body, ValidationChain } from 'express-validator';
import multer from 'multer';

export const fileUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Allow only one file
  }
});

export class AuthValidators {
  static registerCustomer(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('يرجى إدخال اسمك الكامل')
        .isLength({ min: 2, max: 100 })
        .withMessage('يجب أن يكون الاسم بين 2 و 100 حرف')
        .withMessage('يمكن أن يحتوي الاسم فقط على أحرف وأرقام ومسافات'),
      body('email')
        .trim()
        .notEmpty()
        .withMessage('يرجى إدخال بريدك الإلكتروني')
        .isEmail()
        .withMessage('يرجى إدخال بريد إلكتروني صحيح (مثال: user@example.com)')
        .normalizeEmail({ gmail_remove_dots: false })
        .isLength({ max: 255 })
        .withMessage('عنوان البريد الإلكتروني طويل جداً')
        .custom((value) => {
          const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const parts = value.split('@');
          if (parts.length !== 2 || !domainRegex.test(parts[1])) {
            throw new Error('يرجى إدخال نطاق بريد إلكتروني صحيح');
          }
          if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
            throw new Error('نطاق البريد الإلكتروني يحتوي على امتدادات غير صحيحة');
          }
          return true;
        }),
      body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('يرجى إدخال رقم هاتفك المحمول'),
      // .matches(/^[0-9]{10,15}$/)
      // .withMessage('Mobile number must be 10-15 digits'),
      body('password')
        .notEmpty()
        .withMessage('يرجى إدخال كلمة المرور')
        .isLength({ min: 6, max: 100 })
        .withMessage('يجب أن تكون كلمة المرور بين 6 و 100 حرف')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل، وحرف كبير واحد على الأقل، ورقم واحد على الأقل'),
    ];
  }

  static registerRestaurantOwner(): ValidationChain[] {
    return [
      body('restaurantName')
        .trim()
        .notEmpty()
        .withMessage('يرجى إدخال اسم المطعم')
        .isLength({ min: 2, max: 255 })
        .withMessage('يجب أن يكون اسم المطعم بين 2 و 255 حرف'),
      body('organizationNumber')
        .trim()
        .notEmpty()
        .withMessage('يرجى إدخال رقم السجل التجاري')
        .isLength({ min: 5, max: 50 })
        .withMessage('يجب أن يكون رقم السجل التجاري بين 5 و 50 حرف')
        .matches(/^[A-Z0-9]+$/)
        .withMessage('يجب أن يحتوي رقم السجل التجاري على أحرف كبيرة وأرقام فقط'),
      body('email')
        .trim()
        .notEmpty()
        .withMessage('البريد الإلكتروني مطلوب')
        .isEmail()
        .withMessage('تنسيق البريد الإلكتروني غير صحيح')
        .normalizeEmail({ gmail_remove_dots: false })
        .isLength({ max: 255 })
        .withMessage('يجب ألا يتجاوز البريد الإلكتروني 255 حرفًا')
        .custom((value) => {
          const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const parts = value.split('@');
          if (parts.length !== 2 || !domainRegex.test(parts[1])) {
            throw new Error('نطاق البريد الإلكتروني غير صحيح (مثال: بدون تكرار .com)');
          }
          if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
            throw new Error('نطاق البريد الإلكتروني يحتوي على امتدادات مكررة');
          }
          return true;
        }),
      body('mobileNumber')
        .trim()
        .notEmpty()
        .withMessage('رقم الهاتف المحمول مطلوب'),
      // .matches(/^[0-9]{10,15}$/)
      // .withMessage('Mobile number must be 10-15 digits'),
      body('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة')
        .isLength({ min: 6, max: 100 })
        .withMessage('يجب أن تكون كلمة المرور بين 6 و 100 حرف')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل، وحرف كبير واحد على الأقل، ورقم واحد على الأقل'),
    ];
  }

  static login(): ValidationChain[] {
    return [
      body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('تنسيق البريد الإلكتروني غير صحيح')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('يجب ألا يتجاوز البريد الإلكتروني 255 حرفًا')
        .custom((value) => {
          if (!value) return true;
          const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          const parts = value.split('@');
          if (parts.length !== 2 || !domainRegex.test(parts[1])) {
            throw new Error('نطاق البريد الإلكتروني غير صحيح (مثال: بدون تكرار .com)');
          }
          if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
            throw new Error('نطاق البريد الإلكتروني يحتوي على امتدادات مكررة');
          }
          return true;
        }),
      body('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة')
        .isLength({ min: 6 })
        .withMessage('يجب ألا تقل كلمة المرور عن 6 أحرف'),
      body().custom((value) => {
        if (!value.email) {
          throw new Error('البريد الإلكتروني مطلوب');
        }
        return true;
      })
    ];
  }

  static changePassword(): ValidationChain[] {
    return [
      body('oldPassword')
        .notEmpty()
        .withMessage('كلمة المرور القديمة مطلوبة')
        .isLength({ min: 6, max: 100 })
        .withMessage('يجب أن تكون كلمة المرور القديمة بين 6 و 100 حرف'),
      body('newPassword')
        .notEmpty()
        .withMessage('كلمة المرور الجديدة مطلوبة')
        .isLength({ min: 6, max: 100 })
        .withMessage('يجب أن تكون كلمة المرور الجديدة بين 6 و 100 حرف')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('يجب أن تحتوي كلمة المرور الجديدة على حرف صغير واحد على الأقل، وحرف كبير واحد على الأقل، ورقم واحد على الأقل'),
      body('confirmPassword')
        .notEmpty()
        .withMessage('يرجى تأكيد كلمة المرور الجديدة')
        .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
            throw new Error('كلمتا المرور غير متطابقتين');
          }
          return true;
        })
    ];
  }

  static updateRestaurantLocation(): ValidationChain[] {
    return [
      body('address')
        .trim()
        .notEmpty()
        .withMessage('العنوان مطلوب')
        .isLength({ max: 255 })
        .withMessage('يجب ألا يتجاوز العنوان 255 حرفًا'),
      body('latitude')
        .notEmpty()
        .withMessage('خط العرض مطلوب')
        .isFloat({ min: -90, max: 90 })
        .withMessage('يجب أن يكون خط العرض رقمًا بين -90 و 90'),
      body('longitude')
        .notEmpty()
        .withMessage('خط الطول مطلوب')
        .isFloat({ min: -180, max: 180 })
        .withMessage('يجب أن يكون خط الطول رقمًا بين -180 و 180'),
    ];
  }

  static validateProfileImage(): ValidationChain[] {
    return [
      body('profileImage')
        .custom((_, { req }) => {
          if (!req.file) {
            throw new Error('صورة الملف الشخصي مطلوبة');
          }
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (!allowedTypes.includes(req.file.mimetype)) {
            throw new Error('يسمح فقط بصور JPEG و PNG و GIF');
          }
          return true;
        })
    ];
  }

  static updateCustomerProfile(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('يرجى إدخال اسمك الكامل')
        .isLength({ min: 2, max: 100 })
        .withMessage('يجب أن يكون الاسم بين 2 و 100 حرف')
        .withMessage('يمكن أن يحتوي الاسم فقط على أحرف وأرقام ومسافات'), body('email')
          .trim()
          .notEmpty()
          .withMessage('البريد الإلكتروني مطلوب')
          .isEmail()
          .withMessage('تنسيق البريد الإلكتروني غير صحيح')
          .normalizeEmail()
          .isLength({ max: 255 })
          .withMessage('يجب ألا يتجاوز البريد الإلكتروني 255 حرفًا')
          .custom((value) => {
            const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const parts = value.split('@');
            if (parts.length !== 2 || !domainRegex.test(parts[1])) {
              throw new Error('نطاق البريد الإلكتروني غير صحيح (مثال: بدون تكرار .com)');
            }
            if (parts[1].includes('.com.com') || parts[1].match(/(\.\w+)\1/)) {
              throw new Error('نطاق البريد الإلكتروني يحتوي على امتدادات مكررة');
            }
            return true;
          }), body('mobileNumber').optional().isString().withMessage('يجب أن يكون رقم الهاتف المحمول نصًا'),
      body('about').optional().isString().isLength({ max: 500 }).withMessage('يجب ألا يتجاوز الوصف 500 حرف'),
      body('gender').optional().isIn(['male', 'female']).withMessage('يجب أن يكون الجنس ذكر أو أنثى'),
      // body('profileImageUrl').optional().isString().withMessage('Profile image URL must be a string'),
    ];
  }


}
