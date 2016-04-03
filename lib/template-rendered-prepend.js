import {Template} from 'meteor/templating';

Template.prototype.onRenderedFirst = function(cb) {
    this._callbacks.rendered.unshift(cb);
};