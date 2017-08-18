//author: Willow Jarvis

//Proficiency Scale. Precise definition taken from https://hr.od.nih.gov/workingatnih/competencies/proficiencyscale.htm
var proficiencyScale = {};
proficiencyScale [1] = ["You have a common knowledge or an understanding of basic techniques and concepts", "basic knowledge"]
proficiencyScale [2] = ["You have the level of experience gained in a classroom and/or experimental scenarios or as a trainee on-the-job. You are expected to need help when performing this skill", "limited experience"]
proficiencyScale [3] = ["You are able to successfully complete tasks in this competency as requested. Help from an expert may be required from time to time, but you can usually perform the skill independently", "practical experience"]
proficiencyScale [4] = ["You can perform the actions associated with this skill without assistance. You are certainly recognized within your immediate organization as 'a person to ask' when difficult questions arise regarding this skill", "applied theory"]
proficiencyScale [5] = ["You are known as an expert in this area. You can provide guidance, troubleshoot and answer questions related to this area", "recognized authority"]

$(document ).ready(function() {
	hideErrorAndSucessMessages();
	/*set up listeners to show upload resume button after user has selected a file to upload */
	$("#resume-input").change(function(){
		$('#resume-upload').show();
	});


	/*set up click listener for uploading resume button*/
	$('#uploadForm').submit(function(e) {
    e.preventDefault();
    var data = new FormData(this);
    $.ajax({
            url: '/users/resume',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',     
            success: function(data){
            	getAndRenderResume();
            },
            error: function(data){
            	$("#error-message-resume").text("Message: "+ data.err);
            }
    });
	});

	/*When update UROP interest button is clicked, update the favoriting/insterested status of each UROP*/
	$("#update-urop-interest").click(function(){
		var checkedUROPS = $(".checkbox-urops:checked");
		var uncheckedUROPS = $(".checkbox-urops:not(:checked)");

		/*For each checked UROP, post to route to add student to posting*/
		forEachTag(checkedUROPS,function(checkedUROP){
			var uropID = $(checkedUROP).attr("forurop");
			$.post("/postings/"+uropID+"/interested", function(result){
				if (result.success){
					displayMessageUROPs(true,"Message: Updated Interested UROPs");
				}else{
					displayMessageUROPs(false,"Message: "+"Could not update. Please try again later");
				}
			});

		});
		/*For each unchecked UROP, send DELETE request to route to remove student from posting*/
		forEachTag(uncheckedUROPS,function(unCheckedUROP){
			var uropID = $(unCheckedUROP).attr("forurop");
			$.ajax({
			    url: "/postings/"+uropID+"/interested",
			    type: 'DELETE',
			    success: function(result) {
			    	displayMessageUROPs(true,"Message: Updated Interested UROPs");
			    },
			    error: function(result) {
			        displayMessageUROPs(false,"Message: "+"Could not update. Please try again later");
			    }
			});

		});
	});

	/*set up slider bubble to display scale definition when clicked*/
    $('#example-slider').slider({
		formatter: function(value) {
			return proficiencyScale[value][0];
		}
	});

	//set up click listeners for menu items
	$('#urop-matcher').click(function(){
		showWelcomePage();
	});
	$('#suggested-urops').click(function(){
		showSuggestedUrops();
	});
    $('#my-skills').click(function(){
    	showSkills();
    });
    $('#previous-experiences').click(function(){
    	showResumePage();
    });

    $('#my-interests').click(function(){
    	showInterstsPage();
    });

    /** set up button click listeners for unsubscribe
    * when clicked, get all checked tags and unsubcribe them
    */
    $('#unsubcribe-button').click(function(){
    	//get all checkbox inputs for subcribed tags
    	var num_tags_selected = $('.subcribed-tags:checked').length;
    	var to_unsub_tags = $('.subcribed-tags:checked')
    	var tagNames = forEachTag(to_unsub_tags,function(e){
    		return $(e).attr("tag-name");
    	});
    	if (tagNames.length >0){
    		$.ajax({
			    url: 'tags/',
			    type: 'DELETE',
			    data: {interest_names:JSON.stringify(tagNames)},
			    success: function(result) {
			        displayMessageInterests(true,"Message: UnSubscribed Sucessfully");
			        reloadTags();
			    },
			    error: function(result) {
			        displayMessageInterests(false,"Message: "+result.err);
			    }
			});

    	}else{
    		alert("you must select a tag to unsubscribe");
    	}
    });
    /** set up button click listeners for subscribe
    * when clicked, get all checked tags and subcribe them
    */
    $('#subcribe-button').click(function(){
    	//get all checkbox inputs for tags not subscribed
		var to_sub_tags = $('.not-subcribed-tags:checked')
    	var tagNames = forEachTag(to_sub_tags,function(e){
    		return $(e).attr("tag-name");
    	});

    	if ((tagNames.length >0) || ($("#new-tag").is(':checked'))){
    		if ($("#new-tag").is(':checked')){
    			var newTagName = $("#new-tag-body").val();
    			if (newTagName.length >0){
    				tagNames.push(newTagName);
    			}else{
    				displayMessageInterests(false,"Message:" + "please enter a name for a new tag if you want to subcribe to it");
    			}
    			
    		}
    		$.post("tags/",{interests:JSON.stringify(tagNames)},function(result){
    			if (result.success){
    				reloadTags();
    				displayMessageInterests(true,"Message: Subscribed Sucessfully");
    			}else{
    				displayMessageInterests(false,"Message:" + result.err);
    			}
    		});

    	}else{
    		alert("you must select a tag to subscribe");
    	}    	
    });

    /*for expressing interest in matched urops*/
	$("#check-uncheck-all-button").change(function(){
        var isChecked = $('#check-uncheck-all-button').is(':checked'); 
        if (isChecked){
        	$(".checkbox-urops").prop('checked', true);
        }else{
			$(".checkbox-urops").prop('checked', false);
        }    
	});


    //get current user and set up header: show username and logout button
    $.get("/users/currentUser",function(username){
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

	//show main page welcome
	showWelcomePage();

});

/* for array of <input> elements, apply function fn to each*/
var forEachTag = function(tagsObj,fn){
	var num_tags = tagsObj.length;
	var tag_index = 0
	var new_tag_array = []
	while (tag_index < num_tags){
		var thisInputTag = tagsObj[tag_index]
		var thisTagModified = fn(thisInputTag);
		new_tag_array.push(thisTagModified);
		tag_index+=1;
	}
	return new_tag_array

}

var hideAllPages = function (){
		$('#welcome-message').hide();
		$('#skills').hide();
		$('#urops').hide();
		$('#resume').hide();
		$('#interests').hide();
}

var showSuggestedUrops = function(){
	hideAllPages();
	reloadMatchedUROPs();
	$('#urops').show();
	hideErrorSuccessUROPs();
}
var showSkills = function(){
	hideAllPages();
	reloadSkills();
	$('#skills').show();
	hideErrorSuccessSkills();
}

var showWelcomePage = function(){
	hideAllPages();
	$('#welcome-message').show();
}

var showResumePage = function(){
	hideAllPages();
	$("#error-message-resume").hide();
	$('#resume-upload').hide();
	getAndRenderResume();
	$('#resume').show();
}

var showInterstsPage = function(){
	hideAllPages();
	reloadTags();
	$('#interests').show();
	hideErrorSuccessInterests();
}

var reloadSkills = function(){
	$.get("/skills/", function(response) {
    var skills = response.content;
		if (response.success == true){
			var studentSkills = skills.skills;
			//studentSkills = [{name:"python", proficiency:5},{name:"java", proficiency:3},{name:"javascript", proficiency:1}]
			var skillsHTML = Handlebars.templates.skills({skill:studentSkills});
			setUpSkillAutocomplete();
		    $("#skilltable-add-button").html(skillsHTML);
		    $("#new-skill-range-slider").change(function(){
		    	var x = this.value;
		    	var lvlName = proficiencyScale[x][1];
		    	$('#new-skill-range-display').val(lvlName);
		    });
		        //set up click listener for adding new skill button
		    $('#add-skill-button').click(function(){
		    	addSkill();
		    });
		    deleteSkillsListener();
		}else{
			displayMessageSkills(false,"Message: "+ response.err);
		}
	});
}
var addSkill = function(){
	var skillName = $('#new-skill-name').val();
	var proficiency = $("#new-skill-range-slider").val();
	$.post("/skills/",{name:skillName,proficiency:proficiency},function(result){
		if (result.success == true){
			displayMessageSkills(true,"Message: New skill added");
			reloadSkills();
		}else{
			displayMessageSkills(false,"Message: "+ result.err);
		}
	});
}

var reloadMatchedUROPs = function(){
	$.get('/postings/matches',function(result){
		if (result.success == true){
			var matchedPostings = result.content.postings;
			$.get("/users/currentUser",function(username){
    			if (username.content.loggedIn == true){
		    		var currentStudentID = username.content.id;
					var processedPostings = processMatchedPostings(matchedPostings,currentStudentID);
					var uropNamesHTML = Handlebars.templates.urops_names({urop:processedPostings});
				    $("#urop-names-menu").html(uropNamesHTML);

				    $('.list-group-item').click(function(){
				    	var uid = $(this).attr("uid");
				    	loadThisUROP(uid);
				    });
				    //prevent checking being handled by parent a element that displays urop
				    $(".checkbox-urops").click(function(e) {
						e.stopPropagation();
					});
					$('.list-group-item')[0].click()
    			}else{
    				alert("You are not logged in. Please log in first.");
    			}
    		});
		}else{
			displayMessageUROPs(false,"Message: "+result.err);
		}
	});
}
/**
* Adds a field caled can favorite and set it to true for each matched posting
*/
var processMatchedPostings = function(matchedPostings,currentStudentID){
	var augmentedPostings = matchedPostings.map(function(posting){
		posting.canFavorite = true;
		var insterestedStudents = posting.interested;
		insterestedStudents.forEach(function(studentID){
			if (currentStudentID ==  studentID){
				posting.favorited = true;
			}

		});
		return posting;
	});
	return augmentedPostings;
}

var loadThisUROP = function(uid){
	$.get('/postings/'+uid,function(result){
		if (result.success == true){
			var postingInfo = result.content.posting;
			var uropInfoHTML = Handlebars.templates.matched_urops(postingInfo);
			$("#urop-display").html(uropInfoHTML);
		}else{
			displayMessageUROPs(false,"Message: "+result.err);
		}
	});

}
/** reloads interested tags */
var reloadTags = function(){
	//get tags user is subcribed to 
	$.get('tags/',function(result){
		if (result.success){
			var subbedTags = result.content.interests;
			if (subbedTags.length > 0){//display subscribed tags 
				var subbedTagObjs =  subbedTags.map(function(tagname){
					return {tagName:tagname,className:"subcribed-tags"}
				});
				var tagsInfo = {forSubcribe:false, tag:subbedTagObjs}
				var subbedTagsHTML = Handlebars.templates.tags(tagsInfo);
			    $("#subcribed-tags").html(subbedTagsHTML);
			}
		}else{
			displayMessageInterests(false, "Message: "+result.err);
		}
		
	});
	//get tags users hasn't subcrrbed to 
	$.get('tags/othertags',function(result){
		if (result.success){
			var otherTags = result.content.otherTags;
			if (otherTags.length > 0){
				var otherTagObjs = otherTags.map(function(tagname){
					return {tagName:tagname,className:"not-subcribed-tags"}
				});
				var tagsInfo = {forSubcribe:true, tag:otherTagObjs}
				var otherTagsHTML = Handlebars.templates.tags(tagsInfo);
			    $("#not-subcribed-tags").html(otherTagsHTML);
			}

		}else{
			displayMessageInterests(false, "Message: "+result.err);
		}
	});
}

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

var getAndRenderResume = function(){
	$.get("users/resume",{},function(result){
		if (result.content.resume == ""){
			$("#error-message-resume").text("You haven't uploaded a resume yet.");
			$("#error-message-resume").show();
		} else {
			var read_url = result.content.resume;
			$('#resume-view').attr('src', read_url);
			$("#error-message-resume").hide();
		}
	});
}

var hideErrorAndSucessMessages = function(){
	$(".error-message").hide();
	$(".success-message").hide();
}

var hideErrorSuccessSkills = function(){
	$("#success-message-skills").hide();
	$("#error-message-skills").hide();
}
var hideErrorSuccessUROPs = function(){
	$("#success-message-urop").hide();
	$("#error-message-urop").hide();
}
var hideErrorSuccessInterests = function(){
	$("#success-message-interests").hide();
	$("#error-message-interests").hide();
}

/** displays a given message based on if succeded or failed. */
var displayMessageSkills = function(isSuccess,msg){
	hideErrorSuccessSkills();
	if (isSuccess) {
		$("#success-message-skills").text(msg);
		$("#success-message-skills").show();
	}else{
		$("#error-message-skills").text(msg);
		$("#error-message-skills").show();
	}
}

/** displays a given message based on if succeded or failed. For UROP interests */
var displayMessageUROPs = function(isSuccess,msg){
	hideErrorSuccessUROPs();
	if (isSuccess) {
		$("#success-message-urop").text(msg);
		$("#success-message-urop").show();
	}else{
		$("#error-message-urop").text(msg);
		$("#error-message-urop").show();
	}
}
/** displays a given message based on if succeded or failed. For tag interests */
var displayMessageInterests = function(isSuccess,msg){
	hideErrorSuccessInterests();
	if (isSuccess) {
		$("#success-message-interests").text(msg);
		$("#success-message-interests").show();
	}else{
		$("#error-message-interests").text(msg);
		$("#error-message-interests").show();
	}
}

/** sets of event handler for delete a student's skill */
var deleteSkillsListener = function() {
	$(".remove-skill").click(function() {
        var name = $(this).attr("skillName");
        $.ajax({
            url: '/skills/' + name,
            method: 'DELETE'
        }).done(function(response) {
            reloadSkills();
        }).fail(function(response) {
            alert(response.responseJSON.err.message);
        });
    })
}









