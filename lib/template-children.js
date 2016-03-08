/**
 * template-children.js
 */

/**
 * @returns {Array|*} Array of templates that are child of the current template. They have the same ordering in DOM.
 */
Blaze.TemplateInstance.prototype.children = function(tier = 1) {
    return _flatten_tree(tier, this, false);
};

/**
 * @returns {Array|*} Array of templates that are child of the current template. They have the same ordering in DOM. Reactive.
 */
Blaze.TemplateInstance.prototype.getChildren = function(tier = 1) {
    return _flatten_tree(tier, this, true);
};

function _flatten_tree (tier, templateInstance, reactive = false) {
    let children = reactive ? templateInstance._childrenReactive.get() : templateInstance._children;
    if (tier === 1) return children;
    return _.reduce(
        children,
        (childrenAcc, child) => childrenAcc.concat(_flatten_tree(tier - 1, child, reactive)),
        children);
}

Template.onCreated(function () {
    this._children = [];
    this._childrenReactive = new ReactiveVar([]);
});

Template.onRendered(function () {
    let parent = this.parent(1, true);

    if (!!parent && !!parent._children) {  // For some reason, onRendered is called without onCreated, hence this check.
        // See if this template already exist as parent's children.
        let alreadyExist = parent._children.find((child) => { child === this; });

        // If it doesn't exist, add it as parent's child.
        if (!alreadyExist) {
            let newChildren = parent._children;
            newChildren.push(this);
            parent._setChildren(newChildren);
        }
    }
});

Template.onDestroyed(function () {
    let parent = this.parent(1, true);
    if (!!parent && !!parent._children) {
        let parentChildren = parent._children;
        parentChildren.splice(parentChildren.indexOf(this), 1);
        parent._setChildren(parentChildren);
    }
});

/**
 * @param {Blaze.Template} template
 * @returns {Range|TextRange}
 * @throws Exception when error occurs.
 */
Blaze.TemplateInstance.prototype._createRange = function() {
    let range = rangy.createRange();

    range.setStart(this.firstNode);
    range.setEnd(this.lastNode);

    return range;
};

/**
 * Called to set the children of this template. Use this method so that reactive and non-reactive update is consistent.
 *
 * @param children
 * @private
 */
Blaze.TemplateInstance.prototype._setChildren = function(children) {
    this._children = children;
    this._childrenReactive.set(children);
};