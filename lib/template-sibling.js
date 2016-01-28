Blaze.TemplateInstance.prototype.siblings = function(includeBlockHelpers = true) {
    return this.parent(1, includeBlockHelpers).children().filter(child => child !== this);
};

Blaze.TemplateInstance.prototype.getSiblings = function(includeBlockHelpers = true) {
    return this.parent(1, includeBlockHelpers).getChildren().filter(child => child !== this);
};