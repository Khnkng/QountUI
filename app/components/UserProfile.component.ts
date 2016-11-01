/**
 * Created by Mateen on 03-05-2016.
 */


import {Component, OnInit, OnDestroy, AfterContentInit} from "@angular/core";
import {LoginService} from "../services/Login.service";
import {LoginModel} from "../models/Login.model";
import {UserProfileService} from "../services/UserProfile.service";
import {UserModel} from "../share/models/User.model";
import {Session} from "../share/services/Session";
import {Router} from "@angular/router";
import {ToastService} from "../share/services/Toast.service";
import {TOAST_TYPE} from "../share/constants/Qount.constants";

declare var jQuery:any;

@Component({
  selector: 'user-profile',
  templateUrl: '/app/views/userProfile.html',
})

export class UserProfileComponent implements OnDestroy, OnInit, AfterContentInit {
  hasLoaded = false;
  profileTabVisibility:boolean = false;
  securityTabVisibility:boolean = false;
  settingsTabVisibility:boolean = false;
  isUserNameExpanded:boolean = false;
  isEmailExpanded:boolean = false;
  user:UserModel;
  initial:string = "";
  fullName:string = "";
  showImageLabel:boolean = false;
  passwordStrengthMsg:string="";
  data:LoginModel=<LoginModel>{};

  ngOnDestroy() {
    //this._dbResetSubscription.unsubscribe();
  }

  ngOnInit() {
    jQuery(document).ready(function () {
      jQuery("#newPassword").complexify({}, function (valid, complexity) {
        console.log('valid=' + valid + 'complexity=' + complexity);
        var elem = document.getElementById("progressBar");
        var pwdLabelElem=jQuery('#passwordStrengthLabel');
        var width = Math.floor(complexity);
        if (width > 0 && width < 25) {
          elem.style.backgroundColor = "rgb(200, 24, 24)";
          pwdLabelElem.text('Weak').css({'color':'rgb(200, 24, 24)'});
        } else if (width > 25 && width < 50) {
          elem.style.backgroundColor = "rgb(255, 172, 29)";
          pwdLabelElem.text('So so').css({'color':'rgb(255, 172, 29)'});
        } else if (width > 50) {
          elem.style.backgroundColor = "rgb(39, 179, 15)";
          pwdLabelElem.text('Great!').css({'color':'rgb(39, 179, 15)'});
        }
        elem.style.width = width + '%';
      });
      setTimeout(function () {
        jQuery(document).foundation();
        //jQuery(".user-profile-photo").css({"padding": "50%","visibility":"visible"});
        //jQuery(".user-profile-photo-label").css({"margin": "25%"});
      }, 1000);

    });
  }

  constructor(private _userProfileService:UserProfileService, private _router:Router, private loginService: LoginService, private toastService:ToastService) {
    console.info('QountApp User Profile Component Mounted Successfully!');
    this.profileTabVisibility = true;
    this.user = Session.get('user');
    if (this.user) {
      debugger;
      this.initial = (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
      this.fullName = this.user.firstName + " " + this.user.lastName;
    }
  }

  ngAfterContentInit() {
  }

  showSelectedTab(selectedTab) {
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
  }

  userDetailsEditMode() {
    jQuery("#userFirstName").val(this.user.firstName);
    jQuery("#userLastName").val(this.user.lastName);
    jQuery("#userPhoneNumber").val(this.user.phone_number);
  }

  userNameExpand(event) {
    this.isUserNameExpanded = event.currentTarget.checked;
    jQuery("#securityUserNameInput").val(this.user.firstName);
  }

  emailExpand(event) {
    this.isEmailExpanded = event.currentTarget.checked;
  }

  openFileSelectDialog() {
    jQuery("#userProfilePicture").click();
  }

  changePassword() {
    var oldPassword = jQuery("#oldPassword").val();
    var newPassword = jQuery("#newPassword").val();
    var pwdChngInput = {
      "oldPassword": oldPassword,
      "newPassword": newPassword,
      "userId": this.user.id
    }
  }

  uploadImage() {
    jQuery("#uploadImage").click();
  }

  saveChanges() {
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
    var oldPassword = jQuery("#currentPassword").val();;
    if (oldPassword) {
      user_prfofile_input["oldPassword"] = oldPassword;
    }
    /*this.data.username=this.user.id;
    this.data.oldPassword=oldPassword;*/
    this.updateUserProfile(user_prfofile_input);

    /*this.loginService.login(<LoginModel>this.data)
      .subscribe(success  => this.updateUserProfile(user_prfofile_input), error =>  this.showSaveMessage(error));*/

  }

  showSaveMessage(error){
    //jQuery("#saveChanges").removeClass("user-profile-save-loading").text("SaveChanges");
    //alert(error);
    this.emptyPasswords();
    this.showDialog(true,error);
  }

  emptyPasswords(){
    jQuery("#currentPassword").val("");
    jQuery("#newPassword").val("");
  }

  updateUserProfile(user_prfofile_input){
    this._userProfileService.updateUserProfile(user_prfofile_input)
      .subscribe(response=>this.showServiceStatus(response), error=>this.showServiceStatus(error))
  }

  showServiceStatus(response) {
    //jQuery("#saveChanges").removeClass("user-profile-save-loading").text("SaveChanges");
    //alert(response._body);
    this.emptyPasswords();
    this.showDialog(false, "Profile updated successfully");
  }

  goToDashboard() {
    let link = [''];
    this._router.navigate(link);
  }

  showDialog(error, msg) {
    if (!error) {
      this.toastService.pop(TOAST_TYPE.success, msg);
    } else if (error) {
      this.toastService.pop(TOAST_TYPE.error, msg);
    }
  }
}
