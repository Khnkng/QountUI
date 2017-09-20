/**
 * Created by seshu on 19-04-2016.
 */


  $.widget( "custom.combobox", {
    options: {
      allowInvalid: false,
      title: ''
    },
    _create: function() {
      this.wrapper = $( "<span>" )
        .addClass( "custom-combobox" )
        .insertAfter( this.element );

      this.element.hide();
      this._createAutocomplete();
      this._createShowAllButton();
    },

    _createAutocomplete: function() {
     // var selected = this.element.children( ":selected" ),
      //  value = selected.val() ? selected.text() : "";

      var value = "";
      var base = this;
      this.input = $( "<input>" )
        .appendTo( this.wrapper )
        .val( value )
        .attr( "title", this.options.title)
        .attr( "placeholder", this.options.placeholder)
        .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
        .autocomplete({
          delay: 0,
          minLength: 0,
          source: $.proxy( this, "_source" )
        })
        .keydown(function(event) {
          if(event.keyCode == 13) {
            if(base.input.val().length!=0 && base.options.allowInvalid) {
              event.preventDefault();
              base._removeIfInvalid(event);
            }
            return false;
          }
        })
        .tooltip({
          tooltipClass: "ui-state-highlight"
        });

      this._on( this.input, {
        autocompleteselect: function( event, ui ) {
          if(ui.item.option){
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option.value
            });
          }
          if(this.options.onchange) {
            this.options.onchange(ui.item.option?ui.item.option.value:'--None--');
            if(this.options.clearOnSelect) {
              this.input.val('');
            }
          }
        },

        autocompletechange: "_removeIfInvalid"
      });
      this.input.data('ui-autocomplete')._renderMenu= function( ul, items ) {
        var that = this;
        items.splice(0, 0, {"label": "--None--", "value":"--None--"});
        $.each( items, function( index, item ) {
          that._renderItemData( ul, item );
        } );
      };
      this.options.inputBox(this.input);
    },

    _createShowAllButton: function() {
      var input = this.input,
        wasOpen = false;

      $( "<a>" )
        .attr( "tabIndex", -1 )
        .attr( "title", "" )
        .tooltip()
        .appendTo( this.wrapper )
        .button({
          icons: {
            primary: "ui-icon-triangle-1-s"
          },
          text: false
        })
        .removeClass( "ui-corner-all" )
        .addClass( "custom-combobox-toggle ui-corner-right" )
        .mousedown(function() {
          wasOpen = input.autocomplete( "widget" ).is( ":visible" );
        })
        .click(function() {
          input.focus();

          // Close if already visible
          if ( wasOpen ) {
            return;
          }

          // Pass empty string as value to search for, displaying all results
          input.autocomplete( "search", "" );
        });
    },

    _source: function( request, response ) {
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
      response( this.element.children( "option" ).map(function() {
        var text = $( this ).text();
        if ( this.value && ( !request.term || matcher.test(text) ) )
          return {
            label: text,
            value: text,
            option: this
          };
      }) );
    },

    _removeIfInvalid: function( event, ui ) {

      // Selected an item, nothing to do
      if ( ui && ui.item ) {
        if(this.options.onchange) {
          this.options.onchange(ui.item.value);
          if(this.options.clearOnSelect) {
            this.input.val('');
          }
        }
        return;
      }

      // Search for a match (case-insensitive)
      var value = this.input.val(),
        valueLowerCase = value.toLowerCase(),
        valid = false;
      this.element.children( "option" ).each(function() {
        if ( $( this ).text().toLowerCase() === valueLowerCase ) {
          this.selected = valid = true;
          return false;
        }
      });

      // Found a match, nothing to do
      if ( valid  || this.options.allowInvalid) {
        if(this.options.onchange) {
          this.options.onchange(value);
          if(this.options.clearOnSelect) {
            this.input.val('');
          }
        }
        return;
      }

      // Remove invalid value
      this.input
        .val( "" )
        .attr( "title", value + " didn't match any item" )
        .tooltip( "open" );
      this.element.val( "" );
      this._delay(function() {
        this.input.tooltip( "close" ).attr( "title", "" );
      }, 2500 );
      this.input.autocomplete( "instance" ).term = "";
    },

    _destroy: function() {
      this.wrapper.remove();
      this.element.show();
    },

    // called when created, and later when changing options
    _refresh: function() {
      // trigger a callback/event
      this._trigger( "change" );
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function() {
      // _super and _superApply handle keeping the right this-context
      this._superApply( arguments );
      this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {
      this._super( key, value );
    }
  });

