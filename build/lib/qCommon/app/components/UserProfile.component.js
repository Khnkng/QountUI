/**
 * Created by Mateen on 03-05-2016.
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
var Login_service_1 = require("../services/Login.service");
var UserProfile_service_1 = require("../services/UserProfile.service");
var router_1 = require("@angular/router");
var Session_1 = require("../services/Session");
var Toast_service_1 = require("../services/Toast.service");
var Qount_constants_1 = require("../constants/Qount.constants");
var UserProfileComponent = (function () {
    function UserProfileComponent(_userProfileService, _router, loginService, toastService) {
        this._userProfileService = _userProfileService;
        this._router = _router;
        this.loginService = loginService;
        this.toastService = toastService;
        this.hasLoaded = false;
        this.profileTabVisibility = false;
        this.securityTabVisibility = false;
        this.settingsTabVisibility = false;
        this.isUserNameExpanded = false;
        this.isEmailExpanded = false;
        this.initial = "";
        this.fullName = "";
        this.showImageLabel = false;
        this.passwordStrengthMsg = "";
        this.data = {};
        console.info('QountApp User Profile Component Mounted Successfully!');
        this.profileTabVisibility = true;
        this.user = Session_1.Session.get('user');
        if (this.user) {
            debugger;
            this.initial = (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
            this.fullName = this.user.firstName + " " + this.user.lastName;
        }
    }
    UserProfileComponent.prototype.ngOnDestroy = function () {
        //this._dbResetSubscription.unsubscribe();
    };
    UserProfileComponent.prototype.ngOnInit = function () {
        jQuery(document).ready(function () {
            jQuery("#newPassword").complexify({}, function (valid, complexity) {
                console.log('valid=' + valid + 'complexity=' + complexity);
                var elem = document.getElementById("progressBar");
                var pwdLabelElem = jQuery('#passwordStrengthLabel');
                var width = Math.floor(complexity);
                if (width > 0 && width < 25) {
                    elem.style.backgroundColor = "rgb(200, 24, 24)";
                    pwdLabelElem.text('Weak').css({ 'color': 'rgb(200, 24, 24)' });
                }
                else if (width > 25 && width < 50) {
                    elem.style.backgroundColor = "rgb(255, 172, 29)";
                    pwdLabelElem.text('So so').css({ 'color': 'rgb(255, 172, 29)' });
                }
                else if (width > 50) {
                    elem.style.backgroundColor = "rgb(39, 179, 15)";
                    pwdLabelElem.text('Great!').css({ 'color': 'rgb(39, 179, 15)' });
                }
                elem.style.width = width + '%';
            });
            setTimeout(function () {
                jQuery(document).foundation();
                //jQuery(".user-profile-photo").css({"padding": "50%","visibility":"visible"});
                //jQuery(".user-profile-photo-label").css({"margin": "25%"});
            }, 1000);
        });
    };
    UserProfileComponent.prototype.ngAfterContentInit = function () {
    };
    UserProfileComponent.prototype.showSelectedTab = function (selectedTab) {
        this.profileTabVisibility = false;
        this.securityTabVisibility = false;
        this.settingsTabVisibility = false;
        if (selectedTab) {
            switch (selectedTab) {
                case "profile":
                    this.profileTabVisibility = true;
                    break;
                case "security":
                    this.securityTabVisibility = true;
                    break;
                case "settings":
                    this.settingsTabVisibility = true;
                    break;
            }
        }
    };
    UserProfileComponent.prototype.userDetailsEditMode = function () {
        jQuery("#userFirstName").val(this.user.firstName);
        jQuery("#userLastName").val(this.user.lastName);
        jQuery("#userPhoneNumber").val(this.user.phone_number);
    };
    UserProfileComponent.prototype.userNameExpand = function (event) {
        this.isUserNameExpanded = event.currentTarget.checked;
        jQuery("#securityUserNameInput").val(this.user.firstName);
    };
    UserProfileComponent.prototype.emailExpand = function (event) {
        this.isEmailExpanded = event.currentTarget.checked;
    };
    UserProfileComponent.prototype.openFileSelectDialog = function () {
        jQuery("#userProfilePicture").click();
    };
    UserProfileComponent.prototype.changePassword = function () {
        var oldPassword = jQuery("#oldPassword").val();
        var newPassword = jQuery("#newPassword").val();
        var pwdChngInput = {
            "oldPassword": oldPassword,
            "newPassword": newPassword,
            "userId": this.user.id
        };
    };
    UserProfileComponent.prototype.uploadImage = function () {
        jQuery("#uploadImage").click();
    };
    UserProfileComponent.prototype.saveChanges = function () {
        //jQuery("#saveChanges").addClass("user-profile-save-loading").text("");
        var user_prfofile_input = {};
        if (this.user.firstName) {
            user_prfofile_input["firstName"] = this.user.firstName;
        }
        if (this.user.lastName) {
            user_prfofile_input["lastName"] = this.user.lastName;
        }
        if (this.user.phone_number) {
            user_prfofile_input["phoneNumber"] = this.user.phone_number;
        }
        var newPassword = jQuery("#newPassword").val();
        if (newPassword) {
            user_prfofile_input["newPassword"] = newPassword;
        }
        var oldPassword = jQuery("#currentPassword").val();
        ;
        if (oldPassword) {
            user_prfofile_input["oldPassword"] = oldPassword;
        }
        /*this.data.username=this.user.id;
        this.data.oldPassword=oldPassword;*/
        this.updateUserProfile(user_prfofile_input);
        /*this.loginService.login(<LoginModel>this.data)
          .subscribe(success  => this.updateUserProfile(user_prfofile_input), error =>  this.showSaveMessage(error));*/
    };
    UserProfileComponent.prototype.showSaveMessage = function (error) {
        //jQuery("#saveChanges").removeClass("user-profile-save-loading").text("SaveChanges");
        //alert(error);
        this.emptyPasswords();
        this.showDialog(true, error);
    };
    UserProfileComponent.prototype.emptyPasswords = function () {
        jQuery("#currentPassword").val("");
        jQuery("#newPassword").val("");
    };
    UserProfileComponent.prototype.updateUserProfile = function (user_prfofile_input) {
        var _this = this;
        this._userProfileService.updateUserProfile(user_prfofile_input)
            .subscribe(function (response) { return _this.showServiceStatus(response); }, function (error) { return _this.showServiceStatus(error); });
    };
    UserProfileComponent.prototype.showServiceStatus = function (response) {
        //jQuery("#saveChanges").removeClass("user-profile-save-loading").text("SaveChanges");
        //alert(response._body);
        this.emptyPasswords();
        this.showDialog(false, "Profile updated successfully");
    };
    UserProfileComponent.prototype.goToDashboard = function () {
        var link = [''];
        this._router.navigate(link);
    };
    UserProfileComponent.prototype.showDialog = function (error, msg) {
        if (!error) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.success, msg);
        }
        else if (error) {
            this.toastService.pop(Qount_constants_1.TOAST_TYPE.error, msg);
        }
    };
    return UserProfileComponent;
}());
UserProfileComponent = __decorate([
    core_1.Component({
        selector: 'user-profile',
        templateUrl: '/app/views/userProfile.html',
    }),
    __metadata("design:paramtypes", [UserProfile_service_1.UserProfileService, router_1.Router, Login_service_1.LoginService, Toast_service_1.ToastService])
], UserProfileComponent);
exports.UserProfileComponent = UserProfileComponent;
