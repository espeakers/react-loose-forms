var _ = require('lodash');

module.exports = {
	FormInput_newValue: function(new_value){
		var onChange = this.props.onChange;
		if(_.isFunction(onChange)){
			onChange(this.props.field_path, new_value);
		}
	}
};
