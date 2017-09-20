/**
 * Created by seshu on 06-08-2016.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckBoxValidator = (function () {
    function CheckBoxValidator() {
    }
    CheckBoxValidator.hasChecked = function (c) {
        console.log("valid", c.value === true);
        return c.value === true;
    };
    return CheckBoxValidator;
}());
exports.CheckBoxValidator = CheckBoxValidator;
