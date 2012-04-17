// ------------------- Models ------------------- //
$(document).ready(function () {

    TypeEnum = Backbone.Model.extend({}, {
        STRING: "string",
        NUMBER: "number",
        INTEGER: "integer",
        BOOLEAN: "boolean",
        OBJECT: "object",
        ARRAY: "array",
        NULL: "null",
        ANY: "any"
    });

    ListTypeEnum = Backbone.Model.extend({}, {
        PROPERTIES: "properties",
        ITEMS: "items"
    });


    Type = Backbone.Model.extend({
        defaults: {
            t: undefined
        }
    });

    TypeList = Backbone.Collection.extend({
        model: Type,

        filterByType: function (aType) {
            return this.filter(

            function (item) {
                return item.get('t') == aType;
            });
        },

        isObject: function () {
            return (this.filterByType('object').length > 0);
        },

        isString: function () {
            return (this.filterByType('string').length > 0);
        },

        isNumber: function () {
            return (this.filterByType('number').length > 0);
        },

        isInteger: function () {
            return (this.filterByType('integer').length > 0);
        },

        isBoolean: function () {
            return (this.filterByType('boolean').length > 0);
        },

        isNull: function () {
            return (this.filterByType('null').length > 0);
        },

        isAny: function () {
            return (this.filterByType('any').length > 0);
        },

        isArray: function () {
            return (this.filterByType('array').length > 0);
        }
    });

    SchemaPair = Backbone.Model.extend({
        defaults: {
            key: undefined,
            schema: undefined,
            removed: false,
            root: false
        },

        validate: function (attrs) {

            /* This doesn't seem right, but need to check 
        removed flag isn't being set, if it is, the don't attempt to
        validate other values. Maybe using proper getters and setters 
        would solve this problem. */
            if (attrs.removed) {
                return;
            }


            if (typeof (attrs.key) != "undefined") {
                if (!attrs.key) {
                    var k = attrs.key.replace(/\s/g, '');
                    if (k == '') {
                        return -1;
                    }
                }
            }
        }
    });

    SchemaPairList = Backbone.Collection.extend({
        model: SchemaPair,

        initialize: function () {
            this.comparator = function (aSchemaPair) {

                return (aSchemaPair.get('key') + aSchemaPair.cid);
            };
        },

        filterByRemoved: function () {
            return this.filter(

            function (item) {
                return item.get('removed');
            });
        },
    });

    Schema = Backbone.Model.extend({

        defaults: {
            required: undefined,
            title: undefined,
            name: undefined,
            description: undefined,
            minimum: undefined,
            maximum: undefined,
            minitems: undefined,
            maxitems: undefined,
            schemaid: undefined,
            items: undefined,
            types: undefined,
            properties: undefined
        },

        initialize: function () {

            this.set({
                properties: new SchemaPairList()
            });
            this.set({
                items: new SchemaPairList()
            });
            this.set({
                types: new TypeList()
            });
        },

        clearItems: function () {
            this.set({
                'items': new SchemaPairList()
            });
        },

        addNewProperty: function (aKey) {

            var schemaPair = new SchemaPair({
                key: aKey,
                schema: new Schema()
            });
            this.addProperty(schemaPair);
        },

        addNewItem: function () {
            var schemaPair = new SchemaPair({
                schema: new Schema()
            });
            this.get('items').add(schemaPair);

            if (!this.get('types').isArray()) {
                /* Automatically make this schema an array 
          since we're adding an item. */
                var t = new Type({
                    t: TypeEnum.ARRAY
                });
                this.get('types').add(t);
            }
        },

        addItemCount: function (aItemCount) {

            if ('' == aItemCount) {
                // User didn't request any Items.
                return true;
            }

            if (isNaN(aItemCount)) {
                // User provided bad value.
                return false;
            }

            for (var i = 0; i < aItemCount; i++) {
                var schemaPair = new SchemaPair({
                    schema: new Schema()
                });
                this.get('items').add(schemaPair);
            }

            return (aItemCount == i);
        },

        validate: function (attrs) {

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

        addProperty: function (aSchemaPair) {
            this.get('properties').add(aSchemaPair);
        },

        addItem: function (aSchemaPair) {
            this.get('items').add(aSchemaPair);
        },

        addType: function (aType) {

            this.get('types').add(aType);
        }
    });

});