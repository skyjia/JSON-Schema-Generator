// ------------------- Raw Views ------------------- //

$(document).ready(function() {

    
    RawSchemaView = Backbone.View.extend({

      mStrings: {
        delimiterElement:'<span class="Delimiter">,<span>',
        delimiter:','
      },

      initialize: function(){
        _.bindAll(this, 'render');
        _.bindAll(this, 'handleSchemaUpdated');
        this.model.bind(SchemaView.EVENT_UPDATE_SCHEMA_MODEL, this.handleSchemaUpdated);
      },

      isLast: function(aIsLast) {
        this.isLast = aIsLast;
      },

      handleSchemaUpdated: function() {
        // Shallow render?
        this.render();
      },

      render: function(){      

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
          Separator:this.mStrings.delimiter
        };

        if (this.isLast) {
          Values.Separator = "";
        }

        var t = _.template( $("#RawSchemaView-Template").html(), Values);
        $(this.el).append(t);

        if (Values.Types.length > 0) {
          var typeListView = new TypeListView({collection:Values.Types});
            $("div.Types:first", this.el).show();
            $("div.Types:first", this.el).append(typeListView.render().el);
            $("div.Types:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.DollarSchema) {
          $("div.DollarSchema:first", this.el).show();
          $("div.DollarSchema:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.Title) {
          $("div.Title:first", this.el).show();
          $("div.Title:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.Name) {
          $("div.Name:first", this.el).show();
          $("div.Name:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.Description) {
          $("div.Description:first", this.el).show();
          $("div.Description:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.Required) {
          $("div.Required:first", this.el).show();
          $("div.Required:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.Properties.length > 0) {
          /* Order matters! Display properties before begining 
          recursive call which displays other properties. Otherwise 
          they all get displayed. */
          $("div.Properties:first", this.el).show();
          $("div.Properties:first", this.el).append(this.mStrings.delimiterElement);
          var schemaPairListView = new RawSchemaPairListView({collection:Values.Properties});
          $("div.PropertiesInner:first", this.el).append(schemaPairListView.render().el);
        }

        if (Values.Types.isArray()) {
          /*
           * Document: draft-zyp-json-schema-03
           * Section: 5.5. items:
           * What: The default value is an empty schema which allows any 
           * value for items in the instance array.
           * Where else: N/A
           */
          if (Values.Items.length < 1) {
            /* User has just flagged this as an array.
            Provide default schema. */
            //Values.Items.add(new SchemaPair({schema:new Schema()}));
          }

          var schemaPairListView = new RawSchemaPairListView({collection:Values.Items});

          if (Values.Items.length == 1) {
            // Single Schema describes all items.
            $("div.Item:first", this.el).show();
            $("div.Item:first", this.el).append(schemaPairListView.render().el);
            $("div.Item:first", this.el).append(this.mStrings.delimiterElement);
          } else {
            $("div.Items:first", this.el).show();
            $("div.Items:first", this.el).append(this.mStrings.delimiterElement);
            $("div.ItemsInner:first", this.el).append(schemaPairListView.render().el);
          }
        }

        if (Values.Minimum && Values.Types.isNumber()) {
          $("div.Minimum:first", this.el).show();
          $("div.Minimum:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.Maximum && Values.Types.isNumber()) {
          $("div.Maximum:first", this.el).show();
          $("div.Maximum:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.MinItems && Values.Types.isArray()) {
          $("div.MinItems:first", this.el).show();
          $("div.MinItems:first", this.el).append(this.mStrings.delimiterElement);
        }

        if (Values.MaxItems && Values.Types.isArray()) {
          $("div.MaxItems:first", this.el).show();
          $("div.MaxItems:first", this.el).append(this.mStrings.delimiterElement);
        }

        $('span.Delimiter', this.el).last().remove();
        return this;
      }
    });
  
    RawSchemaPairView = Backbone.View.extend({

      initialize: function(){
        _.bindAll(this, 'render');
      },

      isLast: function(aIsLast) {
        this.isLast = aIsLast;
      },

      render: function(){
        var Values = {
          ID:this.viewId,
          Key:this.model.get('key'),
          Schema:this.model.get('schema'),
        };

        var t = _.template( $("#RawSchemaPairView-Template").html(), Values );
        $(this.el).append(t);

        if (Values.Key) {
          $("div.Key", this.el).show();
        }

        var schemaView = new RawSchemaView({model:Values.Schema});
        schemaView.isLast(this.isLast);

        $("div.Schema", this.el).append(schemaView.render().el);
        return this;
      }
    });

  RawSchemaPairListView = Backbone.View.extend({

       initialize:function() {
         _.bindAll(this, 'render'); 
       },
       
      render: function(){
        $(this.el).empty();
        var self = this;

        var removedSchemaPairs = (this.collection).filterByRemoved();

        _(removedSchemaPairs).each( function( schemaPair ) {
          self.collection.remove(schemaPair);
        }, this);

        _(this.collection.models).each( function( schemaPair ) {

            var index = this.collection.indexOf(schemaPair);
            var isLast = (index == (this.collection.length-1));

            var schemaPairView = new RawSchemaPairView({model: schemaPair});
            schemaPairView.isLast(isLast);
            schemaPair.bind('Update:SchemaPairListModel', this.render);

            $(self.el).append(schemaPairView.render().el);
          }, this); 
        return this;
      }
    });
  });