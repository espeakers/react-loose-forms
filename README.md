# react-loose-forms
A form library for React that flexible and dynamic allowing it to be effective in many (if not all) situations where you need to collect user input.

See [react-loose-forms.examples](https://github.com/espeakers/react-loose-forms.examples) for some working examples.

## FormMixin
```js
var FormMixin = require("react-loose-forms");
```

### child method: buildSchema()
Return your form fields schema. This method is called during state changes so you should always return the current schema for your form (i.e. don't use hidden fields, rather don't include them in your schema if they are not to be shown).

The schema is a simple object/map/hash  where the keys are the field names and the value is the schema for the field. 

```js
  mixins: [FormMixin],
  ...
  buildSchema: function(){
    var data = this.state.data;//this is how you can get access to the
                               //current state of the form

    return {
      username: {
        type: "text", //at the bare minimum every field should define
                      //what type of input it is

        validate: function(v){//optionally add a validation function for
                              //this input. If you don't provide one it
                              //will fallback to the input types default
                              //validation, if it doesn't have one it
                              //simply returns true

          //return true if valid, otherwise return an error. An error can
          //be anything really, typically you can just return a string that
          //represents the error message that should be displayed to the user.
        }

        name: //don't define "name", the mixin will stomp over this and set
              //it to the field name. In this case it would be "username"

        //you can tac on anything else you want. It will be visible to the
        //input component. For example a select input might want you to
        //specify an "options" property with an array of options to select from
      },
      ...
    };
  },
  ...
  render: function(){
    ...
  }
```
See [react-loose-forms.examples](https://github.com/espeakers/react-loose-forms.examples) for more examples.


### child method: onFormChanged(field\_name, new\_value)
This is called whenever a field changes state. This way you can observe state changes.

### child method: getInitialValues(props)
Define this to setup the initial values for your form fields. Simply return an object keyed by field name. Use the props passed in the function rather than this.props.

### child method: getInitialValuesSourceVersion(props)
Return a string that is used to identify which initial values you are working with. When this string changes, the FormMixin will know that it is now working with different underlying data.

### this.props.onSubmit(data)
This is called when a user submits the form and it passes validation. The data is the current this.state.data.

### this.props.onSubmitFail(data)
Optionaly pass in a function to be called when a submit attempt fails due to not passing validation.

### this.state.data
An object where the keys are the field names and the values are the current value of the field. They can be strings, object whatever.

### this.state.errors
An object where the keys are the field names and the values are errors returned from the validation function. If there isn't an error for a field, it won't be

### this.state.submit\_attempts
The number of times the user has attempted a submit. This number is reset to 0 upon a successful (no validation errors) submit.

### this.Form\_buildSchema()
Call this to get the current schema. This calls your buildSchema method but ensures each field has a name property that is the same as the key for that field in the schema.

### this.Form\_onSubmit(e)
Submit the form. This first validates the form state. If an event is passed as the first argument it will call preventDefault on it. Typically you use it like this:
```js
  render: function(){

    return React.createElement("form", {onSubmit: this.Form_onSubmit},
      ...
    );
  }
```

### this.Form\_buildInput(field)
Returns an React component for the field schema. The input will be wired up to the form so it can properly sync changes, validation etc....


### this.Form\_reset()
Reset the form back to it's initial state.

### this.Form\_validate()
Run validation on all the fields. This does not update the state, it simply returns an object where the keys are the field names and the values is the error. (if there is no error, it's simply not in the object)

### this.Form\_areChangesMade()
Returns true if the form state is different than the initial state.


### this.Form\_onChange(field\_name, new\_value)
Call this if you manually want to update the state of a form field. (Internally this is what input components call to update their state.)


## FormInputMixin
```js
var FormInputMixin = require("react-loose-forms/FormInputMixin");
```
Use this mixin when creating a React component for an input.

### this.FormInput\_newValue(value)
Call this when the value of the input has changed.

## InputTypes
```js
var InputTypes = require("react-loose-forms/InputTypes");
```

### InputTypes.setInputType(type, input)
This is how you register an input type. For example, if we want to register an input type "color", you simply:
```js
InputTypes.setInputType("color", {
  component: ..., // the React component that extends FormInputMixin

  validate: ... // a custom default validation for this input type
});
```

### InputTypes.getInputByType(type)
This returns the input object associated with the type name. If the type is not found it returns the input for "text". (since a "password" or "email" type usually is the same as a text field)

# License

The MIT License (MIT)

Copyright (c) 2015 eSpeakers.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
