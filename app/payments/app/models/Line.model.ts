/**
 * Created by seshu on 26-07-2016.
 */

export class LineModel {
  number:number;
  description:string;
  unitPrice:number;
  quantity:number;
  amount:number;
  itemCode:string;
  expenseCode:string;
  has1099:boolean;
  hasAsset:boolean;
  _1099Mapping:string;
  tags:Array<string>;
}
