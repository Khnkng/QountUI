"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var StateService = (function () {
    function StateService() {
        this.states = [];
    }
    StateService.prototype.pop = function () {
        var state = this.states.pop();
        return state;
    };
    StateService.prototype.addState = function (state) {
        this.states.push(state);
    };
    StateService.prototype.getPrevState = function () {
        if (this.states.length == 0) {
            return null;
        }
        else {
            return this.states[this.states.length - 1];
        }
    };
    StateService.prototype.clearAllStates = function () {
        this.states = [];
    };
    return StateService;
}());
StateService = __decorate([
    core_1.Injectable()
], StateService);
exports.StateService = StateService;
