import React, {Component} from 'react';
import {observer, Observer} from 'mobx-react';
import {pure} from 'recompose';
import invariant from 'invariant';
import FormStore from './Store';

const MobxForm = options => Comp =>
    class Form extends Component {
        constructor() {
            super();
            const form = new FormStore();
            this.form = form;
            this.Field = pure(
                observer(
                    class Field extends Component {
                        constructor(props) {
                            super(props);
                            const {component, name, validate} = props;
                            invariant(!!component && !!name, 'Field should have `name` and `component` props');
                            form.registerField(name, validate, props);
                            this.onChange = v => {
                                if (v.target && v.type) {
                                    v = v.target.value;
                                }
                                form.onChangeField(name, v, this.props);
                            };
                            this.onBlur = e => {
                                form.onBlurField(name);
                            };
                            this.onFocus = e => {
                                form.onFocusField(name);
                            };
                        }

                        componentWillUnmount = () => {
                            const {name} = this.props;
                            form.unregisterField(name);
                        };

                        render() {
                            const {
                                name, component, validate, ...rest
                            } = this.props;
                            const FieldComponent = component;
                            const value = form.values[name];
                            const touched = form.touchedFields[name];
                            const error = touched && form.errors[name];
                            const bind = {
                                onChange: this.onChange,
                                onBlur:   this.onBlur,
                                onFocus:  this.onFocus,
                                value,
                            };
                            return <FieldComponent {...rest} error={error} bind={bind} />;
                        }
                    },
                ),
            );

            this.FieldArray = pure(
                observer(
                    class FieldArray extends Component {
                        constructor(props) {
                            super(props);
                            const {name, validate, children} = props;
                            invariant(!!name, 'FieldArray should have `name` prop');
                            invariant(typeof children === 'function', 'FieldArray should have function in childrens');
                            form.registerField(name, validate, props, true);
                            this.pushField = initialValues => {
                                const array = form.arrayFields[name] || [];
                                if (initialValues.stopPropagation && initialValues.preventDefault) {
                                    initialValues = null;
                                }
                                form.pushArrayField(name, `${name}.${array.length}`, initialValues);
                            };
                            this.deleteField = index => {
                                form.deleteArrayField(name, index);
                            };
                        }

                        render() {
                            const {name, validate, children} = this.props;
                            const fields = form.arrayFields[name] || [];
                            const func = () => children(fields, this.pushField, this.deleteField);
                            return <Observer>{func}</Observer>;
                        }
                    },
                ),
            );

            this.handleSubmit = (onSubmit, getProps) => () => {
                form.trySubmit(onSubmit, getProps);
            };
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

export default MobxForm;
