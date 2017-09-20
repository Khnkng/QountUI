"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CreditCardType = (function () {
    function CreditCardType() {
        this.AmericanExpress = /^(?:3[47][0-9]{13})$/;
        this.Visa = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
        this.Master = /^(?:5[1-5][0-9]{14})$/;
        this.Discover = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
        this.DinnerClub = /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/;
        this.JCB = /^(?:(?:2131|1800|35\d{3})\d{11})$/;
    }
    CreditCardType.prototype.validateCreditCard = function (cardNumber, cvv) {
        var obj = {
            valid: false,
            type: 'None'
        };
        if (cardNumber && cvv) {
            if (cardNumber.match(this.AmericanExpress) && cvv.length == 4) {
                obj.valid = true;
                obj.type = 'American Express';
            }
            else if (cardNumber.match(this.Visa) && cvv.length == 3) {
                obj.valid = true;
                obj.type = 'Visa';
            }
            else if (cardNumber.match(this.Master) && cvv.length == 3) {
                obj.valid = true;
                obj.type = 'Master';
            }
            else if (cardNumber.match(this.Discover) && cvv.length == 3) {
                obj.valid = true;
                obj.type = 'Discover';
            }
            else if (cardNumber.match(this.DinnerClub) && cvv.length == 3) {
                obj.valid = true;
                obj.type = 'Dinner Club';
            }
            else if (cardNumber.match(this.JCB) && cvv.length == 3) {
                obj.valid = true;
                obj.type = 'JCB';
            }
        }
        return obj;
    };
    return CreditCardType;
}());
exports.CreditCardType = CreditCardType;
