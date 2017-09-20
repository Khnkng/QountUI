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
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var Qount_constants_1 = require("qCommon/app/constants/Qount.constants");
var Toast_service_1 = require("qCommon/app/services/Toast.service");
var SwitchBoard_1 = require("qCommon/app/services/SwitchBoard");
var Session_1 = require("qCommon/app/services/Session");
var LoadingService_1 = require("qCommon/app/services/LoadingService");
var Modules_service_1 = require("../services/Modules.service");
var PageTitle_1 = require("qCommon/app/services/PageTitle");
var ModulesComponent = (function () {
    function ModulesComponent(_fb, _router, _toastService, switchBoard, loadingService, modulesService, titleService) {
        var _this = this;
        this._fb = _fb;
        this._router = _router;
        this._toastService = _toastService;
        this.switchBoard = switchBoard;
        this.loadingService = loadingService;
        this.modulesService = modulesService;
        this.titleService = titleService;
        this.modulesList = [];
        this.isCreate = true;
        this.isLoaded = false;
        this.selectedModules = [];
        this.allSubModules = [];
        this.companyId = Session_1.Session.getCurrentCompany();
        this.companyName = Session_1.Session.getCurrentCompanyName();
        this.modulesService.modules().subscribe(function (modules) {
            _this.modulesList = modules;
            _this.isLoaded = true;
            _this.allSubModules = [];
            _.each(modules, function (module) {
                // this.allSubModules = this.allSubModules.concat(module.submodule);
            });
            _this.loadData();
        }, function (error) { return _this.handleError(error); });
    }
    ModulesComponent.prototype.ngOnDestroy = function () {
    };
    ModulesComponent.prototype.loadData = function () {
        var _this = this;
        this.titleService.setPageTitle("Modules");
        if (this.companyId) {
            this.modulesService.getModules(this.companyId).subscribe(function (modules) {
                //current sample resp
                //[{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":5},{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":6},{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":7},{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":8}]
                if (modules && modules.length > 0) {
                    _this.isCreate = false;
                    var selectedModuleIds_1 = _.map(modules, 'id');
                    //let selectedSubModuleIds = _.map(modules, 'sub_module_id');
                    var allModuleIds = _.map(_this.modulesList, 'id');
                    _.each(_this.modulesList, function (m) {
                        //module_id
                        if (selectedModuleIds_1.indexOf(m.id) == -1) {
                            m.isSelected = false;
                        }
                        else {
                            m.isSelected = true;
                            //sub_module_id
                            var currentSubModules_1 = [];
                            _.each(modules, function (xm) {
                                if (xm.id === m.id) {
                                    currentSubModules_1 = xm.submodules;
                                    m.isSelected = true;
                                    return false;
                                }
                            });
                            _.each(m.submodules, function (sM) {
                                _.each(currentSubModules_1, function (cSm) {
                                    if (cSm.id === sM.id) {
                                        m.isSelected = true;
                                        sM.isSelected = true;
                                        if (cSm.selected_company_name == null || cSm.selected_company_name == 'qount') {
                                            sM.companies = 'qount';
                                        }
                                        else {
                                            sM.companies = cSm.selected_company_name;
                                        }
                                        return false;
                                    }
                                    else {
                                        sM.isSelected = false;
                                    }
                                });
                            });
                            //to uncheck modules if one submodules is selected
                            // let parentSelectedSubList = _.every(m.submodules, ['isSelected', true]);
                            // m.isSelected = parentSelectedSubList;
                        }
                    });
                }
            }, function (error) { return _this.handleError(error); });
        }
        // this.modulesService.modules().subscribe(modules1 => {
        //     if(modules1 && modules1.length>0){
        //         _.each(this.modulesList, function(m) {
        //             _.each(m.submodules, function(sM) {
        //                 if(sM.selected_company_name==null  || sM.selected_company_name==undefined || sM.selected_company_name==""){
        //                     sM.companies='qount';
        //                 }
        //             })
        //         })
        //     }
        // })
    };
    ModulesComponent.prototype.handleError = function (err) {
    };
    ModulesComponent.prototype.onModuleSelect = function (moduleIndex, $event) {
        //$event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        var parentSelected = false;
        var currentModule = (this.modulesList[moduleIndex]);
        currentModule.isSelected = !currentModule.isSelected;
        parentSelected = currentModule.isSelected;
        _.each(currentModule.submodules, function (sm) {
            sm.isSelected = parentSelected;
        });
    };
    ModulesComponent.prototype.onSubModuleSelect = function (moduleIndex, subModuleIndex) {
        var self = this;
        setTimeout(function () {
            var currentModule = self.modulesList[moduleIndex];
            var parentSelectedSubList = _.every(currentModule.submodules, ['isSelected', true]);
            currentModule.isSelected = parentSelectedSubList;
        }, 0);
    };
    ModulesComponent.prototype.submit = function ($event) {
        var _this = this;
        var base = this;
        $event && $event.preventDefault();
        var newObj = [];
        _.each(this.modulesList, function (m) {
            var moduleObject = {};
            moduleObject.id = m.id;
            moduleObject.name = m.name;
            _.each(m.submodules, function (sm) {
                if (sm.isSelected) {
                    /*if (!(m.id in newObj)){
                     newObj[m.id] = [];
                     }*/
                    if (sm.companies != 'qount') {
                        var smodules = {};
                        smodules.id = sm.id;
                        smodules.name = sm.name;
                        smodules.selected_company_name = base.companyName;
                        smodules.selected_company_id = base.companyId;
                        if (!moduleObject.submodules) {
                            moduleObject.submodules = [];
                        }
                        moduleObject.submodules.push(smodules);
                    }
                    else {
                        var smodules = {};
                        smodules.id = sm.id;
                        smodules.name = sm.name;
                        smodules.selected_company_name = 'qount';
                        smodules.selected_company_id = 'qount';
                        if (!moduleObject.submodules) {
                            moduleObject.submodules = [];
                        }
                        moduleObject.submodules.push(smodules);
                    }
                }
            });
            if (!_.isEmpty(moduleObject.submodules)) {
                newObj.push(moduleObject);
            }
        });
        var data = newObj;
        //return;
        if (this.isCreate) {
            this.modulesService.saveModules(data, this.companyId).subscribe(function (modules) {
                if (modules) {
                    _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Modules saved successfully");
                }
            }, function (error) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to add module");
            });
        }
        else {
            this.modulesService.updateModules(data, this.companyId).subscribe(function (modules) {
                if (modules) {
                    _this._toastService.pop(Qount_constants_1.TOAST_TYPE.success, "Modules saved successfully");
                }
            }, function (error) {
                _this._toastService.pop(Qount_constants_1.TOAST_TYPE.error, "Failed to add module");
            });
        }
    };
    return ModulesComponent;
}());
ModulesComponent = __decorate([
    core_1.Component({
        selector: 'modules',
        templateUrl: '/app/views/modules.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, Toast_service_1.ToastService,
        SwitchBoard_1.SwitchBoard, LoadingService_1.LoadingService, Modules_service_1.ModulesService, PageTitle_1.pageTitleService])
], ModulesComponent);
exports.ModulesComponent = ModulesComponent;
