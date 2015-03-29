var is = require("is");

module.exports = {
	FormInput_newValue: function(new_value){
		var onChange = this.props.onChange;
		if(is.fn(onChange)){
			onChange(this.props.field_path, new_value);
		}
	}
};
