/**
 * template-scope.js
 */

Template.onCreated(function () {
    let isParentObj = _.isObject(this.parent(1, true)) && _.isObject(this.parent(1, true).scope);
    let parentObj =  isParentObj ? this.parent(1, true).scope : {};
    this.scope = {};
    Object.setPrototypeOf(this.scope, parentObj);

    // Due to the fact that there is no way to get this one called prior to
    // all onCreated function, we need to call this callback.
    this.onScopeCreated && this.onScopeCreated();
});