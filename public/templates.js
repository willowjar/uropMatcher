(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['display_user'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<p class=\"inline header-text\"> Welcome, "
    + container.escapeExpression(((helper = (helper = helpers.username || (depth0 != null ? depth0.username : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"username","hash":{},"data":data}) : helper)))
    + "</p>\n<button class=\"inline btn\" id= \"logout-button\"> Log Out </button>";
},"useData":true});
templates['matched_urops'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	<table class=\"table\">\n		<thead>\n		  <tr>\n		    <th><span class=\"bold\">Skill Name</span></th>\n		    <th><span class=\"bold\">Proficiency</span></th>\n		  </tr>\n		</thead>\n		<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.required_skills : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</tbody>\n	</table>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "		    <tr>\n		      <td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n		      <td>\n		        <div class=\"range\">\n		            <input disabled type=\"range\" name=\"range\" min=\"1\" max=\"5\" value=\""
    + alias4(((helper = (helper = helpers.proficiency || (depth0 != null ? depth0.proficiency : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proficiency","hash":{},"data":data}) : helper)))
    + "\" onchange=\"range.value=value\">\n		        </div>\n		      </td>\n		    </tr>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "		<p>None</p>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "	<table class=\"table\">\n		<thead>\n		  <tr>\n		    <th><span class=\"bold\">Skill Name</span></th>\n		    <th>Proficiency</th>\n		  </tr>\n		</thead>\n		<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.optional_skills : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</tbody>\n	</table>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "		<h4>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.tags : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</h4>\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "				<span class=\"label label-info\">\n				"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\n				</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div>\n	<p><span class=\"bold\">Term:</span> "
    + alias4(((helper = (helper = helpers.term || (depth0 != null ? depth0.term : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"term","hash":{},"data":data}) : helper)))
    + "</p>\n	<p><span class=\"bold\">Department/Lab/Center:</span> "
    + alias4(((helper = (helper = helpers.lab_name || (depth0 != null ? depth0.lab_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lab_name","hash":{},"data":data}) : helper)))
    + "</p>\n	<p><span class=\"bold\">Faculty Supervisor:</span> "
    + alias4(((helper = (helper = helpers.faculty_supervisor || (depth0 != null ? depth0.faculty_supervisor : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"faculty_supervisor","hash":{},"data":data}) : helper)))
    + "</p>\n	<br>\n	<p><span class=\"bold\">Description:</span></p>\n	<p>"
    + alias4(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n	<br>\n	<p><span class=\"bold\">Required Skills:</span></p>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.required_skills : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "	<br>\n	<p><span class=\"bold\">Optional Skills:</span></p>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.optional_skills : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "	<br>\n	<p><span class=\"bold\">Contact Name:</span> "
    + alias4(((helper = (helper = helpers.contact_name || (depth0 != null ? depth0.contact_name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"contact_name","hash":{},"data":data}) : helper)))
    + "</p>\n	<p><span class=\"bold\">Contact Email:</span> "
    + alias4(((helper = (helper = helpers.contact_email || (depth0 != null ? depth0.contact_email : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"contact_email","hash":{},"data":data}) : helper)))
    + "</p>\n	<p><span class=\"bold\">Tags:</span></p>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tags : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "\n</div>";
},"useData":true});
templates['skills'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <tr>\n      <td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n      <td>\n        <div class=\"range\">\n            <input disabled type=\"range\" name=\"range\" min=\"1\" max=\"5\" value=\""
    + alias4(((helper = (helper = helpers.proficiency || (depth0 != null ? depth0.proficiency : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proficiency","hash":{},"data":data}) : helper)))
    + "\" onchange=\"range.value=value\">\n        </div>\n      </td>\n      <td>\n      <span class=\"pull-right\"><span class=\"glyphicon glyphicon-remove remove-skill\" name = "
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "></span></span>\n      </td>\n    </tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table id = \"skills-table\" class=\"table\">\n<thead>\n  <tr>\n    <th>Skill Name</th>\n    <th>Proficiency</th>\n    <th></th>\n  </tr>\n</thead>\n<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.skill : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <tr>\n    <td><input id =\"new-skill-name\" class=\"typeahead\" placeholder=\"New Skill Name\"></input></td>\n    <td>\n        <div class=\"range\"  id = \"new-skill-level\">\n            <input id = \"new-skill-range-slider\" type=\"range\" name=\"range\" min=\"1\" max=\"5\" value=\"5\" onchange=\"range.value=value\">\n            <output id = \"new-skill-range-display\"></output>\n        </div>\n    </td>\n  </tr>\n</tbody>\n</table>\n<button type=\"button\" id=\"add-skill-button\" class=\"btn\">\nAdd New Skill\n</button>  ";
},"useData":true});
templates['skills_table'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <tr>\n      <td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n      <td>\n        <div class=\"range\">\n            <input disabled type=\"range\" name=\"range\" min=\"1\" max=\"5\" value=\""
    + alias4(((helper = (helper = helpers.proficiency || (depth0 != null ? depth0.proficiency : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proficiency","hash":{},"data":data}) : helper)))
    + "\" onchange=\"range.value=value\" disabled>\n        </div>\n      </td>\n      <td>\n      <span class=\"pull-right\"><span class=\"glyphicon glyphicon-remove remove-skill\" name="
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + " proficiency="
    + alias4(((helper = (helper = helpers.proficiency || (depth0 != null ? depth0.proficiency : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proficiency","hash":{},"data":data}) : helper)))
    + "></span></span>\n      </td>\n    </tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "\n<table class=\"table\">\n<thead>\n  <tr>\n    <th>Skill Name</th>\n    <th>Proficiency</th>\n    <th></th>\n  </tr>\n</thead>\n<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.skill : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</tbody>\n</table>";
},"useData":true});
templates['suggested_students'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <tr>\n      <td><a href=\"/studentProfile.html?kerberos="
    + alias4(((helper = (helper = helpers.kerberos || (depth0 != null ? depth0.kerberos : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"kerberos","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</a></td>\n      <td class=\"year\">"
    + alias4(((helper = (helper = helpers.year || (depth0 != null ? depth0.year : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"year","hash":{},"data":data}) : helper)))
    + "</td>\n      <td>"
    + alias4(((helper = (helper = helpers.departments || (depth0 != null ? depth0.departments : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"departments","hash":{},"data":data}) : helper)))
    + "</td>\n      <td>"
    + alias4(((helper = (helper = helpers.kerberos || (depth0 != null ? depth0.kerberos : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"kerberos","hash":{},"data":data}) : helper)))
    + "@mit.edu</td>\n    </tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"table student-table\">\n  <thead>\n    <tr>\n      <th>Name</th>\n      <th class=\"year\">Year</th>\n      <th>Department</th>\n      <th>Email</th>\n    </tr>\n  </thead>\n  <tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.students : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </tbody>\n</table>";
},"useData":true});
templates['tags'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<li class=\"list-group-item\"><input type=\"checkbox\" class = \""
    + alias4(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"className","hash":{},"data":data}) : helper)))
    + "\" value=\"\" tag-name = \""
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + "\" ></input> &nbsp;<span class=\"label label-default\">"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + "</span></li>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "	<li class=\"list-group-item\"><input type=\"checkbox\" value=\"\" id = \"new-tag\"></input> &nbsp; <span class=\"label label-default\"> <input id=\"new-tag-body\" placeholder=\"Create A New Tag\"></input></span></li> \n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tag : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.forSubcribe : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['urop_post_view'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "\n\n<div class=\"well\">\n	<ul class=\"nav nav-tabs\">\n	  <li class=\"post-tab description active\"><a href=\"#\">Description</a></li>\n	  <li class=\"post-tab suggested-students\"><a href=\"#\">Suggested Students</a></li>\n	</ul>\n\n	<div class=\"post tab-content\">\n\n	</div>\n\n	<div class=\"students tab-content\">\n	</div>\n</div>";
},"useData":true});
templates['urops_names'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<a class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.match_based_on_interest : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " list-group-item\" uid = "
    + alias4(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"_id","hash":{},"data":data}) : helper)))
    + ">	\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.canFavorite : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + " \n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.canDelete : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</a>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return " highlighted ";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "			<input type=\"checkbox\" class = \"checkbox-urops\" forurop = \""
    + container.escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"_id","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.favorited : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "></input>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return " checked ";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "			<span class=\"pull-right\"><span class=\"glyphicon glyphicon-remove remove-posting\" uid = "
    + container.escapeExpression(((helper = (helper = helpers._id || (depth0 != null ? depth0._id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"_id","hash":{},"data":data}) : helper)))
    + "></span></span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "\n\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.urop : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['user_profile'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "      "
    + container.escapeExpression(container.lambda(depth0, depth0))
    + ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},(data && data.last),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return ", ";
},"4":function(container,depth0,helpers,partials,data) {
    return "      <span class=\"label label-info\">\n      "
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\n      </span>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <tr>\n      <td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n      <td>\n        <div class=\"range\">\n            <input type=\"range\" name=\"range\" min=\"1\" max=\"5\" value=\""
    + alias4(((helper = (helper = helpers.proficiency || (depth0 != null ? depth0.proficiency : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"proficiency","hash":{},"data":data}) : helper)))
    + "\" onchange=\"range.value=value\">\n        </div>\n      </td>\n    </tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<p>Kerberos: "
    + alias4(((helper = (helper = helpers.kerberos || (depth0 != null ? depth0.kerberos : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"kerberos","hash":{},"data":data}) : helper)))
    + "</p>\n<p>Name: "
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</p>\n<p>Year: "
    + alias4(((helper = (helper = helpers.year || (depth0 != null ? depth0.year : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"year","hash":{},"data":data}) : helper)))
    + "</p>\n<p>Departments:\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.departments : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</p>\n<p>Interests:\n  <h4>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.interests : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </h4>\n</p>\n<p>Hours Able to Work (per week): "
    + alias4(((helper = (helper = helpers.hours_able_to_work || (depth0 != null ? depth0.hours_able_to_work : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"hours_able_to_work","hash":{},"data":data}) : helper)))
    + "</p>\n<p>Skills:</p>\n<table id = \"skills-table\" class=\"table\">\n<thead>\n  <tr>\n    <th>Skill Name</th>\n    <th>Proficiency</th>\n  </tr>\n</thead>\n<tbody>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.skills : depth0),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</tbody>\n</table>\n";
},"useData":true});
})();