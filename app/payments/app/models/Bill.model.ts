import {LineModel} from "./Line.model";
import {CheckListModel} from "./CheckList.model";
/**
 * Created by seshu on 25-07-2016.
 */

export class BillModel {
  companyID:string;
  companyName:string;
  id:string;
  billID:string;
  link:string;
  name:string;
  ownerID:string;
  lines:Array<LineModel>;
  vendorID:string;
  vendorName:string;
  currentState:string;
  currentUsers:Array<string>;
  createdTime:string;
  amount:number;
  amountPaid:number;
  elibleFor1099:boolean;
  dueDate:string;
  recurring:string;
  action:string;
  notes:string;
  tags:Array<string>;
  endDate:string;
  billDate:string;
  poNumber:string;
  history:Array<string>;
  subState:string;
  lastUpdated:string;
  lastUpdatedBy:string;
  checkList:Array<CheckListModel>;
  bucketName:string;
  documentKeyName:string;
  currency:string;
  term:string;
  _1099Amount:number;
  hasPaidApplied:boolean;
  vendorPaymentMethod:string;
}
