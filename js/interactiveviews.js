// ------------------- Interactive Views ------------------- //
$(document).ready(function () {


    OptionsV = Backbone.View.extend({

        tagName: 'form',
        className: 'SchemaOptions',
        name: 'SchemaOptions',

        events: {
            'click': 'handleOptionsFocus',
            'click input:checkbox[name=Type]': 'handleOptionsTypeUpdate',
            'click input.Save': 'handleSaveOptions',
            'click input.Reset': 'handleResetOptions',
        },

        initialize: function () {
            _.bindAll(this, 'render');
            _.bindAll(this, 'handleOptionsFocus');
            _.bindAll(this, 'handleOptionsFocus');
            _.bindAll(this, 'handleOptionsTypeUpdate');
            _.bindAll(this, 'handleSaveOptions');
            _.bindAll(this, 'handleResetOptions');
        },

        handleOptionsFocus: function (e) {
            e.stopImmediatePropagation();
        },

        optionsValueError: function (model, error) {
            $(OptionsV.ERROR_REF, this.el).show();
        },

        handleOptionsTypeUpdate: function (e) {
            e.stopImmediatePropagation();

            var self = this;
            var inputTypesRef = $(OptionsV.INPUT_TYPES_REF, this.el);

            inputTypesRef.each(function () {

                var checked = $(this).is(':checked');
                var type = $(this).val();

                if (checked) {
                    if (type == TypeEnum.NUMBER) {
                        $(OptionsV.NUMBER_OPTIONS_REF, self.el).show();
                    } else if (type == TypeEnum.ARRAY) {
                        $(OptionsV.ARRAY_OPTIONS_REF, self.el).show();
                    }
                } else {
                    if (type == TypeEnum.NUMBER) {
                        $(OptionsV.NUMBER_OPTIONS_REF, self.el).hide();
                        $(OptionsV.INPUT_MINIMUM_REF, self.el).val('');
                        $(OptionsV.INPUT_MAXIMUM_REF, self.el).val('');
                    } else if (type == TypeEnum.ARRAY) {
                        $(OptionsV.ARRAY_OPTIONS_REF, self.el).hide();
                        $(OptionsV.INPUT_ITEM_SPACES_REF, self.el).val('');
                        $(OptionsV.INPUT_MIN_ITEMS_REF, self.el).val('');
                        $(OptionsV.INPUT_MAX_ITEMS_REF, self.el).val('');
                    }
                }
            });
        },

        handleSaveOptions: function (e) {
            e.stopImmediatePropagation();

            //var schema = this.model;
            var schema = this.model.get('schema');

            var errorRef = $(OptionsV.ERROR_REF, this.el);
            errorRef.hide();
            schema.on('error', this.optionsValueError);
            this.model.on('error', this.optionsValueError);

            var keyRef = $(OptionsV.INPUT_KEY_REF, this.el);
            var notItemSchema = keyRef.is(':visible');

            if (notItemSchema) {
                var keyVal = $(OptionsV.INPUT_KEY_REF, this.el).val();
                keyVal = jQuery.trim(keyVal);
                this.model.set({
                    key: keyVal
                });
            }



            var descriptionVal = $(OptionsV.INPUT_DESCRIPTION_REF, this.el).val();
            var titleVal = $(OptionsV.INPUT_TITLE_REF, this.el).val();
            var nameVal = $(OptionsV.INPUT_NAME_REF, this.el).val();
            var schemaIdVal = $(OptionsV.INPUT_SCHEMA_ID_REF, this.el).val();
            var minimumVal = $(OptionsV.INPUT_MINIMUM_REF, this.el).val();
            var maximumVal = $(OptionsV.INPUT_MAXIMUM_REF, this.el).val();
            var minItemsVal = $(OptionsV.INPUT_MIN_ITEMS_REF, this.el).val();
            var maxItemsVal = $(OptionsV.INPUT_MAX_ITEMS_REF, this.el).val();
            var requiredVal = $(OptionsV.INPUT_REQUIRED_REF, this.el).is(':checked');

            var typesVal = new TypeList();
            var typesRef = $(OptionsV.INPUT_TYPES_REF, this.el).filter(':checked');

            typesRef.each(function () {
                var t = new Type({
                    t: $(this).val()
                });
                typesVal.add(t);
            });

            schema.set({
                types: typesVal
            });
            schema.set({
                description: descriptionVal
            });
            schema.set({
                schemaid: schemaIdVal
            });
            schema.set({
                title: titleVal
            });
            schema.set({
                name: nameVal
            });
            schema.set({
                required: requiredVal
            });
            schema.set({
                minimum: minimumVal
            });
            schema.set({
                maximum: maximumVal
            });
            schema.set({
                minitems: minItemsVal
            });
            schema.set({
                maxitems: maxItemsVal
            });

            var error = errorRef.is(':visible');
            if (error) {
                return;
            }

            if (!typesVal.isArray()) {
                schema.clearItems();
            }

            $(this.el).remove();
            //this.model.trigger('updated:Schema');
            //this.model.trigger('saved:Schema');
            this.model.get('schema').trigger('updated:Schema');
            this.model.get('schema').trigger('saved:Schema');
        },

        handleResetOptions: function (e) {
            e.stopImmediatePropagation();

            var formInputsRef = $(this.el);

            formInputsRef.each(function () {
                this.reset();
            });

            $(OptionsV.ERROR_REF, this.el).hide();
            this.handleOptionsTypeUpdate(e);
        },

        render: function () {

            $(this.el).empty();
            var schema = this.model.get('schema');

            var Values = {
                CheckRequired: schema.get('required') ? 'checked' : '',
                Minimum: schema.get('minimum'),
                Maximum: schema.get('maximum'),
                MinItems: schema.get('minitems'),
                MaxItems: schema.get('maxitems'),
                Description: schema.get('description'),
                Title: schema.get('title'),
                SchemaId: schema.get('schemaid'),
                Name: schema.get('name'),
                Key: this.model.get('key'),
                CheckObject: schema.get('types').isObject() ? 'checked' : '',
                CheckString: schema.get('types').isString() ? 'checked' : '',
                CheckNumber: schema.get('types').isNumber() ? 'checked' : '',
                CheckInteger: schema.get('types').isInteger() ? 'checked' : '',
                CheckBoolean: schema.get('types').isBoolean() ? 'checked' : '',
                CheckArray: schema.get('types').isArray() ? 'checked' : '',
                CheckNull: schema.get('types').isNull() ? 'checked' : '',
                CheckAny: schema.get('types').isAny() ? 'checked' : ''
            };

            var t = _.template($(OptionsV.TEMPLATE).html(), Values);
            $(this.el).append(t);

            //var types = this.model.get('types');
            var types = this.model.get('schema').get('types');

            if (!types.isNumber()) {
                $(OptionsV.NUMBER_OPTIONS_REF, this.el).hide();
            }

            if (!types.isArray()) {
                $(OptionsV.ARRAY_OPTIONS_REF, this.el).hide();
            }

            if (!Values.Key) {
                $(OptionsV.KEY_OPTIONS_REF, this.el).hide();
            }

            return this;
        }
    }, {
        TEMPLATE: '#SchemaOptionsView-Template',
        ARRAY_OPTIONS_REF: 'li.OptArray',
        KEY_OPTIONS_REF: 'li.OptKey',
        NUMBER_OPTIONS_REF: 'li.OptNumber',
        INPUT_TYPES_REF: 'input:checkbox[name=Type]',
        INPUT_MINIMUM_REF: 'input.Minimum',
        INPUT_MAXIMUM_REF: 'input.Maximum',
        INPUT_MIN_ITEMS_REF: 'input.MinItems',
        INPUT_MAX_ITEMS_REF: 'input.MaxItems',
        INPUT_TITLE_REF: 'input.Title',
        INPUT_NAME_REF: 'input.Name',
        INPUT_KEY_REF: 'input.Key',
        INPUT_SCHEMA_ID_REF: 'input.SchemaId',
        INPUT_DESCRIPTION_REF: 'input.Description',
        INPUT_REQUIRED_REF: 'input.Required',
        ERROR_REF: 'li.OptError',
    });


    SchemaV = Backbone.View.extend({
        tagName: 'ul',
        className: 'SchemaView',
        datalevel: 0,

        initialize: function () {
            _.bindAll(this, 'render');
            _.bindAll(this, 'handleSchemaUpdated');
            _.bindAll(this, 'handlePropertyRemoved');
            _.bindAll(this, 'handleItemRemoved');
            _.bindAll(this, 'handleAddProperty');
            _.bindAll(this, 'handleAddItem');

            this.model.bind('updated:Schema', this.handleSchemaUpdated);
            this.model.bind('add:Item', this.handleAddItem);
            this.model.bind('add:Property', this.handleAddProperty);
        },

        setLevel: function (aLevel) {
            this.datalevel = aLevel;
        },

        attributeDelimiterCheck: function () {
            var selector = ('li[data-level="' + this.datalevel + '"]:visible > span.AttributeDelimiter');
            var attributes = $(selector, this.el);

            for (var i = 0; i < attributes.length; i++) {
                var last = (i == attributes.length - 1);
                if (last) {
                    $(attributes[i]).hide();
                } else {
                    $(attributes[i]).show();
                }
            }
        },

        handleSchemaUpdated: function () {

            var v = {
                DollarSchema: this.model.get('dollarschema'),
                Types: this.model.get('types'),
                Title: this.model.get('title'),
                Name: this.model.get('name'),
                Required: this.model.get('required'),
                Description: this.model.get('description'),
                SchemaId: this.model.get('schemaid'),
                Minimum: this.model.get('minimum'),
                Maximum: this.model.get('maximum'),
                MinItems: this.model.get('minitems'),
                MaxItems: this.model.get('maxitems'),
                DataLevel: this.datalevel,
            };

            var levelAttr = ('[data-level="' + this.datalevel + '"]');
            var t = _.template($(SchemaV.TEMPLATE).html(), v);

            $(SchemaV.DOLLAR_SCHEMA_REF + levelAttr, this.el).remove();
            $(SchemaV.TITLE_REF + levelAttr, this.el).remove();
            $(SchemaV.SCHEMA_ID_REF + levelAttr, this.el).remove();
            $(SchemaV.NAME_REF + levelAttr, this.el).remove();
            $(SchemaV.DESCRIPTION_REF + levelAttr, this.el).remove();
            $(SchemaV.REQUIRED_REF + levelAttr, this.el).remove();
            $(SchemaV.MINIMUM_REF + levelAttr, this.el).remove();
            $(SchemaV.MAXIMUM_REF + levelAttr, this.el).remove();
            $(SchemaV.MIN_ITEMS_REF + levelAttr, this.el).remove();
            $(SchemaV.MAX_ITEMS_REF + levelAttr, this.el).remove();
            $(SchemaV.TYPES_REF + levelAttr, this.el).remove();

            /* Preprend because Properties and Items may have
        been rendered but should appear last. */
            $(this.el).prepend(t);

            if (v.Types.length > 0) {
                var tlv = new TypeLV({
                    collection: v.Types
                });
                tlv.setLevel(this.datalevel);
                /* Prepend to keep Properties and Items appearing last.
          Types also generall appear first. */
                $(this.el).prepend(tlv.render().el);
            }

            /* Template keeps everything else in same order, so
        just show what we need. */
            if (v.DollarSchema) {
                $(SchemaV.DOLLAR_SCHEMA_REF + levelAttr, this.el).show();
            }
            if (v.Title) {
                $(SchemaV.TITLE_REF + levelAttr, this.el).show();
            }
            if (v.SchemaId) {
                $(SchemaV.SCHEMA_ID_REF + levelAttr, this.el).show();
            }
            if (v.Name) {
                $(SchemaV.NAME_REF + levelAttr, this.el).show();
            }
            if (v.Description) {
                $(SchemaV.DESCRIPTION_REF + levelAttr, this.el).show();
            }
            if (v.Required) {
                $(SchemaV.REQUIRED_REF + levelAttr, this.el).show();
            }
            if (v.Minimum) {
                $(SchemaV.MINIMUM_REF + levelAttr, this.el).show();
            }
            if (v.Maximum) {
                $(SchemaV.MAXIMUM_REF + levelAttr, this.el).show();
            }
            if (v.MinItems) {
                $(SchemaV.MIN_ITEMS_REF + levelAttr, this.el).show();
            }
            if (v.MaxItems) {
                $(SchemaV.MAX_ITEMS_REF + levelAttr, this.el).show();
            }

            this.attributeDelimiterCheck();
        },

        handleAddItem: function () {
            var items = this.model.get('items');
            var newItem = (items.length <= 0);

            if (newItem) {
                var cache = $(SchemaV.ITEMS_REF, this.el);
                var itemsSPLView = new SchemaPairLV({
                    collection: items,
                    className: 'Items'
                });
                itemsSPLView.datalevel = this.datalevel;
                $(this.el).append(itemsSPLView.render().el);
                items.bind('removed:SchemaPair', this.handleItemRemoved);
            }

            items.trigger('add:SchemaPair');

            if (newItem) {
                this.attributeDelimiterCheck();
            }

        },

        handleAddProperty: function () {

            var properties = this.model.get('properties');
            var newProperty = (properties.length <= 0);

            if (newProperty) {
                var propertiesSPLView = new SchemaPairLV({
                    collection: properties,
                    className: 'Properties'
                });
                propertiesSPLView.setLevel(this.datalevel);
                $(this.el).append(propertiesSPLView.render().el);
                properties.bind('removed:SchemaPair', this.handlePropertyRemoved);
            }

            properties.trigger('add:SchemaPair');

            if (newProperty) {
                this.attributeDelimiterCheck();
            }
        },

        handlePropertyRemoved: function () {
            var properties = this.model.get('properties');
            var empty = (properties.length <= 0);

            if (empty) {
                properties.unbind('removed:SchemaPair');
                this.attributeDelimiterCheck();
            }
        },

        handleItemRemoved: function () {
            var items = this.model.get('items');
            var empty = (items.length <= 0);

            if (empty) {
                items.unbind('removed:SchemaPair');
                this.attributeDelimiterCheck();
            }
        },

        render: function () {

            $(this.el).empty();
            $(this.el).attr("data-level", this.datalevel);

            var v = {
                DollarSchema: this.model.get('dollarschema'),
                Types: this.model.get('types'),
                Title: this.model.get('title'),
                Name: this.model.get('name'),
                Required: this.model.get('required'),
                Description: this.model.get('description'),
                Properties: this.model.get('properties'),
                Items: this.model.get('items'),
                SchemaId: this.model.get('schemaid'),
                Minimum: this.model.get('minimum'),
                Maximum: this.model.get('maximum'),
                MinItems: this.model.get('minitems'),
                MaxItems: this.model.get('maxitems'),
                DataLevel: this.datalevel,
            };

            var t = _.template($(SchemaV.TEMPLATE).html(), v);
            $(this.el).append(t);

            if (v.Types.length > 0) {
                var tlv = new TypeLV({
                    collection: v.Types
                });
                tlv.datalevel = this.datalevel;
                $(this.el).append(tlv.render().el);
            }

            if (v.DollarSchema) {
                $(SchemaV.DOLLAR_SCHEMA_REF, this.el).show();
            }
            if (v.Title) {
                $(SchemaV.TITLE_REF, this.el).show();
            }
            if (v.SchemaId) {
                $(SchemaV.SCHEMA_ID_REF, this.el).show();
            }
            if (v.Name) {
                $(SchemaV.NAME_REF, this.el).show();
            }
            if (v.Description) {
                $(SchemaV.DESCRIPTION_REF, this.el).show();
            }
            if (v.Required) {
                $(SchemaV.REQUIRED_REF, this.el).show();
            }
            if (v.Minimum && v.Types.isNumber()) {
                $(SchemaV.MINIMUM_REF, this.el).show();
            }
            if (v.Maximum && v.Types.isNumber()) {
                $(SchemaV.MAXIMUM_REF, this.el).show();
            }
            if (v.MinItems && v.Types.isArray()) {
                $(SchemaV.MIN_ITEMS_REF, this.el).show();
            }
            if (v.MaxItems && v.Types.isArray()) {
                $(SchemaV.MAX_ITEMS_REF, this.el).show();
            }

            var unattachedP = undefined;

            if (v.Properties.length > 0) {
                var cache = $(SchemaV.PROPERTIES_REF, this.el);
                var pSPLView = new SchemaPairLV({
                    collection: v.Properties,
                    className: 'Properties'
                });
                pSPLView.setLevel(this.datalevel);
                unattachedP = pSPLView.render().el;
                v.Properties.bind('removed:SchemaPair', this.handlePropertyRemoved);
            }

            var unattachedI = undefined;

            if (v.Types.isArray()) {
                var iSPLView = new SchemaPairLV({
                    collection: v.Items,
                    className: 'Items'
                });
                iSPLView.setLevel(this.datalevel);
                unattachedI = iSPLView.render().el;
                v.Items.bind('removed:SchemaPair', this.handleItemRemoved);
            }

            if (unattachedP) {
                $(this.el).append(unattachedP);
            }

            if (unattachedI) {
                $(this.el).append(unattachedI);
            }

            $('span.AttributeDelimiter', this.el).filter(":last").hide();
            return this;
        }
    }, {
        TEMPLATE: '#SchemaView-Template',
        OPTIONS_REF: 'li.Options',
        TYPES_REF: 'li.Types',
        DOLLAR_SCHEMA_REF: 'li.DollarSchema',
        TITLE_REF: 'li.Title',
        NAME_REF: 'li.Name',
        DESCRIPTION_REF: 'li.Description',
        REQUIRED_REF: 'li.Required',
        SCHEMA_ID_REF: 'li.SchemaId',
        MINIMUM_REF: 'li.Minimum',
        MAXIMUM_REF: 'li.Maximum',
        MIN_ITEMS_REF: 'li.MinItems',
        MAX_ITEMS_REF: 'li.MaxItems',
        PROPERTIES_REF: 'li.Properties',
        ITEMS_REF: 'li.Items',
    });




    SchemaPairV = Backbone.View.extend({
        tagName: 'div',
        className: 'SchemaPairView',
        datalevel: 0,

        initialize: function () {
            _.bindAll(this, 'handleRemove');
            _.bindAll(this, 'handleToggleOptions');
            _.bindAll(this, 'handleMouseover');
            _.bindAll(this, 'handleMouseout');
            _.bindAll(this, 'handleBeingLast');
            _.bindAll(this, 'handleAddItem');
            _.bindAll(this, 'handleSchemaSaved');
            // Notified of Options save.
            this.model.get('schema').bind('saved:Schema', this.handleSchemaSaved);
        },

        setLevel: function (aLevel) {
            this.datalevel = aLevel;
        },

        events: {
            'click span.Remove': 'handleRemove',
            'click span.AddProperty': 'handleAddProperty',
            'click span.AddItem': 'handleAddItem',
            'click span.Collapse': 'handleCollapse',
            'click span.Expand': 'handleExpand',
            'click': 'handleToggleOptions',
            'mouseover': 'handleMouseover',
            'mouseout': 'handleMouseout'
        },

        /*
      Remove Options form, hide containing div and reset SPV colours.
      */
        handleSchemaSaved: function () {
            var r = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');
            r.empty().hide();
            $(this.el).css('background-color', SchemaPairV.BASE_BG_COLOR);
            $(SchemaPairV.KEY_REF, this.el).filter(':first').text('"' + this.model.get('key') + '":');
            $(SchemaPairV.MENU_REF, this.el).filter(':first').css('visibility', 'hidden');
        },

        handleBeingLast: function () {
            $('> span.SchemaPairDelimiter', this.el).filter(':last').hide();
        },

        handleCollapse: function (e) {
            e.stopImmediatePropagation();
            $('div.Schema', this.el).filter(':first').css('display', 'none');
            $('span.Collapse', this.el).filter(':first').css('display', 'none');
            $('span.Expand', this.el).filter(':first').css('display', 'inline');
        },

        handleExpand: function (e) {
            e.stopImmediatePropagation();
            $('div.Schema', this.el).filter(':first').css('display', 'block');
            $('span.Collapse', this.el).filter(':first').css('display', 'inline');
            $('span.Expand', this.el).filter(':first').css('display', 'none');
        },

        handleRemove: function (e) {
            e.stopImmediatePropagation();
            $(this.el).remove();
            this.model.set({
                removed: true
            });
            this.model.unbind('saved:Schema');
            this.model.trigger('deleted:SchemaPairV');
        },

        handleAddProperty: function (e) {
            e.stopImmediatePropagation();
            this.model.get('schema').trigger('add:Property');
        },

        handleAddItem: function (e) {
            e.stopImmediatePropagation();
            this.model.get('schema').trigger('add:Item');
        },

        handleToggleOptions: function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            var r = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');

            if (r.is(':visible')) {
                r.empty().hide();
                $(this.el).css('background-color', SchemaPairV.BASE_BG_COLOR);
            } else {
                // Change model to this.model so Options can display key too?
                // var sov = new OptionsV({model:this.model.get('schema')});
                var sov = new OptionsV({
                    model: this.model
                });
                r.append(sov.render().el).show();
                $(this.el).css('background-color', SchemaPairV.EDIT_BG_COLOR);
            }
        },

        handleMouseover: function (e) {
            e.stopImmediatePropagation();

            var options = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');

            $(SchemaPairV.MENU_REF, this.el).filter(':first').css('visibility', 'visible');

            if (options.is(':visible')) {
                $(this.el).css('background-color', SchemaPairV.EDIT_BG_COLOR);
            } else {
                $(this.el).css('background-color', SchemaPairV.HOVER_BG_COLOR);
            }
        },

        handleMouseout: function (e) {
            e.stopImmediatePropagation();

            var options = $(SchemaPairV.OPTIONS_REF, this.el).filter(':first');

            $(SchemaPairV.MENU_REF, this.el).filter(':first').css('visibility', 'hidden');

            if (options.is(':visible')) {
                $(this.el).css('background-color', SchemaPairV.EDIT_BG_COLOR);
            } else {
                $(this.el).css('background-color', '');
            }
        },

        render: function () {
            var root = this.model.get('root');
            var v = {
                Key: this.model.get('key'),
                DataLevel: this.datalevel,
            };
            var t = _.template($(SchemaPairV.TEMPLATE).html(), v);

            $(this.el).attr("data-level", this.datalevel);
            $(this.el).append(t);

            if (root) {
                $(SchemaPairV.MENU_CLOSE_REF, this.el).hide();
                $(SchemaPairV.DELIMITER_REF, this.el).remove();
            }

            if (v.Key) {
                $(SchemaPairV.KEY_REF, this.el).show();
            }

            var sv = new SchemaV({
                model: this.model.get('schema')
            });
            sv.setLevel(this.datalevel);

            $(SchemaPairV.SCHEMA_REF, this.el).append(sv.render().el);
            return this;
        }
    }, {
        TEMPLATE: '#SchemaPairView-Template',
        EDIT_BG_COLOR: '#E8C3C3',
        HOVER_BG_COLOR: '#CDE8C3',
        BASE_BG_COLOR: 'transparent',
        KEY_REF: 'div.Key',
        SCHEMA_REF: 'div.Schema',
        MENU_REF: 'div.Menu',
        MENU_CLOSE_REF: 'div.Menu span.Remove',
        OPTIONS_REF: 'div.Options',
        DELIMITER_REF: 'span.SchemaPairDelimiter'
    });




    SchemaPairLV = Backbone.View.extend({
        tagName: 'li',
        datalevel: 0,

        initialize: function () {
            _.bindAll(this, 'render');
            _.bindAll(this, 'removeSchemaPair');
            _.bindAll(this, 'handleAddSchemaPair');
            this.collection.bind('add:SchemaPair', this.handleAddSchemaPair);
        },

        setLevel: function (aLevel) {
            this.datalevel = aLevel;
        },

        handleAddSchemaPair: function () {
            var key;
            var pSchemas = (this.className == 'Properties');
            var iSchemas = (this.className == 'Items');
            var nestedLevel = (this.datalevel + 1);
            var first = (this.collection.length == 0);
            var second = (this.collection.length == 1);
            var tupleTyping = (second && iSchemas);
            var r = $(SchemaPairLV.SCHEMAS_REF, this.el).filter(':first');

            r.attr("data-level", nestedLevel);

            if (pSchemas) {
                key = "RenameMe";
            }

            var sp = new SchemaPair({
                key: key,
                schema: new Schema()
            });
            this.collection.add(sp);
            var pos = this.collection.sortedIndex(sp, this.collection.comparator);

            if (!first) {
                $(SchemaPairLV.SCHEMA_DELIMITER_REF, this.el).filter(':last').show();
            }

            spv = new SchemaPairV({
                model: sp
            });
            spv.setLevel(nestedLevel);
            /* Begining of an implementation to keep the order of SchemaPairViews 
        syncd with the Collection of SchemaPairs. */

            // var existingSpvs = $('div.Schemas > div.SchemaPairView', this.el);
            // if (pos == 0) {
            //   r.prepend(spv.render().el);
            // }
            // else if (pos == this.collection.length-1) {
            //   r.append(spv.render().el);
            //   spv.handleBeingLast();
            // }
            // else if (pos > 0) {
            //   $(existingSpvs[pos]).parent().prepend(spv.render().el);
            //   var isLast = this.collection.at(this.collection.length-1);
            //   XYZ.handleBeingLast();
            // }
            r.append(spv.render().el);
            spv.handleBeingLast();

            if (tupleTyping) {
                $(SchemaPairLV.OPENING_SYMBOL_REF, this.el).filter(':first').append("[").show();
                $(SchemaPairLV.CLOSING_SYMBOL_REF, this.el).filter(':last').append("]").show();
            }
            sp.bind('deleted:SchemaPairV', this.removeSchemaPair);
        },

        removeSchemaPair: function () {
            var self = this;
            var iSchemas = (this.className == 'Items');
            var removed = (this.collection).filterByRemoved();

            _(removed).each(function (sp) {
                self.collection.remove(sp);
            });

            var empty = (this.collection.length <= 0);
            var oneSchema = (this.collection.length == 1);

            if (empty) {
                this.collection.unbind('add:SchemaPair');
                $(this.el).remove();
            } else {
                if (oneSchema && iSchemas) {
                    $(SchemaPairLV.OPENING_SYMBOL_REF, this.el).filter(':first').empty();
                    $(SchemaPairLV.CLOSING_SYMBOL_REF, this.el).filter(':last').empty();
                }

                var selector = 'div.SchemaPairView[data-level="' + (this.datalevel + 1) + '"]';
                var lastSchemaPair = $(selector, this.el).filter(':last');
                $(SchemaPairLV.SCHEMA_DELIMITER_REF, lastSchemaPair).filter(':last').hide();
            }

            this.collection.trigger('removed:SchemaPair');
        },

        render: function () {
            var self = this;
            var v = {
                DataLevel: this.datalevel,
            };
            var pSchemas = (this.className == 'Properties');
            var iSchemas = (this.className == 'Items');
            var tupleTyping = (iSchemas && (this.collection.length > 1));
            var t;

            $(this.el).attr("data-level", this.datalevel);

            if (pSchemas) {
                t = _.template($(SchemaPairLV.PROPERTIES_TEMPLATE).html(), v);
                $(this.el).append(t);
            } else if (iSchemas) {
                t = _.template($(SchemaPairLV.ITEMS_TEMPLATE).html(), v);
                $(this.el).append(t);
            }

            if (tupleTyping) {
                $(SchemaPairLV.OPENING_SYMBOL_REF, this.el).append("[");
            }

            var nestedLevel = (this.datalevel + 1);
            var r = $(SchemaPairLV.SCHEMAS_REF, this.el);
            r.attr("data-level", nestedLevel);

            _(this.collection.models).each(function (sp) {
                var index = this.collection.indexOf(sp);
                var isLast = (index == (this.collection.length - 1));

                var spv = new SchemaPairV({
                    model: sp
                });
                spv.setLevel(nestedLevel);
                r.append(spv.render().el);
                sp.bind('deleted:SchemaPairV', this.removeSchemaPair);

                if (isLast) {
                    spv.handleBeingLast();
                }
            }, this);

            if (tupleTyping) {
                $(SchemaPairLV.CLOSING_SYMBOL_REF, this.el).filter(':last').append("]");
            }

            $(this.el).show();
            return this;
        }
    }, {
        PROPERTIES_TEMPLATE: '#SchemaPairListViewProperties-Template',
        ITEMS_TEMPLATE: '#SchemaPairListViewItems-Template',
        OPENING_SYMBOL_REF: 'span.OpeningSymbol',
        CLOSING_SYMBOL_REF: 'span.ClosingSymbol',
        SCHEMAS_REF: 'div.Schemas',
        SCHEMA_DELIMITER_REF: 'span.SchemaPairDelimiter',
    });




    TypeLV = Backbone.View.extend({
        tagName: 'li',
        className: 'Types',
        datalevel: 0,

        setLevel: function (aLevel) {
            this.datalevel = aLevel;
        },

        render: function () {
            var self = this;
            var unionType = (this.collection.length > 1);
            var v = {
                DataLevel: this.datalevel
            }
            var t = _.template($(TypeLV.TEMPLATE).html(), v);

            $(this.el).empty();
            $(this.el).attr('data-level', this.datalevel);
            $(this.el).append(t);

            if (unionType) {
                $(TypeLV.OPENING_SYMBOL_REF, this.el).append("[");
            }

            var r = $(TypeLV.TYPE_REF, this.el);

            _(this.collection.models).each(function (type) {
                var index = this.collection.indexOf(type);
                var isLast = (index == (this.collection.length - 1));

                r.append('"' + type.get('t') + '"');
                if (!isLast) {
                    r.append(',');
                }
            }, this);

            if (unionType) {
                $(TypeLV.CLOSING_SYMBOL_REF, this.el).append("]");
            }
            $(this.el).show();
            return this;
        }
    }, {
        TEMPLATE: '#TypeListView-Template',
        OPENING_SYMBOL_REF: 'span.OpeningSymbol',
        CLOSING_SYMBOL_REF: 'span.ClosingSymbol',
        TYPE_REF: 'span.T'
    });

});