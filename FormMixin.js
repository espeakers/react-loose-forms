var is = require('is');
var clone = require('clone');
var InputTypes = require('./InputTypes');

var FormMixin = {
	getInitialState: function(){
		return {
			initial_values_source_version: is.fn(this.getInitialValuesSourceVersion) ? this.getInitialValuesSourceVersion(this.props) : null,
			data: this.____getInitialValues(this.props),
			errors: {},
			submit_attempts: 0
		};
	},
	componentWillReceiveProps: function(new_props){
		if(is.fn(this.getInitialValuesSourceVersion)){
			var initial_values_source_version = this.getInitialValuesSourceVersion(new_props);
			if(this.state.initial_values_source_version !== initial_values_source_version){
				this.setState({initial_values_source_version: initial_values_source_version, data: this.____getInitialValues(new_props), errors: {}, submit_attempts: 0});
			}
		}
	},
	Form_validate: function(){
		var fields = this.buildFields();
		var data = this.state.data;
		return validateFields(fields, data);
	},
	Form_onSubmit: function(e){
		if(e && e.preventDefault){
			e.preventDefault();
		}
		var self = this;
		this.setState({
				submit_attempts: this.state.submit_attempts + 1,
				errors: this.Form_validate()
			},
			function(){
				if(is.empty(self.state.errors)){
					if(is.fn(self.props.onSubmit)){
						self.props.onSubmit(self.state.data);
					}
				}else{
					if(is.fn(self.props.onSubmitFail)){
						self.props.onSubmitFail(self.state.errors);
					}
				}
			}
		);
	},
	Form_onChange: function(field_path, new_value){
		var self = this;
		var fields = this.buildFields();
		var should_validate = this.state.submit_attempts > 0;
		var data = this.state.data;

		data[field_path] = new_value;

		this.setState({
			data: data,
			errors: should_validate ? validateFields(fields, data) : null
		}, function(){
			if(is.fn(self.onFormChanged)){
				self.onFormChanged(field_path, new_value);
			}
		});
	},
	Form_buildInput: function(field, field_path){
		var input = InputTypes.getInputByType(field.type);
		return input.component({
			field: field,
			value: this.state.data[field_path],
			onChange: this.Form_onChange,
			field_path: field_path
		});
	},
	Form_reset: function(){
		this.setState({data: this.____getInitialValues(this.props), errors: {}, submit_attempts: 0});
	},
	Form_areChangesMade: function(props){
		return !is.equal(this.state.data, this.____getInitialValues(props || this.props));
	},
	____getInitialValues: function(props){
		if(is.fn(this.getInitialValues)){
			return clone(this.getInitialValues(props) || {});
		}
		return {};
	}
};

var defaultValidationFn = function(value, field){
	var valid = false;
	if(is.boolean(value)){
		valid = value === true;
	}else if(is.number(value)){
		valid = value !== 0;
	}else if(is.date(value)){
		valid = true;
	}else{
		valid = !is.empty(value);
	}
	return valid || field.label + ' is required';
};

var validateFields = function(fields, data){
	var errors = {};
	Object.keys(fields).forEach(function(field_path){
		var field = fields[field_path];
		var validation_fn = defaultValidationFn;
		if(is.fn(field.validate)){
			validation_fn = field.validate;
		}else{
			var input = InputTypes.getInputByType(field.type);
			if(is.fn(input && input.validate)){
				validation_fn = input.validate;
			}
		}
		var resp = validation_fn(data[field_path], field);
		if(resp !== true){
			errors[field_path] = is.string(resp) ? resp : 'Please check your input.';
		}
	});
	return errors;
};

module.exports = FormMixin;
