import {Pipe, PipeTransform} from "@angular/core";
import {CurrencyPipe} from "@angular/common";

@Pipe({name: 'format-currency'})
export class FormatCurrency extends CurrencyPipe implements PipeTransform{

  transform(value: any, currencyCode?: string, symbolDisplay?: boolean, digits?: string): string {
    let formatedByCurrencyPipe = super.transform(value, currencyCode,symbolDisplay,digits);
    return formatedByCurrencyPipe;
  }
}
