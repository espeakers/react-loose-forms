var _ = require('lodash');
var InputTypes = require('./InputTypes');

var FormMixin = {
	getInitialState: function(){
		return {
			initial_values_source_version: _.isFunction(this.getInitialValuesSourceVersion) ? this.getInitialValuesSourceVersion(this.props) : null,
			data: this.____getInitialValues(this.props),
			errors: {},
			submit_attempts: 0
		};
	},
	componentWillReceiveProps: function(new_props){
		if(_.isFunction(this.getInitialValuesSourceVersion)){
			var initial_values_source_version = this.getInitialValuesSourceVersion(new_props);
			if(this.state.initial_values_source_version !== initial_values_source_version){
				this.setState({initial_values_source_version: initial_values_source_version, data: this.____getInitialValues(new_props), errors: {}, submit_attempts: 0});
			}
		}
	},
	Form_validate: function(callback){
		var fields = this.buildFields();
		var data = this.state.data;
		this.setState({errors: validateFields(fields, data)}, function(){
				if(_.isFunction(callback)){
					callback();
				}
			}
		);
	},
	Form_onSubmit: function(e){
		if(e && e.preventDefault){
			e.preventDefault();
		}
		var self = this;
		var fields = this.buildFields();
		var data = this.state.data;

		this.setState({
				submit_attempts: this.state.submit_attempts + 1,
				errors: validateFields(fields, data)
			},
			function(){
				var has_error = _.filter(_.values(self.state.errors)).length > 0;
				if(has_error){
					if(_.isFunction(self.props.onSubmitFail)){
						self.props.onSubmitFail(self.state.errors);
					}
				}else{
					if(_.isFunction(self.props.onSubmit)){
						self.props.onSubmit(self.state.data);
					}
				}
			}
		);
		return false;
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
			if(_.isFunction(self.onFormChanged)){
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
		return !_.isEqual(this.state.data, this.____getInitialValues(props || this.props));
	},
	____getInitialValues: function(props){
		if(_.isFunction(this.getInitialValues)){
			return _.cloneDeep(this.getInitialValues(props)) || {};
		}
		return {};
	}
};

var default_validation_fn = function(value, field){
	var valid = false;
	if(_.isBoolean(value)){
		valid = value === true;
	}else if(_.isNumber(value)){
		valid = value !== 0;
	}else if(_.isDate(value)){
		valid = true;
	}else{
		valid = !_.isEmpty(value);
	}
	return valid || field.label + ' is required';
};

var validateFields = function(fields, data){
	return _.mapValues(fields, function(field, field_path){
		var validation_fn = default_validation_fn;
		if(_.isFunction(field.validate)){
			validation_fn = field.validate;
		}else{
			var input = InputTypes.getInputByType(field.type);
			if(_.isFunction(input.validate)){
				validation_fn = input.validate;
			}
		}
		var resp = validation_fn(data[field_path], field);
		if(resp === true){
			return false;
		}
		return _.isString(resp) ? resp : 'Please check your input.';
	});
};

module.exports = FormMixin;
