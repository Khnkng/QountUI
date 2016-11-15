/**
 * Created by seshu on 28-03-2016.
 */

import {Component, ElementRef, EventEmitter, Output, Input} from "@angular/core";
import {RecipientInput} from "../models/RecipientInput.model";
import {UsersService} from "../services/Users.service";


declare var jQuery:any;
declare var _:any;

@Component({
  selector: 'recipient-input',
  templateUrl: '/app/views/recipientInput.html'
})

export class RecipientInputComponent {
  @Input() recipients: Array<any>;
  @Input() skipCheck: boolean;//skkiping @ check before calling user service
  //recipients = [];
  input:any;
  users:any;

  @Output() entered = new EventEmitter<RecipientInput>();
  @Output() removerecipient = new EventEmitter<string>();

  constructor(private elementRef: ElementRef, private usersService: UsersService) {
    if(this.recipients==undefined){
      this.recipients=[];
    }
    if(this.skipCheck==undefined){
      this.skipCheck=false;
    }
  }

  ngAfterViewInit() {
    var base = this;
    this.input = jQuery(this.elementRef.nativeElement).find('input');
    this.input.autocomplete({
      minLength: 0,
      autoFocus: true,
      position: { my : "left bottom", at: "left top" },
      source: (req, res) => this.getUsersByPrefix(req, res),
      select: function( event, ui ) {
        console.log("selected", ui);
        var recipient = {};
        recipient['name'] = ui.item.label;
        recipient['id'] = ui.item.value
        base.recipients.push(recipient);
        base.input.val("");
        return false;
      }
    }).data("ui-autocomplete")._renderItem = function(ul, item) {
      return jQuery("<li>").data("ui-autocomplete-item", item)
        .append("<div>" + item.value + "</div>")
        .append("<div>" + item.label + "</div>")
        .appendTo(ul);
    };
  }
  showError(error) {

  }

  getUsersByPrefix(req, res) {
    console.log("term", req.term);
    //removing @ check ot use this element at group list page
    if(this.skipCheck||req.term.indexOf('@') == 0 && req.term.length > 1) {
      var term = req.term;
      term = term.substring(1, term.length);
      this.usersService.getUsersByPrefix(term).subscribe(users  => res(jQuery.map(users, function (user) {
        return {
          label: user.fullName,
          value: user.id
        };
      }), error =>  this.showError(error)));
    }
  }

  removeRecipient(recipient,ev) {
    ev.preventDefault();
    ev.stopPropagation();
    _.remove(this.recipients, function(_recipient) {
      return _recipient.id === recipient.id;
    });
    this.removerecipient.emit(recipient.id);
  }

  onKey(event) {
    if(event.code == "Enter") {
      var recipientInput = {
        recipients: this.recipients,
        comment: this.input.val()
      };
      this.entered.emit(<RecipientInput>recipientInput);
      this.input.val("");
      this.recipients = [];
    }
  }
}
