$(document).ready(function () {


    SchemaStaticV = Backbone.View.extend({
        sb: [],
        l: 0,
        level: 0,

        setLevel: function (l) {
            this.level = l;
        },

        resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        getIndent: function (l) {
            var s = '';
            l = (l == undefined ? this.level : l);
            for (var i = 0; i < l; i++) {
                s += '\t';
            }
            return s;
        },

        render: function () {
            this.resetBuffer();
            var indent = this.getIndent();

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
                var tlv = new TypeLStaticV({
                    collection: v.Types
                });
                tlv.setLevel(this.level);

                var s = '"type":' + tlv.render();
                this.sb[this.l++] = indent + s;
            }

            if (v.DollarSchema) {
                var s = '"$schema": "' + v.DollarSchema + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.Title) {
                var s = '"title": "' + v.Title + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.SchemaId) {
                var s = '"id": "' + v.SchemaId + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.Name) {
                var s = '"name": "' + v.Name + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.Description) {
                var s = '"description": "' + v.Description + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.Required) {
                var s = '"required":' + v.Required;
                this.sb[this.l++] = indent + s;
            }
            if (v.Minimum && v.Types.isNumber()) {
                var s = '"minimum": "' + v.Minimum + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.Maximum && v.Types.isNumber()) {
                var s = '"maximum": "' + v.Maximum + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.MinItems && v.Types.isArray()) {
                var s = '"minitems": "' + v.MinItems + '"';
                this.sb[this.l++] = indent + s;
            }
            if (v.MaxItems && v.Types.isArray()) {
                var s = '"maxitems": "' + v.MaxItems + '"';
                this.sb[this.l++] = indent + s;
            }

            if (v.Properties.length > 0) {
                var pSPLView = new SchemaPairLStaticV({
                    collection: v.Properties,
                    className: 'Properties'
                });
                pSPLView.setLevel(this.level);
                var s = '"properties": ' + pSPLView.render();
                this.sb[this.l++] = indent + s;
            }

            if (v.Items.length > 0) {
                var iSPLView = new SchemaPairLStaticV({
                    collection: v.Items,
                    className: 'Items'
                });
                iSPLView.setLevel(this.level);
                var s = '"items": ' + iSPLView.render();
                this.sb[this.l++] = indent + s;
            }

            return this.sb.join(',\n');
        }

    });

    SchemaPairStaticV = Backbone.View.extend({
        sb: [],
        l: 0,
        level: 0,
        last: false,

        setLevel: function (l) {
            this.level = l;
        },

        resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        getIndent: function (l) {
            var s = '';
            l = (l == undefined ? this.level : l);
            for (var i = 0; i < l; i++) {
                s += '\t';
            }
            return s;
        },

        render: function () {
            var indent = this.getIndent();
            this.resetBuffer();

            var root = this.model.get('root');

            var v = {
                Key: this.model.get('key'),
                DataLevel: this.level,
            };

            if (root) {
                this.last = true;
            }

            if (v.Key) {
                this.sb[this.l++] = indent + '"' + v.Key + '": {';
            } else {
                this.sb[this.l++] = indent + '{';
            }

            var sv = new SchemaStaticV({
                model: this.model.get('schema')
            });
            sv.setLevel(this.level + 1);

            var eol = ''
            if (this.last) {
                eol += '\n';
            } else {
                eol += ',\n';
            }

            this.sb[this.l++] = sv.render();
            this.sb[this.l++] = (indent + '}' + eol);

            return this.sb.join('\n');
        }
    });


    SchemaPairLStaticV = Backbone.View.extend({
        sb: [],
        l: 0,
        level: 0,
        className: '',

        setLevel: function (l) {
            this.level = l;
        },

        resetBuffer: function () {
            this.sb = [];
            this.l = 0;
        },

        getIndent: function (l) {
            var s = '';
            l = (l == undefined ? this.level : l);
            for (var i = 0; i < l; i++) {
                s += '\t';
            }
            return s;
        },

        render: function () {
            var self = this;
            var pSchemas = (this.className == 'Properties');
            var iSchemas = (this.className == 'Items');
            var tupleTyping = (iSchemas && (this.collection.length > 1));
            var indent = this.getIndent();

            this.resetBuffer();

            if (pSchemas) {
                this.sb[this.l++] = '{\n';
            } else {

                if (tupleTyping) {
                    this.sb[this.l++] = '[\n';
                } else {
                    this.sb[this.l++] = '\n';
                }
            }

            var nestedLevel = (this.level + 1);

            _(this.collection.models).each(function (sp) {
                var index = this.collection.indexOf(sp);
                var isLast = (index == (this.collection.length - 1));

                var spv = new SchemaPairStaticV({
                    model: sp
                });
                spv.setLevel(nestedLevel);
                if (isLast) {
                    spv.last = true;
                }
                this.sb[this.l++] = spv.render();

            }, this);

            if (pSchemas) {
                this.sb[this.l++] = indent + '}';
            } else {

                if (tupleTyping) {
                    this.sb[this.l++] = indent + ']';
                } else {
                    this.sb[this.l++] = indent + '\n';
                }
            }

            return this.sb.join('');
        }
    });


    TypeLStaticV = Backbone.View.extend({
        sb: [],
        l: 0,
        level: 0,

        setLevel: function (l) {
            this.level = l;
        },

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