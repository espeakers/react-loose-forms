var is = require('is');
var clone = require('clone');
var InputTypes = require('./InputTypes');

var FormMixin = {
	getInitialState: function(){
		return {
			initial_values_source_version: this.____getInitialValuesSourceVersion(this.props),
			data: this.____getInitialValues(this.props),
			errors: {},
			submit_attempts: 0
		};
	},
	componentWillReceiveProps: function(new_props){
		var initial_values_source_version = this.____getInitialValuesSourceVersion(new_props);
		if(this.state.initial_values_source_version !== initial_values_source_version){
			this.setState({
				initial_values_source_version: initial_values_source_version,
				data: this.____getInitialValues(new_props),
				errors: {},
				submit_attempts: 0
			});
		}
	},
	Form_validate: function(){
		var fields = this.Form_buildSchema();
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
		}, function(){
			if(is.empty(self.state.errors)){
				self.____onSubmit(self.state.data);
			}else{
				self.____onSubmitFail(self.state.errors);
			}
		});
	},
	Form_onChange: function(field_name, new_value){
		var self = this;
		var fields = this.Form_buildSchema();
		var should_validate = this.state.submit_attempts > 0;
		var data = this.state.data;

		data[field_name] = new_value;

		this.setState({
			data: data,
			errors: should_validate ? validateFields(fields, data) : null
		}, function(){
			self.____onFormChanged(field_name, new_value);
		});
	},
	Form_buildInput: function(field){
		var input = InputTypes.getInputByType(field.type);
		return input.component({
			field: field,
			value: this.state.data[field.name],
			onChange: this.Form_onChange
		});
	},
	Form_reset: function(){
		this.setState({data: this.____getInitialValues(this.props), errors: {}, submit_attempts: 0});
	},
	Form_areChangesMade: function(props){
		return !is.equal(this.state.data, this.____getInitialValues(props || this.props));
	},
	Form_buildSchema: function(){
		var schema = this.____buildSchema();
		Object.keys(schema).forEach(function(name){
			schema[name].name = name;
		});
		return schema;
	},

	//Below are functions that the child can implement
	____buildSchema: function(){
		if(is.fn(this.buildSchema)){
			return this.buildSchema();
		}else{
			console.warn("react-loose-forms FormMixin expects there to be a funciton on the compoent called buildSchema that returns the schema for the form.");
			return {};
		}
	},
	____getInitialValuesSourceVersion: function(props){
		if(is.fn(this.getInitialValuesSourceVersion)){
			return this.getInitialValuesSourceVersion(props);
		}
		return null;
	},
	____getInitialValues: function(props){
		if(is.fn(this.getInitialValues)){
			return clone(this.getInitialValues(props) || {});
		}
		return {};
	},
	____onFormChanged: function(field_name, new_value){
		if(is.fn(this.onFormChanged)){
			this.onFormChanged(field_name, new_value);
		}
	},
	____onSubmit: function(data){
		if(is.fn(this.props.onSubmit)){
			this.props.onSubmit(data);
		}
	},
	____onSubmitFail: function(errors){
		if(is.fn(this.props.onSubmitFail)){
			this.props.onSubmitFail(errors);
		}
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
	return valid || (field.label || field.name) + ' is required';
};

var validateFields = function(fields, data){
	var errors = {};
	Object.keys(fields).forEach(function(field_name){
		var field = fields[field_name];
		var validation_fn = defaultValidationFn;
		if(is.fn(field.validate)){
			validation_fn = field.validate;
		}else{
			var input = InputTypes.getInputByType(field.type);
			if(is.fn(input && input.validate)){
				validation_fn = input.validate;
			}
		}
		var resp = validation_fn(data[field_name], field);
		if(resp !== true){
			errors[field_name] = is.string(resp) ? resp : 'Please check your input.';
		}
	});
	return errors;
};

module.exports = FormMixin;
