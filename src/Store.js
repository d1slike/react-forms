import {action, computed, observable, toJS} from 'mobx';
import {flatten, unflatten} from 'flat';

const evalArrayFields = (values, namePrefix = '', arrayFields = {}) => {
    if (typeof values !== 'object') {
        return arrayFields;
    }
    Object.keys(values).forEach(k => {
        const v = values[k];
        if (Array.isArray(v)) {
            const name = namePrefix ? `${namePrefix}.${k}` : k;
            arrayFields[name] = v.map((o, index) => {
                const childName = `${name}.${index}`;
                evalArrayFields(o, childName, arrayFields);
                return childName;
            });
        }
    });
    return arrayFields;
};

class FormStore {
    static mobxLoggerConfig = {
        enabled: false,
        methods: {
            init:          true,
            onChangeField: true,
        },
    };

    @observable values = {};
    @observable errors = {};
    @observable touchedFields = {};
    @observable focusedFields = {};
    @observable validators = {};
    @observable arrayFields = {};

    registeredFields = [];

    @action
    init(values = {}) {
        this.values = flatten(values);
        this.arrayFields = evalArrayFields(values);
        this.touchedFields = {};
        this.focusedFields = {};
    }

    @action
    onChangeField(name, value, props) {
        this.values[name] = value;
        this.validateField(name, props);
    }

    @action
    onFocusField(name) {
        this.focusedFields[name] = true;
    }

    @action
    onBlurField(name) {
        const focused = this.focusedFields[name];
        if (focused) {
            this.touchedFields[name] = true;
        }
        this.focusedFields[name] = false;
    }

    @action
    deleteArrayField(arrayFieldName, index) {
        if (this.arrayFields[arrayFieldName]) {
            this.arrayFields[arrayFieldName].splice(index, 1);
        }
    }

    @action
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

    @action
    registerField(name, validators, props, isArray) {
        this.registeredFields.push(name);
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
        this.validateField(name, props);
    }

    @action
    unregisterField(name) {
        this.registeredFields = this.registeredFields.filter(field => field !== name);
        delete this.errors[name];
        delete this.touchedFields[name];
        delete this.focusedFields[name];
        delete this.validators[name];
        delete this.values[name];
        delete this.arrayFields[name];
    }

    @action.bound
    validateField(name, props) {
        if (this.validators[name]) {
            const values = this.getValues;
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

    @action
    invalidateField(name, error) {
        this.touchedFields[name] = true;
        this.errors[name] = error;
    }

    @action
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
            onSubmit(this.getValues);
        }
    }

    @computed
    get getValues() {
        return unflatten(toJS(this.values));
    }
}

export default FormStore;
