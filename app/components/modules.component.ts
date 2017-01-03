
import {Component, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {PROVINCES} from "qCommon/app/constants/Provinces.constants";
import {Router} from "@angular/router";
import {TOAST_TYPE} from "qCommon/app/constants/Qount.constants";
import {ToastService} from "qCommon/app/services/Toast.service";
import {SwitchBoard} from "qCommon/app/services/SwitchBoard";
import {Session} from "qCommon/app/services/Session";
import {LoadingService} from "qCommon/app/services/LoadingService";
import {ModulesService} from "../services/Modules.service";

declare var jQuery:any;
declare var _:any;

@Component({
    selector: 'modules',
    templateUrl: '/app/views/modules.html'
})

export class ModulesComponent {
    companyId:string;
    modulesList:Array<any> = [];
    isCreate:boolean=true;
    isLoaded:boolean=false;
    selectedModules:Array<any>=[];
    allSubModules:Array<any>=[];

    constructor(private _fb: FormBuilder, private _router: Router, private _toastService: ToastService,
                private switchBoard: SwitchBoard, private loadingService:LoadingService,private modulesService:ModulesService) {
        this.companyId = Session.getCurrentCompany();
        this.modulesService.modules().subscribe(modules => {
            this.modulesList=modules;
            this.isLoaded=true;
            this.allSubModules = [];
            _.each(modules, function(module){
                // this.allSubModules = this.allSubModules.concat(module.submodule);
            });
            this.loadData();
        }, error => this.handleError(error));
    }

    ngOnDestroy(){
    }

    loadData(){
        if(this.companyId){
            this.modulesService.getModules(this.companyId).subscribe(modules => {

                //current sample resp
                //[{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":5},{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":6},{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":7},{"company_id":"7e9dc88f-660d-4b6f-88a9-3eaf9006153b","module_id":3,"sub_module_id":8}]

                if(modules && modules.length>0){
                    this.isCreate=false;
                    let selectedModuleIds = _.map(modules, 'module_id');
                    let selectedSubModuleIds = _.map(modules, 'sub_module_id');
                    let allModuleIds = _.map(this.modulesList, 'id');
                    _.each(this.modulesList, function(m){
                        //module_id
                        if(selectedModuleIds.indexOf(m.id) == -1){
                            m.isSelected = false;
                        } else{
                            m.isSelected = true;
                            _.each(m.submodule, function(sm){
                                //sub_module_id
                                if(selectedSubModuleIds.indexOf(sm.id) == -1){
                                    sm.isSelected = false;
                                } else{
                                    sm.isSelected = true;
                                }
                            });
                        }
                    });
                }
            }, error => this.handleError(error));
        }
    }

    handleError(err){

    }

    onModuleSelect(moduleIndex, $event){
        //$event && $event.preventDefault();
        $event && $event.stopImmediatePropagation();
        let parentSelected = false;
        let currentModule = (this.modulesList[moduleIndex]);
        currentModule.isSelected = !currentModule.isSelected;
        parentSelected = currentModule.isSelected;
        _.each(currentModule.submodule, function(sm){
            sm.isSelected = parentSelected;
        });

    }

    onSubModuleSelect(moduleIndex, subModuleIndex){
        var self = this;
        setTimeout(function () {
            let currentModule = self.modulesList[moduleIndex];
            let parentSelectedSubList = _.every(currentModule.submodule, ['isSelected', true]);
            currentModule.isSelected = parentSelectedSubList;
        }, 0);
    }
    submit($event){
        $event && $event.preventDefault();
        //as matten current service
        let newObj = {};
        _.each(this.modulesList, function(m){
            _.each(m.submodule, function(sm){
                if(sm.isSelected){
                    if (!(m.id in newObj)){
                        newObj[m.id] = [];
                    }
                    newObj[m.id].push(sm.id);
                }
            });
        });

        console.log("newObj",newObj);
        var data=newObj;
        //return;
        if(this.isCreate){
            this.modulesService.saveModules(data,this.companyId).subscribe(modules => {
                if(modules){
                    this._toastService.pop(TOAST_TYPE.success, "Modules saved successfully");
                }
            }, error => {
                this._toastService.pop(TOAST_TYPE.error, "Failed to add module");
            });
        }else {
            this.modulesService.updateModules(data,this.companyId).subscribe(modules => {
                if(modules){
                    this._toastService.pop(TOAST_TYPE.success, "Modules saved successfully");
                }
            }, error => {
                this._toastService.pop(TOAST_TYPE.error, "Failed to add module");
            });
        }

    }
}
