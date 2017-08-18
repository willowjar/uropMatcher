//Author: Elise Xue

var requiredskills = [];
var optionalskills = [];

$(document).ready(function(){

    //Load posted UROPs - "My Posted UROPs" tab is active by default
    $.get("/postings/",function(response){
        var postings = response.content.postings;
        postings.forEach(function(post) {
            post.canDelete = true;
        })
        var list_items = [];

        var uropNamesHTML = Handlebars.templates.urops_names(
            {urop:postings});
        $("#urop-names-menu").html(uropNamesHTML);
        postDeleteListener();

        if (postings.length > 0) {
            $('.list-group-item').first().addClass("active");
            var post_id = $('.list-group-item').first().attr("uid");
            loadPostViewTabs(post_id);

            $('.list-group-item').click(function() {
                $('.list-group-item').removeClass("active");
                $(this).addClass("active");
                var uid = $(this).attr("uid");
                loadPostViewTabs(uid);
            })
        }
    });

    //Loads the MIT departments for the UROP posting form, taken from local JSON file
    $.getJSON("data/mit_departments.json", function(departments_list) {
        var departmentHtml = ""
        departments_list.forEach(function(department) {
            var dhtml = "<option value=\"" + department.department + "\">" + department.name + "</option>";
            departmentHtml += dhtml;
        });
        $( ".department-label" ).after( departmentHtml );
    });


    //Get current user and set up header: show username and logout button
    $.get("/users/currentStaff",function(username){
        var username = username;
        if (username.content.loggedIn == true){
            var kerberos = username.content.kerberos;
            var usernameLogOutHTML = Handlebars.templates.display_user({username:kerberos});
            $("#user-name-log-out-header").html(usernameLogOutHTML);
            //set up click handler for logout
            $("#logout-button").click(function(){
                $.post("/users/logout",function(){
                    window.location.href = "index.html";
                });
            });
        }else{
            alert("You are not logged in currently. Please log in first");
        }
    });

    $('#example-slider').slider({
        formatter: function(value) {
            return proficiencyScale[value][0];
        }
    });

    $('.skills-slider').slider({
        formatter: function(value) {
            return proficiencyScale[value][1];
        }
    });


    $(".urop-post-form").hide();

    //hides/shows respective divs when the sidebar tabs are clicked
    $(".view-posted-urops").click(function(){
        $(".urop-post-form").hide();
        $(".urops-list").show();
        $(this).addClass("active");
        $(".post-urop-form").removeClass("active");
    });
    $(".post-urop-form").click(function(){
        $(".urop-post-form").show();
        $(".urops-list").hide();
        $(".view-posted-urops").removeClass("active");
        $(this).addClass("active");
        reloadRequiredSkills();
        reloadOptionalSkills();
    });

    //retrieves the current date, generates UROP term fields
	var currentTime = new Date()
	var month = currentTime.getMonth() + 1
	var year = currentTime.getFullYear()

	//Sets the year to the "school year", the year at the end of the school year (June)
	if (month >= 9) {
		year = year + 1;
	}

	//Populates the terms dropdown. Checks first to see if any of the deadlines for the terms have passed,
    //  then adds to the dropdown if there is still time to apply.
	var terms = $("#term");
    $.getJSON("data/urop_deadlines.json", function(deadlines_list) {
    	$.each(["FALL", "IAP", "SPRING", "SUMMER"], function() {
            if (currentTime <= new Date(deadlines_list[this])) {
        		if (this == "FALL") {
        			terms.append($("<option />").val(this + (year - 1)).text(this + " " + (year-1)));
        		} else {
        			terms.append($("<option />").val(this + year).text(this + " " + (year)));
        		}
            }
    	});
    })

    //Adds submit button handler to submit button
    $('#urop-form-submit-btn').click(function() {
        submitListener();
    });


    //Sets up autocomplete using typeahead.js using all tag names.
    //  Also sets up bootstrap tags input. 
    $.get("/tags/dictionary" ,function(response){
        var tagnames = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('word'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: response.content.dictionary
        });

        tagnames.initialize();

        $('input#tags').tagsinput({
          typeaheadjs: {
            name: 'tagnames',
            displayKey: 'word',
            valueKey: 'word',
            source: tagnames.ttAdapter()
          }
        });
    })

});

/**
  * Loads the UI to view information about a UROP posting and the
  *   suggested students.
  *
  * @param post_id - the ID string of the posting
  */
var loadPostViewTabs = function(post_id) {

    $.get('/postings/'+post_id,function(result){
        if (result.success == true){
            var post = result.content.posting;
        
            var html = Handlebars.templates.urop_post_view();

            $("#current-posted-urop").html("");
            $("#current-posted-urop").html(html);

            var postviewhtml = Handlebars.templates.matched_urops({
                term: post.term,
                title: post.title,
                lab_name: post.lab_name,
                faculty_supervisor: post.faculty_supervisor,
                description: post.description,
                required_skills: post.required_skills,
                optional_skills: post.optional_skills,
                contact_name: post.contact_name,
                contact_email: post.contact_email,
                tags: post.tags
            });

            $(".post.tab-content").html("");
            $(".post.tab-content").html(postviewhtml);

            var matched_students_url = "/postings/" + post._id + "/matches";

            $.get(matched_students_url ,function(response){
                var studenthtml = Handlebars.templates.suggested_students({
                    students: response.content.students
                })

                $(".tab-content.students").html("");
                $(".tab-content.students").html(studenthtml);

                $('.star').raty({
                  number: 1,
                  cancel: true,
                  starType: 'i'
                });

                $(".star").click(function() {
                    var id = $(this).id;
                    var score = $(this).raty('score');  
                    if (score == 1) {

                    } else {
                        
                    }
                })

                $(".tab-content.students").hide();

                $(".post-tab.description").click(function() {
                    $(".tab-content.post").show();
                    $(".tab-content.students").hide();
                    $(".post-tab.suggested-students").removeClass("active");
                    $(".post-tab.description").addClass("active");
                })

                $(".post-tab.suggested-students").click(function() {
                    $(".tab-content.students").show();
                    $(".tab-content.post").hide();
                    $(".post-tab.description").removeClass("active");
                    $(".post-tab.suggested-students").addClass("active");
                })

            })

        } else{
            alert(result.err);
        }

    });
}

var proficiencyScale = {};
proficiencyScale [1] = ["You have a common knowledge or an understanding of basic techniques and concepts", "basic knowledge"]
proficiencyScale [2] = ["You have the level of experience gained in a classroom and/or experimental scenarios or as a trainee on-the-job. You are expected to need help when performing this skill", "limited experience"]
proficiencyScale [3] = ["You are able to successfully complete tasks in this competency as requested. Help from an expert may be required from time to time, but you can usually perform the skill independently", "practical experience"]
proficiencyScale [4] = ["You can perform the actions associated with this skill without assistance. You are certainly recognized within your immediate organization as 'a person to ask' when difficult questions arise regarding this skill", "applied theory"]
proficiencyScale [5] = ["You are known as an expert in this area. You can provide guidance, troubleshoot and answer questions related to this area", "recognized authority"]

/**
  * Sets up autocomplete using typeahead.js using all skill names
  */
var setUpSkillAutocomplete = function() {
    $.get("/skills/dictionary" ,function(response){
        var skills = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('word'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: response.content.dictionary
        });

        skills.initialize();

        $('#new-skill-name.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'skills',
            display: 'word',
            source: skills
        });
    })
}

/**
  * Reloads the required skills UI.
  */
var reloadRequiredSkills = function(){
    var requiredSkills = requiredskills;
    var skillsHTML = Handlebars.templates.skills({skill:requiredSkills});
    setUpSkillAutocomplete();
    $(".required#skilltable-add-button").html(skillsHTML);
    $( "div.required" ).find('#add-skill-button').click(function(){
        addRequiredSkill();
    });
    deleteRequiredSkillsListener();
}

/**
  * Adds an required skill to the optional skill list.
  */
var addRequiredSkill = function(){
    var skillName = $( "div.required" ).find('#new-skill-name').val();
    if (skillName == "") {
        alert("Skill Name field cannot be empty");
    } else {
        var proficiency = $( "div.required" ).find('#new-skill-range-slider').val();
        requiredskills.push({"name": skillName, "proficiency": proficiency});
        reloadRequiredSkills();
    }
}

/**
  * Reloads the optional skills UI.
  */
var reloadOptionalSkills = function(){
    var optionalSkills = optionalskills;
    var skillsHTML = Handlebars.templates.skills({skill:optionalSkills});
    setUpSkillAutocomplete();
    $(".optional#skilltable-add-button").html(skillsHTML);
    $( "div.optional" ).find('#add-skill-button').click(function(){
        addOptionalSkill();
    });
    deleteOptionalSkillsListener();
}

/**
  * Adds an optional skill to the optional skill list.
  */
var addOptionalSkill = function(){
    var skillName = $( "div.optional" ).find('#new-skill-name').val();
    if (skillName == "") {
        alert("Skill Name field cannot be empty");
    } else {
        var proficiency = $( "div.optional" ).find('#new-skill-range-slider').val();
        optionalskills.push({"name": skillName, "proficiency": proficiency});
        reloadOptionalSkills();
    }
}

/** sets of event handler for deleting a required skill */
var deleteRequiredSkillsListener = function() {
    $( "div.required" ).find(".remove-skill").click(function() {
        var name = $(this).attr("skillName");
        var proficiency = $(this).attr("proficiency");
        var itemtoRemove = {"name": name, "proficiency": proficiency};
        requiredskills = requiredskills.filter(function(skill) {
            return !(itemtoRemove.name === skill.name && itemtoRemove.proficiency === skill.proficiency);
        })
        reloadRequiredSkills()

    })
}

/** sets of event handler for deleting an optional skill */
var deleteOptionalSkillsListener = function() {
    $( "div.optional" ).find(".remove-skill").click(function() {
        var name = $(this).attr("skillName");
        var proficiency = $(this).attr("proficiency");
        var itemtoRemove = {"name": name, "proficiency": proficiency};
        optionalskills = optionalskills.filter(function(skill) {
            return !(itemtoRemove.name === skill.name && itemtoRemove.proficiency === skill.proficiency);
        })
        reloadOptionalSkills()

    })
}

/**
  * Sets up action listeners for when the Submit UROP button is clicked.
  * Checked for errors in the posting form, and sends a request to post the UROP.
  */
var submitListener = function() {
    $(".error-message").html("");
    var error = false;
    if ($('#title').val() == "") {
        $(".error-message.title").html("UROP must have a title");
        error = true;
    }
    if ($('#supervisor').val() == "") {
        $(".error-message.faculty-supervisor").html("UROP must have a supervisor");
        error = true;
    }
    if ($('textarea#description').val() == "") {
        $(".error-message.description").html("UROP must have a description");
        error = true;
    }
    if ($('#term').val() == undefined) {
        $(".error-message.term").html("UROP must have a term");
        error = true;
    }
    if ($('#lab').val() == "") {
        $(".error-message.lab").html("UROP must have an associated lab");
        error = true;
    }
    if ($('#deadline').val() == "") {
        $(".error-message.deadline").html("Must have valid deadline");
        error = true;
    }
    if ($('#hours').val() == "") {
        $(".error-message.hours").html("Must have expected hours per week");
        error = true;
    }
    if ($('#courses').val() == null) {
        $(".error-message.departments").html("Must have expected desired department for UROPs");
        error = true;
    }
    if ($('#contact-name').val() == "") {
        $(".error-message.contact-name").html("Must have contact name");
        error = true;
    }
    if ($('#contact-email').val() == "") {
        $(".error-message.contact-email").html("Must have contact email");
        error = true;
    }

    if (error) {
        alert("Invalid posting \nPlease fix indicated fields")
    } else {
        $.post('/postings/', {
            contact_name: $('#contact-name').val(),
            contact_email: $('#contact-email').val(),
            faculty_supervisor: $('#supervisor').val(),
            lab_name: $('#lab').val(),
            title: $('#title').val(),
            description: $('textarea#description').val(),
            required_skills: JSON.stringify(requiredskills),
            optional_skills: JSON.stringify(optionalskills),
            deadline: $('#deadline').val(),
            term: $('#term').val(),
            departments: JSON.stringify($('#courses').val()),
            expected_hours_per_week: $('#hours').val(),
            tags: JSON.stringify($('#tags').tagsinput('items'))
        }).done(function(resp) {
            location.reload();
        }).fail(function(resp) {
            var errors = resp.responseJSON.err.errors;
            if (errors.contact_email) {
                $(".error-message.contact-email").html(errors.contact_email.message);
            }
            if (errors.expected_hours_per_week) {
                $(".error-message.hours").html("Hours Per Week must be a number");
            }
            if (errors.faculty_supervisor) {
                $(".error-message.faculty-supervisor").html(errors.faculty_supervisor.message);
            }
            if (errors.contact_name) {
                $(".error-message.contact-name").html(errors.contact_name.message);
            }
            if (errors.deadline) {
                $(".error-message.deadline").html(errors.deadline.message);
            }
            alert("Invalid posting \nPlease fix indicated fields")
        });
    }
    
}

/**
  * Sets up action listeners for when a post delete button is clicked.
  * Sends delete request to delete a UROP posting.
  */
var postDeleteListener = function() {
    $(".remove-posting").click(function() {
        var id = $(this).attr("uid");
        $.ajax({
            url: '/postings/' + id,
            method: 'DELETE'
        }).done(function(response) {
            location.reload();
        }).fail(function(response) {
            alert(response.responseJSON.err.message);
        });
    })
}

