import React, {Component} from 'react';
import invariant from 'invariant';
import FieldArrayModel from './FieldArrayModel';

const makeFieldArray = form => class extends Component {
    constructor(props) {
        super(props);
        const {
            name, validate, children, component,
        } = props;
        invariant(!!name, 'FieldArray should have `name` prop');
        invariant(
            typeof children === 'function',
            'FieldArray should have function in childrens',
        );
        form.registerField(name, validate, this, true);
        this.state = {
            fields: form.arrayFields[name] || [],
        };
        /* this.pushField = (initialValues) => {
            const array = form.arrayFields[name] || [];
            if (initialValues.stopPropagation && initialValues.preventDefault) {
                initialValues = null;
            }
            form.pushArrayField(name, `${name}.${array.length}`, initialValues);
        };
        this.deleteField = (index) => {
            form.deleteArrayField(name, index);
        }; */
    }

    componentWillUnmount() {
        const {name} = this.props;
        form.unregisterField(name);
    }

    render() {
        const {
            name, validate, children, component: FieldArrayComponent, ...rest
        } = this.props;
        const {fields: fieldsArray} = this.state;
        const model = new FieldArrayModel(fieldsArray, form, name);
        if (FieldArrayComponent) {
            return <FieldArrayComponent {...rest} fields={model} />;
        }

        return children(model);
    }
};

export default makeFieldArray;
