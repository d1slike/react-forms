export const evalArrayFields = (values, namePrefix = '', arrayFields = {}) => {
    if (typeof values !== 'object') {
        return arrayFields;
    }
    Object.keys(values).forEach((k) => {
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
