class FieldArrayModel {
    fields = [];

    form = null;

    name = '';

    constructor(fields, form, name) {
        this.fields = fields;
        this.form = form;
        this.name = name;
    }

    map(f) {

    }

    forEach(f) {

    }

    shift(initialValues = null) {

    }

    unshift() {

    }

    push(initialValues = null) {

    }

    pop() {

    }

    get lenght() {
        return this.fields.length;
    }
}

export default FieldArrayModel;
