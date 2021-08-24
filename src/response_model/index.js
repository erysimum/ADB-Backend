/**
 * @description define success / error response
 */

class BaseModal {
  constructor({ code, data = {}, msg, success }) {
    /*
      {
        "code": 20000,
        "data": {},
        "msg": "string",
        "success": false
      }
    */
    this.code = code;
    this.data = data;
    this.msg = msg;
    this.success = success;
  }
}

class SuccessModal extends BaseModal {
  constructor({ code = 20000, data, success = true, msg = '' }) {
    super({ code, data, success, msg });
  }
}

class ErrorModal extends BaseModal {
  constructor({ code = 20001, data, success = false, msg = '' }) {
    super({ code, data, success, msg });
  }
}

module.exports = {
  SuccessModal,
  ErrorModal,
};
