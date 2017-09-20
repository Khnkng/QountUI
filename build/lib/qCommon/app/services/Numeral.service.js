/**
 * Created by seshagirivellanki on 17/02/17.
 */
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
var core_1 = require("@angular/core");
var Currency_constants_1 = require("../constants/Currency.constants");
var NumeralService = (function () {
    function NumeralService() {
        this.registerLocales();
    }
    NumeralService.prototype.format = function (format, value) {
        return numeral(numeral(value).value()).format(format);
    };
    NumeralService.prototype.value = function (value) {
        return numeral(value).value();
    };
    NumeralService.prototype.switchLocale = function (locale) {
        var _locale = Currency_constants_1.LOCALE_MAPPER[locale.toLowerCase()];
        numeral.locale(_locale ? _locale : locale.toLowerCase());
    };
    NumeralService.prototype.registerLocales = function () {
        try {
            numeral.register('locale', 'ind', {
                delimiters: {
                    thousands: ' ',
                    decimal: '.'
                },
                abbreviations: {
                    thousand: 'k',
                    million: 'm',
                    billion: 'b',
                    trillion: 't'
                },
                ordinal: function (number) {
                    var b = number % 10;
                    return (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                },
                currency: {
                    symbol: '₹'
                }
            });
        }
        catch (e) {
        }
        try {
            numeral.register('locale', 'en-gb', {
                delimiters: {
                    thousands: ',',
                    decimal: '.'
                },
                abbreviations: {
                    thousand: 'k',
                    million: 'm',
                    billion: 'b',
                    trillion: 't'
                },
                ordinal: function (number) {
                    var b = number % 10;
                    return (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                },
                currency: {
                    symbol: '£'
                }
            });
        }
        catch (e) {
        }
        try {
            numeral.register('locale', 'en-eur', {
                delimiters: {
                    thousands: ',',
                    decimal: '.'
                },
                abbreviations: {
                    thousand: 'k',
                    million: 'm',
                    billion: 'b',
                    trillion: 't'
                },
                ordinal: function (number) {
                    var b = number % 10;
                    return (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                },
                currency: {
                    symbol: '€'
                }
            });
        }
        catch (e) {
        }
        try {
            numeral.register('locale', 'en-au', {
                delimiters: {
                    thousands: ',',
                    decimal: '.'
                },
                abbreviations: {
                    thousand: 'k',
                    million: 'm',
                    billion: 'b',
                    trillion: 't'
                },
                ordinal: function (number) {
                    var b = number % 10;
                    return (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                },
                currency: {
                    symbol: '$'
                }
            });
        }
        catch (e) {
        }
    };
    return NumeralService;
}());
NumeralService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], NumeralService);
exports.NumeralService = NumeralService;
