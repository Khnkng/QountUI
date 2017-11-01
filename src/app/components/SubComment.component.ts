/**
 * Created by venkatkollikonda on 18/10/17.
 */
import {Component, Input} from "@angular/core";


declare let _: any;
declare let jQuery: any;
declare let moment: any;

@Component({
  selector: 'sub-comment',
  templateUrl: '../views/SubComment.html',
})

export class SubCommentComponent{
  filters: any = {'task': '#44B6E8', 'done': '#18457B', 'working': '#F06459', 'active': '#00B1A9', 'celebrating': '#22B473'};
  comments: any;
  @Input()
  set data(data: any){
    this.comments = data;
  }
  constructor() {

  }


  getColor(type) {
    return this.filters[type];
  }

  getRight(index) {
      return index * 5 + 'px';
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
