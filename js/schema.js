// Namespace.
var JsonSchema = new function () {

        // ---------- Private Objects ---------- //
        function Schema4Schema(aJsonObject) {

            var schema = new Schema();
            var keys = Object.keys(aJsonObject);

            for (k in keys) {

                var propertyKey = keys[k];
                var propertyValue = aJsonObject[propertyKey];
                var propertyValueType = RealTypeOf(propertyValue);

                if (propertyKey == '$schema') {
                    schema.set({
                        dollarschema: propertyValue
                    });
                } else if (propertyKey == 'required') {
                    schema.set({
                        required: propertyValue
                    });
                } else if (propertyKey == 'title') {
                    schema.set({
                        title: propertyValue
                    });
                } else if (propertyKey == 'name') {
                    schema.set({
                        name: propertyValue
                    });
                } else if (propertyKey == 'id') {
                    schema.set({
                        schemaid: propertyValue
                    });
                } else if (propertyKey == 'description') {
                    schema.set({
                        description: propertyValue
                    });
                } else if (propertyKey == 'minimum') {
                    schema.set({
                        minimum: propertyValue
                    });
                } else if (propertyKey == 'maximum') {
                    schema.set({
                        maximum: propertyValue
                    });
                } else if (propertyKey == 'minitems') {
                    schema.set({
                        minitems: propertyValue
                    });
                } else if (propertyKey == 'maxitems') {
                    schema.set({
                        maxitems: propertyValue
                    });
                } else if (propertyKey == 'properties') {

                    var nestedKeys = Object.keys(propertyValue);

                    for (l in nestedKeys) {

                        var nestedPropertyKey = nestedKeys[l];
                        var nestedPropertyValue = propertyValue[nestedPropertyKey];
                        var nestedPropertyValueType = RealTypeOf(nestedPropertyValue);

                        var nestedSchema = Schema4Schema(nestedPropertyValue);
                        var nestedSchemaPair = new SchemaPair({
                            key: nestedPropertyKey,
                            schema: nestedSchema
                        });
                        schema.addProperty(nestedSchemaPair);
                    }


                } else if (propertyKey == 'items') {

                    if (propertyValueType == TypeEnum.OBJECT) {

                        var nestedSchemaPair = new SchemaPair({
                            schema: Schema4Schema(propertyValue)
                        });
                        schema.addItem(nestedSchemaPair);

                    } else if (propertyValueType == TypeEnum.ARRAY) {

                        var nestedKeys = Object.keys(propertyValue);

                        for (m in nestedKeys) {
                            var nestedPropertyKey = nestedKeys[m];
                            var nestedPropertyValue = propertyValue[nestedPropertyKey];
                            var nestedPropertyValueType = RealTypeOf(nestedPropertyValue);

                            var nestedSchema = Schema4Schema(nestedPropertyValue);
                            var nestedSchemaPair = new SchemaPair({
                                schema: nestedSchema
                            });
                            schema.addItem(nestedSchemaPair);
                        }
                    }
                } else if (propertyKey == 'type') {

                    if (propertyValueType == TypeEnum.ARRAY) {

                        var nestedKeys = Object.keys(propertyValue);

                        for (n in nestedKeys) {
                            var nestedPropertyKey = nestedKeys[n];
                            var nestedPropertyValue = propertyValue[nestedPropertyKey];
                            var type = new Type({
                                t: nestedPropertyValue
                            });
                            schema.addType(type);
                        }
                    } else if (propertyValueType == TypeEnum.STRING) {
                        var type = new Type({
                            t: propertyValue
                        });
                        schema.addType(type);
                    }
                }
            }
            return schema;
        }



        function Schema4Object(aJsonObject) {

            var objectType = new Type({
                t: TypeEnum.OBJECT
            });
            var schema = new Schema();
            schema.addType(objectType);

            var keys = Object.keys(aJsonObject);

            for (k in keys) {
                var propertyKey = keys[k];
                var propertyValue = aJsonObject[propertyKey];
                var propertyValueType = RealTypeOf(propertyValue);

                if (propertyValueType == TypeEnum.STRING || propertyValueType == TypeEnum.NUMBER || propertyValueType == TypeEnum.BOOLEAN) {

                    var type = new Type({
                        t: propertyValueType
                    });
                    var propertySchema = new Schema();
                    propertySchema.addType(type);

                    var propertySchemaPair = new SchemaPair({
                        key: propertyKey,
                        schema: propertySchema
                    });
                    schema.addProperty(propertySchemaPair);
                } else if (propertyValueType == TypeEnum.OBJECT) {
                    var propertySchema = Schema4Object(propertyValue);
                    var propertySchemaPair = new SchemaPair({
                        key: propertyKey,
                        schema: propertySchema
                    });
                    schema.addProperty(propertySchemaPair);
                } else if (propertyValueType == TypeEnum.ARRAY) {
                    var itemSchema = Schema4Array(propertyValue);
                    var propertySchemaPair = new SchemaPair({
                        key: propertyKey,
                        schema: itemSchema
                    });
                    schema.addProperty(propertySchemaPair);
                }
            }
            return schema;
        }

        function Schema4Value(aJsonValue) {
            var valueType = RealTypeOf(aJsonValue);
            var type = new Type({
                t: valueType
            });
            var schema = new Schema();
            schema.addType(type);
            return schema;
        }

        function Schema4Array(aJsonArray) {

            var schema = new Schema();
            var type = new Type({
                t: TypeEnum.ARRAY
            });
            schema.addType(type);

            var keys = Object.keys(aJsonArray);
            var existingSchemaItems = new Array();
            var schemaPairArray = new Array();
            var doTupleTyping = false;
            var firstKey = true;

            for (k in keys) {
                var propertyKey = keys[k];
                var propertyValue = aJsonArray[propertyKey];
                var propertyValueType = RealTypeOf(propertyValue);

                var itemSchema;
                var itemSchemaPair;

                if (propertyValueType == TypeEnum.OBJECT) {
                    itemSchema = Schema4Object(propertyValue);
                } else {
                    itemSchema = Schema4Value(propertyValue);
                }

                itemSchemaPair = new SchemaPair({
                    schema: itemSchema
                });

                /* Remember all SchemaPairs because we don't want to 
			add them to the parent schema yet. */
                schemaPairArray.push(itemSchemaPair);
                /* Doesn't actually create JSON, just returns an object that is 'safe' 
			or 'sensible' to call JSON.stringify on. */
                var itemSchemaAsJson = itemSchema.toJSON();
                // Does this schema already exist in the array?
                var duplicateSchema = JsonObjectExistsInArray(itemSchemaAsJson, existingSchemaItems);

                if (!duplicateSchema && !firstKey) {
                    /* New schema for item and not first schema.
			 	Therefore we need ALL schemas...even duplicates for Tuple Typing. */
                    doTupleTyping = true;
                }
                firstKey = false;
            }
            /*
		Document: draft-zyp-json-schema-03
		Section: 5.5. items:
		What: When this attribute value is an array of schemas and the instance 
		value is an array, each position in the instance array MUST conform 
		to the schema in the corresponding position for this array.  This 
		called tuple typing.
       */
            if (doTupleTyping) {
                // Tuple Typing requires all schema.
                for (var i = 0; i < schemaPairArray.length; i++) {
                    schema.addItem(schemaPairArray[i]);
                }
            } else {
                // All items can be represented with same schema, so just use first.
                if (schemaPairArray[0]) {
                    schema.addItem(schemaPairArray[0]);
                } else {
                    // Array had no items, so no schemas where generated, provide default.
                    schema.addItem(new SchemaPair({
                        schema: new Schema()
                    }));
                }
            }
            return schema;
        }


        function JsonObjectExistsInArray(newObject, existingSchemaItems) {
            var objString = JSON.stringify(newObject);

            for (var i = 0; i < existingSchemaItems.length; i++) {
                if (objString == existingSchemaItems[i]) {
                    return true;
                }
            }
            existingSchemaItems.push(objString);
            return false;
        }


        function RealTypeOf(v) {
            if (typeof (v) == TypeEnum.OBJECT) {

                if (v === null) {
                    return TypeEnum.NULL;
                }
                if (v.constructor == (new Array).constructor) {
                    return TypeEnum.ARRAY;
                }
                return TypeEnum.OBJECT;
            }
            return typeof (v);
        }


        // ---------- Public Objects ---------- //


        this.GenerateSchema = function () {

            var schemaVersion = 'http://json-schema.org/draft-03/schema';
            // var jsonString = $('#UserInput textarea').val().replace(/\x0A/gm,'');
            // jsonString = jsonString.replace(/\x0a/gm,'');
            // jsonString = jsonString.replace(/\x20/gm,'');
            var jsonString = $('form#Input textarea').val();
            var inputType = $('form#Input input:[name=InputType]:checked').val();



            var jsonObject;

            if (jsonString == '') {
                return new Schema({
                    dollarschema: schemaVersion
                });
            }

            try {
                jsonObject = JSON.parse(jsonString);
            } catch (err) {
                console.log(err.message);
                console.log(err.at);
                console.log(err.name);
                console.log(err.text);
                console.log(err);
                return new Schema({
                    dollarschema: schemaVersion
                });
            }

            var schema;

            if (inputType == 'schema') {
                // Schema -> Schema
                schema = Schema4Schema(jsonObject);
            } else {
                // JSON -> Schema
                schema = Schema4Object(jsonObject);
                schema.set({
                    dollarschema: schemaVersion
                });
            }

            return schema;
        }
    };