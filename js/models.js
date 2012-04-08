// ------------------- Models ------------------- //

$(document).ready(function() {

    Type = Backbone.Model.extend({
      defaults: {
        t:undefined
      }
    });

    TypeList = Backbone.Collection.extend({
      model: Type,

      filterByType : function(aType){
        return this.filter(
          function(item) {
            return item.get('t') == aType;
          });
      },

      isObject: function() {
        return (this.filterByType('object').length>0);
      },

      isString: function() {
        return (this.filterByType('string').length>0);
      },

      isNumber: function() {
        return (this.filterByType('number').length>0);
      },

      isInteger: function() {
        return (this.filterByType('integer').length>0);
      },

      isBoolean: function() {
        return (this.filterByType('boolean').length>0);
      },

      isNull: function() {
        return (this.filterByType('null').length>0);
      },

      isAny: function() {
        return (this.filterByType('any').length>0);
      },

      isArray: function() {
        return (this.filterByType('array').length>0);
      }
    });

    SchemaPair = Backbone.Model.extend({
      defaults: {
        key:undefined,
        schema:undefined,
        removed:false,
        root:false
      }
    });

    SchemaPairList = Backbone.Collection.extend({
      model: SchemaPair,

      filterByRemoved : function(){
        return this.filter(
          function(item) {
            return item.get('removed');
          });
      },
    });

    Schema = Backbone.Model.extend({

      defaults : {
        required:undefined,
        title:undefined,
        name:undefined,
        description:undefined,
        minimum:undefined,
        maximum:undefined,
        minitems:undefined,
        maxitems:undefined
        // JSON.stringify circular reference problem?
        // properties:new SchemaPairList(),
        // items:new SchemaPairList(),
        // types:new TypeList()
      },

      clearItems: function() {
        this.set({'items':new SchemaPairList()});
      },

      addNewProperty: function(aKey) {

        if ('' == aKey) {
          return;
        }

        var type = new Type({t:TypeEnum.ANY});
        var schema = new Schema();
        schema.addType(type);

        var schemaPair = new SchemaPair({key:aKey, schema: schema});
        this.addProperty(schemaPair);
      },

      addItemCount: function(aItemCount) {

        if ('' == aItemCount) {
          // User didn't request any Items.
          return true;
        }

        if (isNaN(aItemCount)) {
          // User provided bad value.
          return false;
        }

        var schema;
        var schemaPair;
        var type;

        for (var i=0; i<aItemCount; i++) {
          type = new Type({t:TypeEnum.ANY});
          schema = new Schema();
          schema.addType(type);
          schemaPair = new SchemaPair({schema: schema});
          this.get('items').add( schemaPair );
        }

        return (aItemCount==i);
      },

      initialize: function() {
        this.set({properties:new SchemaPairList()});
        this.set({items:new SchemaPairList()});
        this.set({types:new TypeList()});

        this.get('properties').comparator = function(aSchemaPair) {
          return aSchemaPair.get('key'); 
        };
      },

      validate: function(attrs) {
       
        // Number
        if (attrs.minimum) {
          if (isNaN(attrs.minimum)) {

            return -1;
          }
        }
        if (attrs.maximum) {
          if (isNaN(attrs.maximum)) {
            return -1;
          }
        }
        if (attrs.minimum && attrs.maximum) {
          if (attrs.maximum < attrs.minimum) {
            return -1;
          }
        }
        // Array
        if (attrs.minitems) {
          if (isNaN(attrs.minitems)) {
            return -1;
          }
        }
        if (attrs.maxitems) {
          if (isNaN(attrs.maxitems)) {
            return -1;
          }
        }
        if (attrs.minitems && attrs.maxitems) {
          if (attrs.maxitems < attrs.minitems) {
            return -1;
          }
        }
      },

      addProperty: function( aSchemaPair ) {
        this.get('properties').add( aSchemaPair );
      },

      addItem : function( aSchemaPair ) {
        this.get('items').add( aSchemaPair );
      },

      addType : function( aType ) {

        this.get('types').add( aType );
      }
    });

    SchemaList = Backbone.Collection.extend({
      model: Schema
    });
  });