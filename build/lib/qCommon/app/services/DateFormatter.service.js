"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by venkatkollikonda on 20/04/17.
 */
var core_1 = require("@angular/core");
var Session_1 = require("../services/Session");
var DateFormater = (function () {
    function DateFormater() {
    }
    DateFormater.prototype.formatDate = function (input, currentFormat, ExpectedFormat) {
        return moment(input, currentFormat).format(ExpectedFormat);
    };
    ;
    DateFormater.prototype.getFormat = function () {
        var type = Session_1.Session.getCurrentCompanyCurrency();
        if (type == 'INR') {
            return 'DD/MM/YYYY';
        }
        else {
            return 'MM/DD/YYYY';
        }
    };
    ;
    DateFormater.prototype.getServiceDateformat = function () {
        return 'MM/DD/YYYY';
    };
    return DateFormater;
}());
DateFormater = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], DateFormater);
exports.DateFormater = DateFormater;
