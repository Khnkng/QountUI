import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'filterByValue'})
export class FilterByValuePipe implements PipeTransform {
  transform(value: any, searchVal: string): any {
    if (!searchVal) {
      return value;
    } else if (value) {
      return value.filter(item => {
        if ((typeof searchVal === 'string') &&
        (item.indexOf(searchVal)>=0)) {
          return true;
        }
      });
    }
  }

}
