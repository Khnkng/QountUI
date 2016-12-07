
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
    modulesList:Array<any>;
    isCreate:boolean=true
    isLoaded:boolean=false;
    constructor(private _fb: FormBuilder, private _router: Router, private _toastService: ToastService,
                private switchBoard: SwitchBoard, private loadingService:LoadingService,private modulesService:ModulesService) {
        this.companyId = Session.getCurrentCompany();
        this.modulesService.modules().subscribe(modules => {
            this.modulesList=modules;
            this.loadData();
        }, error => this.handleError(error));
    }

    ngOnDestroy(){
    }

    loadData(){
        if(this.companyId){
            this.modulesService.getModules(this.companyId).subscribe(modules => {
                this.isLoaded=true;
                if(modules&&modules.length>0){
                    this.isCreate=false;
                    this.selectedModules=_.map(modules,'module_id');
                    var base=this;
                    _.each(this.modulesList,function(item){
                        if(base.selectedModules&&base.selectedModules.indexOf(item.id)!=-1){
                            item.moduleSelect=true;
                        }
                        else{
                            item.moduleSelect=false;
                        }
                    });
                }
            }, error => this.handleError(error));
        }
    }

    handleError(err){

    }
    selectedModules:Array<any>=[];
    onModuleSelect(id){
        if(this.selectedModules.indexOf(id)>-1){
            this.selectedModules=_.pull(this.selectedModules,id);
        }else{
            this.selectedModules.push(id);
        }
    }
    submit($event){
        $event && $event.preventDefault();
        var data={"module_ids":this.selectedModules};
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
