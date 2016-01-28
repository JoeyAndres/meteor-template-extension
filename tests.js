var testingInstanceGet = false;
var testingInstanceParent = false;
var testingData = false;

Template.noop.onCreated(function () {
  this._testTemplateFieldNoop = 50;
});

Template.testTemplate.onCreated(function () {
  this._testTemplateField = 42;
});

Template.testTemplate.helpers({
  data: function () {
    return _.extend({}, this, {data1: 'foo'});
  }
});

Template.testTemplate1.onCreated(function () {
  this._testTemplateField1 = 43;
});

Template.testTemplate1.helpers({
  data: function () {
    // We add data2, but remove data1.
    return _.omit(_.extend({}, this, {data2: 'bar'}), 'data1');
  }
});

Template.testTemplate2.onCreated(function () {
  this._testTemplateField3 = 44;
});

Template.testTemplate2.helpers({
  testInstanceGet: function () {
    if (testingInstanceGet) return EJSON.stringify(Template.instance().get(this.fieldName));
  },

  testInstanceParent: function () {
    if (!testingInstanceParent) return;

    var ancestors = [];
    var template = Template.instance();
    while (template) {
      // Only fields which start with _.
      ancestors.push(_.pick(template, _.filter(_.keys(template), function (key) {
        return key.substr(0, 1) === '_' &&
          key !== '_allSubsReadyDep' &&
          key !== '_allSubsReady' &&
          key !== '_subscriptionHandles' &&
          key !== '_globalCreated' &&
          key !== '_globalRendered' &&
          key !== '_globalDestroyed';
      })));
      template = template.parent(this.numLevels, this.includeBlockHelpers);
    }
    return EJSON.stringify(ancestors);
  },

  testData: function () {
    if (testingData) return EJSON.stringify(Template.parentData(this.numLevels));
  }
});

Template.testTemplate3.events({
  'click #button': function () {
    return true;
  }
});

Template.testTemplate4.events({
  'mousemove .current': function () {
    return true;
  }
});

Template.testTemplate8.hooks({
  rendered: function () {
    this._rendered8 = true;
  }
});

Template.testTemplate9.hooks({
  created: function () {
    this._created9 = true;
  }
});

Template.testTemplate9.helpers({
  copyAsHelper: function () {
    return 'copyAs';
  }
});

Template.testTemplate17.hooks({
  created: function () {
    this._created17 = true;
  },
  rendered: function () {
    this._rendered17 = true;
  },
  destroyed: function () {
    this._destroyed17 = true;
  },
});


Template.templateTier1.hooks({
  rendered: function() {
    this._renderedTemplateTier1 = true;
  }
});

Template.templateTier2.hooks({
  rendered: function() {
    this._renderedTemplateTier2 = true;
  }
});

Template.templateTier3.hooks({
  rendered: function() {
    this._renderedTemplateTier3 = true;
  }
});

Template.onCreated(function () {
  this._globalCreated = true;
});

Template.onRendered(function () {
  this._globalRendered = true;
});

Template.onDestroyed(function () {
  this._globalDestroyed = true;
});

Template.clearEventMaps.events({
  'click button': function () {
    return false;
  }
});

Tinytest.add('template-extension - get', function (test) {
  testingInstanceGet = true;
  try {
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField'}), '42');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField1'}), '43');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField3'}), '44');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateFieldNoop'}), '50');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_nonexistent'}), '');
  }
  finally {
    testingInstanceGet = false;
  }
});

Tinytest.add('template-extension - parent', function (test) {
  testingInstanceParent = true;
  try {
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2, includeBlockHelpers: false}), '[{"_testTemplateField3":44},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2, includeBlockHelpers: true}), '[{"_testTemplateField3":44},{"_testTemplateField1":43}]');

    var multiTierView = Blaze.render(Template.templateTier1, $('body')[0]);
    Tracker.flush();
    test.isTrue(multiTierView._templateInstance._renderedTemplateTier1);
    test.equal(multiTierView._templateInstance.parent(() => false), null);  // Should have no parent template.
    test.equal(multiTierView._templateInstance.children().length, 2);
    Tracker.flush();
    test.isTrue(multiTierView._templateInstance.children()[0]._renderedTemplateTier2);
    test.isTrue(multiTierView._templateInstance.children()[1]._renderedTemplateTier2);
    Tracker.flush();
    test.isTrue(multiTierView._templateInstance.children()[0].children()[0]._renderedTemplateTier3);
    test.isTrue(multiTierView._templateInstance.children()[0].children()[1]._renderedTemplateTier3);
    test.isTrue(multiTierView._templateInstance.children()[1].children()[0]._renderedTemplateTier3);
    test.isTrue(multiTierView._templateInstance.children()[1].children()[1]._renderedTemplateTier3);
    test.equal(multiTierView._templateInstance.children()[0].children().length, 2);
    test.equal(multiTierView._templateInstance.children()[1].children().length, 2);

    var grandChild = multiTierView._templateInstance.children()[1].children()[0];
    test.equal(grandChild.parent((t) => t.view.name === "Template.templateTier2"),
        multiTierView._templateInstance.children()[1]);

    var grandChild = multiTierView._templateInstance.children()[1].children[0];
    test.equal(grandChild.parent((t) => t.view.name === "Template.templateTier1"),
        multiTierView._templateInstance);
  }
  finally {
    testingInstanceParent = false;
  }
});

Tinytest.add('template-extension - parentData', function (test) {
  testingData = true;
  try {
    // Testing default behavior.
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null}), '{"numLevels":null,"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 0}), '{"numLevels":0,"data2":"bar"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1}), '{"numLevels":1,"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2}), '{"numLevels":2}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 3}), 'null');

    // Testing a function.
    var hasField = function (fieldName) {
      return function (data) {
        return fieldName in data;
      };
    };

    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data1')}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data2')}), '{"data2":"bar"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data3')}), 'null');
  }
  finally {
    testingData = false;
  }
});

Tinytest.add('template-extension - inheritsHelpersFrom', function (test) {
  Template.testTemplate3.inheritsHelpersFrom('testTemplate2');
  test.equal(Template.testTemplate2.__helpers[' testInstanceGet'], Template.testTemplate3.__helpers[' testInstanceGet']);
});

Tinytest.add('template-extension - inheritsHelpersFrom array', function (test) {
  Template.testTemplate4.inheritsHelpersFrom(['testTemplate1', 'testTemplate2']);
  test.equal(Template.testTemplate2.__helpers[' testInstanceGet'], Template.testTemplate4.__helpers[' testInstanceGet']);
  test.equal(Template.testTemplate1.__helpers[' data'], Template.testTemplate4.__helpers[' data']);
});

Tinytest.add('template-extension - inheritsEventsFrom', function (test) {
  Template.testTemplate5.inheritsEventsFrom('testTemplate3');
  test.equal(Template.testTemplate3.__eventMaps, Template.testTemplate5.__eventMaps);
});

Tinytest.add('template-extension - inheritsEventsFrom array', function (test) {
  Template.testTemplate6.inheritsEventsFrom(['testTemplate3', 'testTemplate4']);
  test.equal(Template.testTemplate3.__eventMaps[0], Template.testTemplate6.__eventMaps[0]);
  test.equal(Template.testTemplate4.__eventMaps[0], Template.testTemplate6.__eventMaps[1]);
});

Tinytest.add('template-extension - inheritsHooksFrom', function (test) {
  Template.testTemplate7.inheritsHooksFrom('testTemplate');
  var view = Blaze.render(Template.testTemplate7, $('body')[0]);
  test.equal(view._templateInstance._testTemplateField, 42);
});

Tinytest.add('template-extension - inheritsHooksFrom array', function (test) {
  Template.testTemplate9.inheritsHooksFrom(['testTemplate', 'testTemplate8']);
  var view = Blaze.render(Template.testTemplate9, $('body')[0]);
  test.equal(view._templateInstance._testTemplateField, 42);
  Tracker.flush();
  test.isTrue(view._templateInstance._rendered8);
});

Tinytest.add('template-extension - copyAs', function (test) {
  Template.testTemplate9.copyAs('testTemplate10');
  test.equal(Blaze.toHTML(Template.testTemplate10),'<h1>copyAs</h1>');
  var view = Blaze.render(Template.testTemplate10, $('body')[0]);
  test.isTrue(view._templateInstance._created9);
});

Tinytest.add('template-extension - copyAs array', function (test) {
  Template.testTemplate9.copyAs(['testTemplate11', 'testTemplate12']);
  test.equal(Blaze.toHTML(Template.testTemplate11),'<h1>copyAs</h1>');
  test.equal(Blaze.toHTML(Template.testTemplate12),'<h1>copyAs</h1>');
  var view = Blaze.render(Template.testTemplate11, $('body')[0]);
  test.isTrue(view._templateInstance._created9);
  view = Blaze.render(Template.testTemplate12, $('body')[0]);
  test.isTrue(view._templateInstance._created9);
});

Tinytest.add('template-extension - copyAs returns newly created template', function (test) {
  var result = Template.testTemplate.copyAs('testTemplate3');
  test.instanceOf(result, Blaze.Template);
});

Tinytest.add('template-extension - copyAs returns newly created template array', function (test) {
  var result = Template.testTemplate.copyAs(['testTemplate3', 'testTemplate4']);
  test.instanceOf(result, Array);
  test.instanceOf(result[0], Blaze.Template);
  test.instanceOf(result[1], Blaze.Template);
});

Tinytest.add('template-extension - replaces', function (test) {
  Template.testTemplate9.replaces('testTemplate14');
  Template.testTemplate14.inheritsHelpersFrom('testTemplate9');
  test.equal(Blaze.toHTML(Template.testTemplate14),'<h1>copyAs</h1>');
});

Tinytest.add('template-extension - replaces array', function (test) {
  Template.testTemplate9.replaces(['testTemplate15', 'testTemplate16']);
  Template.testTemplate15.inheritsHelpersFrom('testTemplate9');
  Template.testTemplate16.inheritsHelpersFrom('testTemplate9');
  test.equal(Blaze.toHTML(Template.testTemplate15),'<h1>copyAs</h1>');
  test.equal(Blaze.toHTML(Template.testTemplate16),'<h1>copyAs</h1>');
});

Tinytest.add('template-extension - hooks', function (test) {
  var view = Blaze.render(Template.testTemplate17, $('body')[0]);
  test.isTrue(view._templateInstance._created17);
  Tracker.flush();
  test.isTrue(view._templateInstance._rendered17);
  Blaze.remove(view);
  test.isTrue(view._templateInstance._destroyed17);
});

Tinytest.add('template-extension - global hooks', function (test) {
  var view = Blaze.render(Template.testTemplate20, $('body')[0]);
  test.isTrue(view._templateInstance._globalCreated);
  Tracker.flush();
  test.isTrue(view._templateInstance._globalRendered);
  Blaze.remove(view);
  test.isTrue(view._templateInstance._globalDestroyed);
});

Tinytest.add('template-extension - clearEventMaps', function (test) {
  test.equal(Template.clearEventMaps.__eventMaps.length, 1);
  Template.clearEventMaps.clearEventMaps();
  test.equal(Template.clearEventMaps.__eventMaps.length, 0);
});

Tinytest.add('template-extension - registerHelpers', function(test) {
  Template.registerHelpers({
    testHelper1: function() {
      return 'test1';
    },
    testHelper2: function() {
      return 'test2';
    }
  });

  test.equal(Blaze._globalHelpers.testHelper1(), 'test1');
  test.equal(Blaze._globalHelpers.testHelper2(), 'test2');
});

// Setting this number to different value prior/after to rendering templateDynamicChild will set the number of child
// rendered in templateDynamicChild.
var dynamicChildCount = new ReactiveVar(5);

// Setting this array to different value prior/after to rendering templateManualChild will set the number of child
// rendered in templateDynamicChild with corresponding data context in the given array.
var manualChildren = new ReactiveVar([]);

Template.emptyTemplate.hooks({
  rendered: function() {
    this._renderedEmptyTemplate = true;
  }
});

Template.templateOneChild.hooks({
  rendered: function() {
    this._renderedTemplateOneChild = true;
  }
});

Template.templateTwoChild.hooks({
  rendered: function() {
    this._renderedTemplateTwoChild = true;
  }
});

Template.templateDynamicChild.hooks({
  rendered: function() {
    this._renderedTemplateDynamicChild = true;
  }
});

Template.templateDynamicChild.helpers({
  childs: function() {
    var childs = [];
    for (var i = 0; i < dynamicChildCount.get(); i++) {
      childs.push(i);
    }
    return childs;
  }
});

Template.templateManualChild.hooks({
  created: function() {
    this._createdTemplateManualChild = true;
  },
  rendered: function() {
    this._renderedTemplateManualChild = true;
  }
});

Template.templateManualChild.helpers({
  childs: function() {
    return manualChildren.get();
  }
});

Template.templateTier1.hooks({
  rendered: function() {
    this._renderedTemplateTier1 = true;
  }
});

Template.templateTier2.hooks({
  rendered: function() {
    this._renderedTemplateTier2 = true;
  }
});

Template.templateTier3.hooks({
  rendered: function() {
    this._renderedTemplateTier3 = true;
  }
});

Tinytest.add('template-children - children empty-children', function(test) {
  var emptyView = Blaze.render(Template.emptyTemplate, $('body')[0]);
  Tracker.flush();
  test.isTrue(emptyView._templateInstance._renderedEmptyTemplate);
  test.equal(emptyView._templateInstance.children(), []);
});

Tinytest.add('template-children - children non-empty-children', function(test) {
  var singleChildView = Blaze.render(Template.templateOneChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(singleChildView._templateInstance._renderedTemplateOneChild);
  test.equal(singleChildView._templateInstance.children().length, 1);

  var twoChildView = Blaze.render(Template.templateTwoChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(twoChildView._templateInstance._renderedTemplateTwoChild);
  test.equal(twoChildView._templateInstance.children().length, 2);

  dynamicChildCount.set(10);
  var dynamicChildView = Blaze.render(Template.templateDynamicChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(dynamicChildView._templateInstance._renderedTemplateDynamicChild);
  test.equal(dynamicChildView._templateInstance.children().length, 10);
  var children = dynamicChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

Tinytest.add('template-children - children children destroy', function(test) {
  dynamicChildCount.set(10);
  var dynamicChildView = Blaze.render(Template.templateDynamicChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(dynamicChildView._templateInstance._renderedTemplateDynamicChild);
  test.equal(dynamicChildView._templateInstance.children().length, 10);
  var children = dynamicChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  dynamicChildCount.set(9);  // Decrease one child.
  Tracker.flush();
  test.isTrue(dynamicChildView._templateInstance._renderedTemplateDynamicChild);
  test.equal(dynamicChildView._templateInstance.children().length, 9);
  var children = dynamicChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 1, 2, 3, 4, 5, 6, 7, 8]);

  dynamicChildCount.set(4);  // Decrease more child.
  Tracker.flush();
  test.isTrue(dynamicChildView._templateInstance._renderedTemplateDynamicChild);
  test.equal(dynamicChildView._templateInstance.children().length, 4);
  var children = dynamicChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 1, 2, 3]);

  dynamicChildCount.set(0);  // No more child.
  Tracker.flush();
  test.isTrue(dynamicChildView._templateInstance._renderedTemplateDynamicChild);
  test.equal(dynamicChildView._templateInstance.children().length, 0);
  var children = dynamicChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, []);
});

// Note: this is not REORDERING, we just want to see that ordering is consistent with the data when data is changed.
//       Reordering occurs when a dom manipulation is actually done.
Tinytest.add('template-children - children children-ordering', function(test) {
  // Establish 3 children.
  manualChildren.set([0, 1, 2]);
  var dynamicChildView = Blaze.render(Template.templateManualChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(dynamicChildView._templateInstance._renderedTemplateManualChild);
  test.equal(dynamicChildView._templateInstance.children().length, 3);

  // Ensure that they are all in correct order.
  var children = dynamicChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 1, 2]);

  // Switch last two child.
  manualChildren.set([0, 2, 1]);
  var manualChildView = Blaze.render(Template.templateManualChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(manualChildView._templateInstance._renderedTemplateManualChild);

  // Ensure that they are all in correct order.
  var children = manualChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 2, 1]);

  // Switch first two child.
  manualChildren.set([2, 0, 1]);
  var manualChildView = Blaze.render(Template.templateManualChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(manualChildView._templateInstance._renderedTemplateManualChild);

  // Ensure that they are all in correct order.
  var children = manualChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [2, 0, 1]);
});

function swapElements(elm1, elm2) {
  var parent1, next1,
      parent2, next2;

  parent1 = elm1.parentNode;
  next1   = elm1.nextSibling;
  parent2 = elm2.parentNode;
  next2   = elm2.nextSibling;

  parent1.insertBefore(elm2, next1);
  parent2.insertBefore(elm1, next2);
}

Tinytest.add('template-children - multi-tier children', function(test) {
  var multiTierView = Blaze.render(Template.templateTier1, $('body')[0]);
  Tracker.flush();
  console.log(multiTierView._templateInstance);
  test.isTrue(multiTierView._templateInstance._renderedTemplateTier1);
  test.equal(multiTierView._templateInstance.children().length, 2);
  test.equal(multiTierView._templateInstance.children(1).length, 2);
  Tracker.flush();
  test.isTrue(multiTierView._templateInstance.children()[0]._renderedTemplateTier2);
  test.isTrue(multiTierView._templateInstance.children()[1]._renderedTemplateTier2);
  Tracker.flush();
  test.isTrue(multiTierView._templateInstance.children()[0].children()[0]._renderedTemplateTier3);
  test.isTrue(multiTierView._templateInstance.children()[0].children()[1]._renderedTemplateTier3);
  test.isTrue(multiTierView._templateInstance.children()[1].children()[0]._renderedTemplateTier3);
  test.isTrue(multiTierView._templateInstance.children()[1].children()[1]._renderedTemplateTier3);
  test.equal(multiTierView._templateInstance.children()[0].children().length, 2);
  test.equal(multiTierView._templateInstance.children()[1].children().length, 2);
  test.equal(multiTierView._templateInstance.children(2).length, 6);
});

Tinytest.add('template-children - children re-ordering', function(test) {
  // Establish 3 children.
  manualChildren.set([0, 1, 2]);
  var manualChildView = Blaze.render(Template.templateManualChild, $('body')[0]);
  Tracker.flush();
  test.isTrue(manualChildView._templateInstance._createdTemplateManualChild);
  Tracker.flush();
  test.isTrue(manualChildView._templateInstance._renderedTemplateManualChild);
  test.equal(manualChildView._templateInstance.children().length, 3);

  // Base case.
  // Ensure that they are all in correct order.
  var children = manualChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text; });
  test.equal(childrenTexts, [0, 1, 2]);

  // DOM manipulation.
  var template_wrapper = $('.template-manual-child').last().get(0);
  swapElements(template_wrapper.children[2], template_wrapper.children[1]);

  Tracker.flush();
  test.isTrue(manualChildView._templateInstance._renderedTemplateManualChild);
  var children = manualChildView._templateInstance.children();
  var childrenTexts = children.map(function(child) { return child.data.text });
  manualChildView._templateInstance.onReorder(function() {
    test.equal(childrenTexts, [0, 2, 1]);
  });
});