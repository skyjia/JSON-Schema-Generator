$(document).ready(function () {


    SchemaStrV = Backbone.View.extend({

 sb: [],
        l: 0,

       resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        render: function () {
            this.resetBuffer();

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
                DataLevel: this.level,
            };

            if (v.Types.length > 0) {
                var tlv = new TypeLStrV({
                    collection: v.Types
                });

                var s = '"type":' + tlv.render();
                this.sb[this.l++] = s;
            }

            if (v.DollarSchema) {
                var s = '"$schema": "' + v.DollarSchema + '"';
                this.sb[this.l++] = s;
            }
            if (v.Title) {
                var s = '"title": "' + v.Title + '"';
                this.sb[this.l++] = s;
            }
            if (v.SchemaId) {
                var s = '"id": "' + v.SchemaId + '"';
                this.sb[this.l++] = s;
            }
            if (v.Name) {
                var s = '"name": "' + v.Name + '"';
                this.sb[this.l++] = s;
            }
            if (v.Description) {
                var s = '"description": "' + v.Description + '"';
                this.sb[this.l++] = s;
            }
            if (v.Required) {
                var s = '"required":' + v.Required;
                this.sb[this.l++] = s;
            }
            if (v.Minimum && v.Types.isNumber()) {
                var s = '"minimum": "' + v.Minimum + '"';
                this.sb[this.l++] = s;
            }
            if (v.Maximum && v.Types.isNumber()) {
                var s = '"maximum": "' + v.Maximum + '"';
                this.sb[this.l++] = s;
            }
            if (v.MinItems && v.Types.isArray()) {
                var s = '"minitems": "' + v.MinItems + '"';
                this.sb[this.l++] = s;
            }
            if (v.MaxItems && v.Types.isArray()) {
                var s = '"maxitems": "' + v.MaxItems + '"';
                this.sb[this.l++] = s;
            }

            if (v.Properties.length > 0) {
                var pSPLView = new SchemaPairLStrV({
                    collection: v.Properties,
                    className: 'Properties'
                });
                var s = '"properties": ' + pSPLView.render();
                this.sb[this.l++] = s;
            }

            if (v.Items.length > 0) {
                var iSPLView = new SchemaPairLStrV({
                    collection: v.Items,
                    className: 'Items'
                });
                var s = '"items": ' + iSPLView.render();
                this.sb[this.l++] = s;
            }

            return this.sb.join(',');
        }

    });

    SchemaPairStrV = Backbone.View.extend({
        last: false,
         sb: [],
        l: 0,

        resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        render: function () {
            this.resetBuffer();

            var root = this.model.get('root');

            var v = {
                Key: this.model.get('key'),
            };

            if (root) {
                this.last = true;
            }

            if (v.Key) {
                this.sb[this.l++] = '"' + v.Key + '": {';
            } else {
                this.sb[this.l++] = '{';
            }

            var sv = new SchemaStrV({
                model: this.model.get('schema')
            });

            var eol = ''
            if (!this.last) {
                eol += ',';
            }

            this.sb[this.l++] = sv.render();
            this.sb[this.l++] = '}' + eol;

            return this.sb.join('');
        }
    });


    SchemaPairLStrV = Backbone.View.extend({
        className: '',
         sb: [],
        l: 0,

        resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        render: function () {
            var self = this;
            var pSchemas = (this.className == 'Properties');
            var iSchemas = (this.className == 'Items');
            var tupleTyping = (iSchemas && (this.collection.length > 1));

            this.resetBuffer();

            if (pSchemas) {
                this.sb[this.l++] = '{';
            } else {

                if (tupleTyping) {
                    this.sb[this.l++] = '[';
                }
            }


            _(this.collection.models).each(function (sp) {
                var index = this.collection.indexOf(sp);
                var isLast = (index == (this.collection.length - 1));

                var spv = new SchemaPairStrV({
                    model: sp
                });

                if (isLast) {
                    spv.last = true;
                }
                this.sb[this.l++] = spv.render();

            }, this);

            if (pSchemas) {
                this.sb[this.l++] = '}';
            } else {

                if (tupleTyping) {
                    this.sb[this.l++] = ']';
                }
            }

            return this.sb.join('');
        }
    });


    TypeLStrV = Backbone.View.extend({
        sb: [],
        l: 0,

        resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        render: function () {
            var self = this;
            var unionType = (this.collection.length > 1);

            this.resetBuffer();

            if (unionType) {
                this.sb[this.l] = '[';
            } else {
                this.sb[this.l] = '';
            }

            _(this.collection.models).each(function (type) {
                var index = this.collection.indexOf(type);
                var isLast = (index == (this.collection.length - 1));

                this.sb[this.l] += ('"' + type.get('t') + '"');
                if (!isLast) {
                    this.sb[this.l] += ',';
                }
            }, this);

            if (unionType) {
                this.sb[this.l] += ']';
            }
            return this.sb[this.l];
        }
    });

});