//    $("#resume-browse").change(function(){
	// 	var file = this.files[0];
	// 	//console.log(file)
	// 	if (file){
	// 		$.ajax({
 //                url: "/users/resume",
 //                type: "POST",
 //                data: file,
 //                processData: false,
 //                success: function (res) {
 //                	alert("returned from posting");
 //                	displayResume(file);
 //                }
 //            });

	// 	}else{
	// 		alert("no file was chosen");
	// 	}
	// });
	/*

	/*
    $("#resume-browse").change(function(){
		var file = this.files[0];
		console.log("file",file);
		if (file){
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function () {
			 	var uploadedResume = reader.result;
			 	$.ajax({
                url: "/users/resume",
                type: "POST",
                data: uploadedResume,
                processData: false,
                success: function (res) {
                	alert("returned from posting");
                	displayResume(file);
                }
            });
			}

		}else{
			alert("no file was chosen");
		}
	});
	*/