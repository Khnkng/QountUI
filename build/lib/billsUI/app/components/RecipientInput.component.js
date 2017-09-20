/**
 * Created by seshu on 28-03-2016.
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
var Users_service_1 = require("../services/Users.service");
var RecipientInputComponent = (function () {
    function RecipientInputComponent(elementRef, usersService) {
        this.elementRef = elementRef;
        this.usersService = usersService;
        this.entered = new core_1.EventEmitter();
        this.removerecipient = new core_1.EventEmitter();
        if (this.recipients == undefined) {
            this.recipients = [];
        }
        if (this.skipCheck == undefined) {
            this.skipCheck = false;
        }
    }
    RecipientInputComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        var base = this;
        this.input = jQuery(this.elementRef.nativeElement).find('input');
        this.input.autocomplete({
            minLength: 0,
            autoFocus: true,
            position: { my: "left bottom", at: "left top" },
            source: function (req, res) { return _this.getUsersByPrefix(req, res); },
            select: function (event, ui) {
                console.log("selected", ui);
                var recipient = {};
                recipient['name'] = ui.item.label;
                recipient['id'] = ui.item.value;
                base.recipients.push(recipient);
                base.input.val("");
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return jQuery("<li>").data("ui-autocomplete-item", item)
                .append("<div>" + item.value + "</div>")
                .append("<div>" + item.label + "</div>")
                .appendTo(ul);
        };
    };
    RecipientInputComponent.prototype.showError = function (error) {
    };
    RecipientInputComponent.prototype.getUsersByPrefix = function (req, res) {
        var _this = this;
        console.log("term", req.term);
        //removing @ check ot use this element at group list page
        if (this.skipCheck || req.term.indexOf('@') == 0 && req.term.length > 1) {
            var term = req.term;
            term = term.substring(1, term.length);
            this.usersService.getUsersByPrefix(term).subscribe(function (users) { return res(jQuery.map(users, function (user) {
                return {
                    label: user.fullName,
                    value: user.id
                };
            }), function (error) { return _this.showError(error); }); });
        }
    };
    RecipientInputComponent.prototype.removeRecipient = function (recipient, ev) {
        ev.preventDefault();
        ev.stopPropagation();
        _.remove(this.recipients, function (_recipient) {
            return _recipient.id === recipient.id;
        });
        this.removerecipient.emit(recipient.id);
    };
    RecipientInputComponent.prototype.onKey = function (event) {
        if (event.code == "Enter") {
            var recipientInput = {
                recipients: this.recipients,
                comment: this.input.val()
            };
            this.entered.emit(recipientInput);
            this.input.val("");
            this.recipients = [];
        }
    };
    return RecipientInputComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], RecipientInputComponent.prototype, "recipients", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], RecipientInputComponent.prototype, "skipCheck", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], RecipientInputComponent.prototype, "entered", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], RecipientInputComponent.prototype, "removerecipient", void 0);
RecipientInputComponent = __decorate([
    core_1.Component({
        selector: 'recipient-input',
        templateUrl: '/app/views/recipientInput.html'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, Users_service_1.UsersService])
], RecipientInputComponent);
exports.RecipientInputComponent = RecipientInputComponent;
