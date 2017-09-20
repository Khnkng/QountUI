/**
 * Created by seshu on 09-03-2016.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var abstractForm = (function () {
    function abstractForm() {
    }
    abstractForm.prototype.getForm = function (model) {
        return undefined;
    };
    abstractForm.prototype.getData = function (group) {
        var data = {};
        for (var key in group.controls) {
            data[key] = group.controls[key].value;
        }
        return data;
    };
    abstractForm.prototype.updateForm = function (_form, obj) {
        if (obj) {
            for (var key in obj) {
                var control = _form.controls[key];
                if (control && control.patchValue) {
                    if (!(obj[key] instanceof Array)) {
                        if (obj[key])
                            control.patchValue(obj[key]);
                    }
                }
            }
        }
        else {
            for (var key in _form.controls) {
                var control = _form.controls[key];
                if (control && control.patchValue) {
                    if (!(obj[key] instanceof Array)) {
                        control.patchValue(null);
                    }
                }
            }
        }
    };
    return abstractForm;
}());
exports.abstractForm = abstractForm;
