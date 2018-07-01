import React, {Component} from 'react';
import {flatten, unflatten} from 'flat';
import makeField from './Field';
import makeFieldArray from './FieldArray';
import {evalArrayFields} from './utils';

const ReactForm = (options = {}) => Comp => class Form extends Component {
        values = {};

        errors = {};

        touchedFields = {};

        focusedFields = {};

        validators = {};

        arrayFields = {};

        registeredFields = {};

        constructor() {
            super();
            this.Field = makeField(this);
            this.FieldArray = makeFieldArray(this);
        }

        onChangeField(name, value, props) {
            this.values[name] = value;
            this.validateField(name, props);
        }

        onFocusField(name) {
            this.focusedFields[name] = true;
        }

        onBlurField(name) {
            const focused = this.focusedFields[name];
            if (focused) {
                this.touchedFields[name] = true;
            }
            this.focusedFields[name] = false;
        }

        getValues() {
            return unflatten(this.values);
        }

        handleSubmit = (onSubmit, getProps) => () => {
            this.trySubmit(onSubmit, getProps);
        };

        init(values = {}) {
            this.values = flatten(values);
            this.arrayFields = evalArrayFields(values);
            this.touchedFields = {};
            this.focusedFields = {};
        }

        deleteArrayField(arrayFieldName, index) {
            if (this.arrayFields[arrayFieldName]) {
                this.arrayFields[arrayFieldName].splice(index, 1);
            }
        }

        pushArrayField(arrayFieldName, name, initialValue) {
            if (this.arrayFields[arrayFieldName]) {
                this.arrayFields[arrayFieldName].push(name);
            } else {
                this.arrayFields[arrayFieldName] = [name];
            }
            if (initialValue) {
                if (typeof initialValue === 'object') {
                    const flattentValues = flatten(initialValue);
                    for (const k of Object.keys(flattentValues)) {
                        this.values[`${name}.${k}`] = flattentValues[k];
                    }
                } else {
                    this.values[name] = initialValue;
                }
            }
        }

        registerField(name, validators, field, isArray) {
            this.registeredFields[name] = field;
            if (isArray && !this.arrayFields[name]) {
                this.arrayFields[name] = [];
            }
            if (!validators) {
                return;
            }
            if (Array.isArray(validators)) {
                this.validators[name] = validators;
            } else {
                this.validators[name] = [validators];
            }
            this.validateField(name, field.props);
        }

        unregisterField(name) {
            delete this.registeredFields[name];
            delete this.errors[name];
            delete this.touchedFields[name];
            delete this.focusedFields[name];
            delete this.validators[name];
            delete this.values[name];
            delete this.arrayFields[name];
        }

        validateField(name, props) {
            if (this.validators[name]) {
                const values = this.getValues();
                const value = this.values[name];
                let error;
                for (const f of this.validators[name]) {
                    error = f(value, values, props);
                    if (error) {
                        break;
                    }
                }
                this.errors[name] = error;
                return !error;
            }
            return true;
        }

        invalidateField(name, error) {
            this.touchedFields[name] = true;
            this.errors[name] = error;
        }

        trySubmit(onSubmit, getProps) {
            const props = typeof getProps === 'function' ? getProps() : {};
            let success = true;
            for (const field of this.registeredFields) {
                const valid = this.validateField(field, props);
                this.touchedFields[field] = true;
                if (success && !valid) {
                    success = false;
                }
            }
            if (success) {
                onSubmit(this.getValues());
            }
        }

        render() {
            return (
                <Comp
                    {...this.props}
                    form={this.form}
                    Field={this.Field}
                    FieldArray={this.FieldArray}
                    handleSubmit={this.handleSubmit}
                />
            );
        }
};

export default ReactForm;
