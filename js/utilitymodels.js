$(document).ready(function() {

    TypeEnum = Backbone.Model.extend({}, 
    	{
			STRING : "string",
			NUMBER : "number",
			INTEGER : "integer",
			BOOLEAN : "boolean",
			OBJECT : "object",
			ARRAY : "array",
			NULL : "null",
			ANY : "any"
		}
	);

});
