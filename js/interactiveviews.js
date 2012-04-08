// ------------------- Interactive Views ------------------- //

$(document).ready(function() {

    SchemaOptionsView = Backbone.View.extend({

      events: { 
        'click li.OptionsNav span.Basic' : 'showBasic',
        'click li.OptionsNav span.Nested' : 'showNested'
      },

      initialize: function(){
        _.bindAll(this, 'render');
        _.bindAll(this, 'showBasic');
        _.bindAll(this, 'showNested');
      },

      showBasic: function(e) {
        e.stopImmediatePropagation();
        this.highlightNav(e.target);
        this.clearNav(SchemaOptionsView.NESTED_NAV_REF);

        $(SchemaOptionsView.BASIC_VIEW_REF, this.el).show();
        $(SchemaOptionsView.NESTED_VIEW_REF, this.el).hide();
      },

      showNested: function(e) {
        e.stopImmediatePropagation();
         this.highlightNav(e.target);
         this.clearNav(SchemaOptionsView.BASIC_NAV_REF);

        $(SchemaOptionsView.BASIC_VIEW_REF, this.el).hide();
        $(SchemaOptionsView.NESTED_VIEW_REF, this.el).show();
      },

      highlightNav: function(navRef) {
        $(navRef, this.el).css('color',SchemaOptionsView.NAV_BUTTON_ON_COLOR);
        $(navRef, this.el).css('background',SchemaOptionsView.NAV_BUTTON_ON_BG);
      },

      clearNav: function(navRef) {
        $(navRef, this.el).css('color','');
        $(navRef, this.el).css('background','');
      },

      render: function(){

        var Values = {
          CheckRequired:this.model.get('required') ? 'checked' : '',
          Minimum:this.model.get('minimum'),
          Maximum:this.model.get('maximum'),
          MinItems:this.model.get('minitems'),
          MaxItems:this.model.get('maxitems'),
          Description:this.model.get('description'),
          Title:this.model.get('title'),
          Name:this.model.get('name'),
          CheckObject:this.model.get('types').isObject() ? 'checked' : '',
          CheckString:this.model.get('types').isString() ? 'checked' : '',
          CheckNumber:this.model.get('types').isNumber() ? 'checked' : '',
          CheckInteger:this.model.get('types').isInteger() ? 'checked' : '',
          CheckBoolean:this.model.get('types').isBoolean() ? 'checked' : '',
          CheckArray:this.model.get('types').isArray() ? 'checked' : '',
          CheckNull:this.model.get('types').isNull() ? 'checked' : '',
          CheckAny:this.model.get('types').isAny() ? 'checked' : ''
        };

        var t = _.template( $(SchemaOptionsView.TEMPLATE).html(), Values);
        $(this.el).append(t);

        var types = this.model.get('types');

        // Hide irrelevant UI components.
        if (!types.isNumber()) {
          $(SchemaOptionsView.NUMBER_OPTIONS_REF, this.el).hide();
        }

        if(!types.isArray()) {
          $(SchemaOptionsView.ARRAY_OPTIONS_REF, this.el).hide();
        }

        // Basic view is on by default.
        this.highlightNav(SchemaOptionsView.BASIC_NAV_REF);
        return this;
      }
    },
      {
        TEMPLATE: '#SchemaOptionsView-Template',
        NAV_BUTTON_ON_COLOR:'#FFF',
        NAV_BUTTON_ON_BG:'#616161',
        ARRAY_OPTIONS_REF:'li.OptArray:first',
        NUMBER_OPTIONS_REF:'li.OptNumber:first',
        BASIC_NAV_REF : 'li.OptionsNav span.Basic',
        BASIC_VIEW_REF : 'div.BasicView',
        NESTED_NAV_REF : 'li.OptionsNav span.Nested',
        NESTED_VIEW_REF : 'div.NestedView',
      }
    );


    SchemaView = Backbone.View.extend({
      initialize: function() {
        _.bindAll(this, 'render');
        _.bindAll(this, 'handleSchemaUpdated');
        this.model.bind(SchemaView.EVENT_UPDATE_SCHEMA_MODEL, this.handleSchemaUpdated);
      },

      isLast: function(aIsLast) {
        this.isLast = aIsLast;
      },

      handleSchemaUpdated: function() {
        this.render();
      },

      render: function() {
        $(this.el).empty();

        var Values = {
          DollarSchema:this.model.get('dollarschema'),
          Types:this.model.get('types'),
          Title:this.model.get('title'),
          Name:this.model.get('name'),
          Required:this.model.get('required'),
          Description:this.model.get('description'),
          Properties:this.model.get('properties'),
          Items:this.model.get('items'),
          Minimum:this.model.get('minimum'),
          Maximum:this.model.get('maximum'),
          MinItems:this.model.get('minitems'),
          MaxItems:this.model.get('maxitems'),
          Separator:SchemaView.DELIMITER
        };

        // No trailing ',' for last schema object.
        if (this.isLast) {
          Values.Separator = "";
        }

        var t = _.template( $(SchemaView.TEMPLATE).html(), Values);
        $(this.el).append(t);

        var schemaOptionsView = new SchemaOptionsView({model:this.model});
        $(SchemaView.OPTIONS_REF, this.el).append(schemaOptionsView.render().el);

        // Collection of Types will always be initialized by the Model to an empty Collection.
        if (Values.Types.length > 0) {
          var typeListView = new TypeListView({collection:Values.Types});
          var cache = $(SchemaView.TYPES_REF, this.el);
          cache.show();
          cache.append(typeListView.render().el);
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.DollarSchema) {
          var cache =  $(SchemaView.DOLLAR_SCHEMA_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Title) {
          var cache =  $(SchemaView.TITLE_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Name) {
          var cache =  $(SchemaView.NAME_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Description) {
          var cache =  $(SchemaView.DESCRIPTION_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Required) {
          var cache =  $(SchemaView.REQUIRED_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Minimum && Values.Types.isNumber()) {
          var cache =  $(SchemaView.MINIMUM_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Maximum && Values.Types.isNumber()) {
          var cache =  $(SchemaView.MAXIMUM_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.MinItems && Values.Types.isArray()) {
          var cache =  $(SchemaView.MIN_ITEMS_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.MaxItems && Values.Types.isArray()) {
          var cache =  $(SchemaView.MAX_ITEMS_REF, this.el);
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);
        }

        if (Values.Properties.length > 0) {
          // If property is removed, the SchemaPairList should redraw itself.
          Values.Properties.bind('remove', this.render);
          var cache =  $(SchemaView.PROPERTIES_REF, this.el);

          /* Order matters! Display properties <div> before begining 
          recursive call which displays nested properties. Otherwise they all get displayed. */
          cache.show();
          cache.append(SchemaView.DELIMITER_NODE);

          var schemaPairListView = new SchemaPairListView({collection:Values.Properties});
          $(SchemaView.PROPERTIES_INNER_REF, this.el).append(schemaPairListView.render().el);
        }


        if (Values.Types.isArray()) {

          // If an item is removed, the SchemaPairList should redraw itself.
          Values.Items.bind('remove', this.render);
          var schemaPairListView = new SchemaPairListView({collection:Values.Items});

          if (Values.Items.length == 1) {
            // Single Schema describes all items.
            var cache =  $(SchemaView.ITEM_REF, this.el);
            cache.show();
            cache.append(schemaPairListView.render().el);
            cache.append(SchemaView.DELIMITER_NODE);
          } else if (Values.Items.length > 1) {
            // Type-typing
            var cache =  $(SchemaView.ITEM_REF, this.el);
            cache.show();
            cache.append(SchemaView.DELIMITER_NODE);
            cache.append(schemaPairListView.render().el);
          }
        }

        /* We don't know which schema attributes were displayed, so 
        they all create a trailing ',' - just remove the last one. */
        $(SchemaView.DELIMITER_REF, this.el).last().remove();
        return this;
      }
    },
      {
        EVENT_UPDATE_SCHEMA_MODEL:'Update:SchemaModel',
        TEMPLATE:'#SchemaView-Template',
        OPTIONS_REF:'div.Options:first',
        TYPES_REF:'div.Types:first',
        DOLLAR_SCHEMA_REF:'div.DollarSchema:first',
        TITLE_REF:'div.Title:first',
        NAME_REF:'div.Name:first',
        DESCRIPTION_REF:'div.Description:first',
        REQUIRED_REF:'div.Required:first',
        PROPERTIES_REF:'div.Properties:first',
        PROPERTIES_INNER_REF:'div.PropertiesInner:first',
        ITEM_REF:'div.Item:first',
        ITEMS_REF:'div.Items:first',
        ITEMS_INNER_REF:'div.ItemsInner:first',
        MINIMUM_REF:'div.Minimum:first',
        MAXIMUM_REF:'div.Maximum:first',
        MIN_ITEMS_REF:'div.MinItems:first',
        MAX_ITEMS_REF:'div.MaxItems:first',
        DELIMITER_REF:'span.Delimiter',
        DELIMITER_NODE:'<span class="Delimiter">,<span>',
        DELIMITER:','
      });
  

    SchemaPairView = Backbone.View.extend({

      tagName:'div',
      

      initialize: function() {
        _.bindAll(this, 'render');
        _.bindAll(this, 'resetOptions');
        _.bindAll(this, 'saveOptions');
        _.bindAll(this, 'toggleOptions');
        _.bindAll(this, 'handleOptionsClick');
        _.bindAll(this, 'handleOptionsTypeClick');
        _.bindAll(this, 'optionsValueError');
      },

      isLast: function(aIsLast) {
        this.isLast = aIsLast;
      },

      events: { 
        'click div.SchemaPairView' : 'toggleOptions',
        'click div.Options' : 'handleOptionsClick',
        'click div.Options input:checkbox[name=Type]' : 'handleOptionsTypeClick',
        'click input.Save' : 'saveOptions',
        'click input.Reset' : 'resetOptions',
        'mouseover div.SchemaPairView' : 'mouseover',
        'mouseout div.SchemaPairView' : 'mouseout'
      },

      handleOptionsClick: function(e) {
        // Otherwise the event causes the whole edit view to toggle.
        e.stopImmediatePropagation();
      },

      resetOptions: function(e) {
        var self = this;
        e.stopImmediatePropagation();

        // Reset each form component.
        $('form.SchemaOptions:first', self.el).each (function() {
            this.reset();
        });
        
        // ...including the error dialog.
        $(SchemaPairView.ERROR_REF, this.el).hide();

        // Use existing handler to reset type options.
        this.handleOptionsTypeClick(e);
      },

      handleOptionsTypeClick: function(e) {
        e.stopImmediatePropagation();

        var self = this;

         $(SchemaPairView.INPUT_TYPE_REF, this.el).each(function() {

          var checked = $(this).is(':checked');
          var type = $(this).val(); 

          if (checked) {
            // Type selected, update Options dialog if required.
            if (type == TypeEnum.NUMBER) {
              $(SchemaPairView.NUMBER_OPTIONS_REF, self.el).show();
            } else if(type == TypeEnum.ARRAY) {
              $(SchemaPairView.ARRAY_OPTIONS_REF, self.el).show();
            }
          } else {
            /* Type unselected, update Options dialog and clear
            any previously entered values from UI. */
            if (type == TypeEnum.NUMBER) {
                $(SchemaPairView.NUMBER_OPTIONS_REF, self.el).hide();
                $(SchemaPairView.INPUT_MINIMUM_REF, self.el).val('');
                $(SchemaPairView.INPUT_MAXIMUM_REF, self.el).val('');
            } else if(type == TypeEnum.ARRAY) {
              $(SchemaPairView.ARRAY_OPTIONS_REF, self.el).hide();
              $(SchemaPairView.INPUT_ITEM_SPACES_REF, self.el).val('');
              $(SchemaPairView.INPUT_MIN_ITEMS_REF, self.el).val('');
              $(SchemaPairView.INPUT_MAX_ITEMS_REF, self.el).val('');
            }
          }
        });
      },

      optionsValueError: function(model, error) {
        /* It's enough just to show the dialog since it's visibility is
        used as a check for errors before proceeding. */
        $(SchemaPairView.ERROR_REF, this.el).show();
      },

      saveOptions: function(e) {
        e.stopImmediatePropagation();

        var schema = this.model.get('schema');
        // Assume input is valid.
        $(SchemaPairView.ERROR_REF, this.el).hide();
        // This will cause the error dialog to show if bad input supplied.
        schema.on('error', this.optionsValueError);

        // Read values from options dialog.
        var descriptionVal = $(SchemaPairView.INPUT_DESCRIPTION_REF, this.el).val();
        var titleVal = $(SchemaPairView.INPUT_TITLE_REF, this.el).val();
        var nameVal = $(SchemaPairView.INPUT_NAME_REF, this.el).val();
        var minimumVal = $(SchemaPairView.INPUT_MINIMUM_REF, this.el).val();
        var maximumVal = $(SchemaPairView.INPUT_MAXIMUM_REF, this.el).val();
        var minItemsVal = $(SchemaPairView.INPUT_MIN_ITEMS_REF, this.el).val();
        var maxItemsVal = $(SchemaPairView.INPUT_MAX_ITEMS_REF, this.el).val();
        var requiredVal = $(SchemaPairView.INPUT_REQUIRED_REF, this.el).is(':checked');
        var itemSpacesVal = $(SchemaPairView.INPUT_ITEM_SPACES_REF, this.el).val();

        // Add any default Item schemas.
        var newItemsAdded = schema.addItemCount(itemSpacesVal);
        if (!newItemsAdded) {
           $(SchemaPairView.ERROR_REF, this.el).show();
        }

        // Add any Types - just replace all existing types with Collection of new types.
        var typesVal = new TypeList();
        $(SchemaPairView.INPUT_TYPE_REF + ':checked', this.el).each(function() {
            var t = new Type({t:$(this).val()});
            typesVal.add(t);
        });
        schema.set({types:typesVal});

        // Add new Properties.
        $(SchemaPairView.INPUT_PROPERTY_KEY_REF, this.el).each(function() {
            schema.addNewProperty($(this).val());
        });

        // Attempt to set new input on schema.
        schema.set({description:descriptionVal});
        schema.set({title:titleVal});
        schema.set({name:nameVal});
        schema.set({required:requiredVal});
        schema.set({minimum:minimumVal});
        schema.set({maximum:maximumVal});
        schema.set({minitems:minItemsVal});
        schema.set({maxitems:maxItemsVal});

        // Has error dialog been shown by Model error handler?
        var error = $(SchemaPairView.ERROR_REF, this.el).is(':visible');
        if (error) {
          // Yes, bail.
          return;
        }

        /* Array values cannot be cleared by the user providing an empty
        value. Therefore, if this schema is not an array, remove any 
        items added. This isn't very framework-like. Improve?*/
        if (!typesVal.isArray()) {
          schema.clearItems();
        }

        // Just to toggle the Options dialog.
        $(SchemaPairView.SCHEMA_PAIR_REF, this.el).trigger('click');
        // Use our own event otherwise we redraw Schema UI to often.
        this.model.get('schema').trigger(SchemaView.EVENT_UPDATE_SCHEMA_MODEL);
      },

      toggleOptions: function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        /* User wants to remove a schema, they don't actually want to toggle
        the Options dialog. */
        var targetClass = $(e.target).attr('class');

        if (targetClass == 'MenuClose') {
          // Flag Schema for removal.
          this.model.set({removed:true});
          /* This event will cause the SchemaPairListView which created the list 
          with this Schema in it, to render(). */
          this.model.trigger(SchemaPairListView.EVENT_UPDATE_SCHEMA_PAIR_MODEL);
          // We don't actually want to toggle the Options view.
          return;
        }

        var optionsEl = $(SchemaPairView.OPTIONS_REF, this.el);

        if (optionsEl.is(':visible')) {
          optionsEl.hide();
          $(SchemaPairView.SCHEMA_PAIR_REF,this.el).css('background-color',SchemaPairView.BASE_BG_COLOR);
        } else {
          optionsEl.show();
          $(SchemaPairView.SCHEMA_PAIR_REF,this.el).css('background-color',SchemaPairView.EDIT_BG_COLOR);
        }
      },

      mouseover: function(e) {
        e.stopImmediatePropagation();
        var optionsEl = $(SchemaPairView.OPTIONS_REF,this.el);
        $(SchemaPairView.MENU_REF,this.el).css('visibility','visible');

        if (optionsEl.is(':visible')) {
          $(SchemaPairView.SCHEMA_PAIR_REF,this.el).css('background-color',SchemaPairView.EDIT_BG_COLOR);
        } else {
          $(SchemaPairView.SCHEMA_PAIR_REF,this.el).css('background-color',SchemaPairView.HOVER_BG_COLOR);
        }
      },

      mouseout: function(e) {
        e.stopImmediatePropagation();
        var optionsEl = $(SchemaPairView.OPTIONS_REF,this.el);
        $(SchemaPairView.MENU_REF,this.el).css('visibility','hidden');

        if (optionsEl.is(':visible')) {
          $(SchemaPairView.SCHEMA_PAIR_REF,this.el).css('background-color',SchemaPairView.EDIT_BG_COLOR);
        } else {
          $(SchemaPairView.SCHEMA_PAIR_REF,this.el).css('background-color',SchemaPairView.BASE_BG_COLOR); 
        }
      },

      render: function() {
        $(this.el).empty();

        var Values = {
          Key:this.model.get('key'),
          Schema:this.model.get('schema')
        };

        var t = _.template( $(SchemaPairView.TEMPLATE).html(), Values );
        $(this.el).append(t);

        var isRootSchemaPair = this.model.get('root');

        if (isRootSchemaPair) {
          // Hide remove button if this is the root SchemaPairView.
          $(SchemaPairView.MENU_CLOSE_REF, this.el).css('visibility','hidden');
        }

        if (Values.Key) {
          $(SchemaPairView.KEY_REF, this.el).show();
        }

        var schemaView = new SchemaView({model:Values.Schema});
        schemaView.isLast(this.isLast);
  
        $(SchemaPairView.SCHEMA_REF, this.el).append(schemaView.render().el);
        return this;
      }

    }, 
    {
      TEMPLATE:'#SchemaPairView-Template',
      EDIT_BG_COLOR:'#E8C3C3',
      HOVER_BG_COLOR:'#CDE8C3',
      BASE_BG_COLOR:'transparent',
      INPUT_TYPE_REF:'div.Options:first input:checkbox[name=Type]',
      INPUT_MINIMUM_REF:'input.Minimum:first',
      INPUT_MAXIMUM_REF:'input.Maximum:first',
      INPUT_MIN_ITEMS_REF:'input.MinItems:first',
      INPUT_MAX_ITEMS_REF:'input.MaxItems:first',
      INPUT_TITLE_REF:'input.Title:first',
      INPUT_NAME_REF:'input.Name:first',
      INPUT_DESCRIPTION_REF:'input.Description:first',
      INPUT_REQUIRED_REF:'input.Required:first',
      INPUT_ITEM_SPACES_REF:'input.ItemSpaces:first',
      INPUT_PROPERTY_KEY_REF:'input.PropertyKey[name=PropertyKey]',
      SCHEMA_PAIR_REF:'div.SchemaPairView:first',
      OPTIONS_REF:'div.Options:first',
      KEY_REF:'div.Key:first',
      SCHEMA_REF:'div.Schema:first',
      ARRAY_OPTIONS_REF:'li.OptArray:first',
      NUMBER_OPTIONS_REF:'li.OptNumber:first',
      ERROR_REF:'li.OptError:first',
      MENU_REF:'div.Menu:first',
      MENU_CLOSE_REF:'div.Menu span.MenuClose:first'
    });


    SchemaPairListView = Backbone.View.extend({

       initialize:function() {
         _.bindAll(this, 'render'); 
       },

      render: function(){
        $(this.el).empty();
        var self = this;

        // Find any Schemas which have been flagged for removal.
        var removedSchemaPairs = (this.collection).filterByRemoved();

        _(removedSchemaPairs).each( function( schemaPair ) {
          self.collection.remove(schemaPair);
        }, this);

        _(this.collection.models).each( function( schemaPair ) {

              var index = this.collection.indexOf(schemaPair);
              var isLast = (index == (this.collection.length-1));

              var schemaPairView = new SchemaPairView({model: schemaPair});
              schemaPairView.isLast(isLast);
              /* Each SchemaPair listens for the event which means it should be deleted.
              When it gets the event, this method (which created the view) will be called 
              to update the view list.*/
              schemaPair.bind(SchemaPairListView.EVENT_UPDATE_SCHEMA_PAIR_MODEL, this.render);
              $(self.el).append(schemaPairView.render().el);

          }, this); 
        
        return this;
      }
    }, 
    {
      EVENT_UPDATE_SCHEMA_PAIR_MODEL:'Update:SchemaPairListModel',
    });


    TypeView = Backbone.View.extend({
      tagName: 'span',

      initialize: function(){
        _.bindAll(this, 'render');
      },

      isLast: function(aIsLast) {
        this.isLast = aIsLast;
      },

      render: function() {
        var Values = {
          type:this.model.get('t')
        };

        $(this.el).append('"' + Values.type + '"');

        if (!this.isLast) {
          $(this.el).append(TypeView.DELIMITER);
        }
        return this;
      }
    }, 
    {
      DELIMITER:',',
    });

    TypeListView = Backbone.View.extend({
      tagName: 'span',

       initialize:function() {
         _.bindAll(this, 'render'); 
       },
       
      render: function(){
        var self = this;
        var unionType = (this.collection.length > 1);

        if (unionType) {
          $(this.el).append(TypeListView.ARRAY_OPEN_BRACKET);
        }

        _(this.collection.models).each( function( type ) {

            var index = this.collection.indexOf(type);
            var isLast = (index == (this.collection.length-1));

            var typeView = new TypeView({model: type});
            typeView.isLast(isLast);

            $(self.el).append(typeView.render().el);
          }, this); 

        if (unionType) {
          $(this.el).append(TypeListView.ARRAY_CLOSE_BRACKET);
        }
        return this;
      }
    }, {
      ARRAY_OPEN_BRACKET:'[',
      ARRAY_CLOSE_BRACKET:']'
    });

  });