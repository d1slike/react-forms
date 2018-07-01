import React, {Component} from 'react';
import invariant from 'invariant';

const makeField = form => class extends Component {
    constructor(props) {
        super(props);
        const {
            component, children, name, validate,
        } = props;
        invariant(!!name, 'Field should have `name` and props');
        invariant(
            component || typeof children === 'function',
            'Field should have `component` prop or `children` as render function',
        );
        form.registerField(name, validate, this, false);
        this.state = {
            value: form.values[name],
            error: form.errors[name],
            touched: form.touchedFields[name],
        };
        this.onChange = (v) => {
            if (v.target && v.type) {
                v = v.target.value;
            }
            form.onChangeField(name, v, this.props);
        };
        this.onBlur = (e) => {
            form.onBlurField(name);
        };
        this.onFocus = (e) => {
            form.onFocusField(name);
        };
    }

    componentWillUnmount() {
        const {name} = this.props;
        form.unregisterField(name);
    }

        setTouched = (touched = true) => this.setState({touched});

        updateField = (value, error, touched) => this.setState({value, error, touched});

        render() {
            const {
                name,
                component: FieldComponent,
                validate,
                children,
                onChange,
                onBlur,
                onFocus,
                ...rest
            } = this.props;
            const {error, value, touched} = this.state;
            if (FieldComponent) {
                return (
                    <FieldComponent
                        {...rest}
                        error={error}
                        value={value}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        onFocus={this.onFocus}
                    />
                );
            }
            const bind = {
                onChange: this.onChange,
                onBlur: this.onBlur,
                onFocus: this.onFocus,
                value,
                touched,
            };
            return children(bind);
        }
};

export default makeField;
