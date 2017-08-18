# UROP Matcher

You can access our web app here: https://uropmatcher.herokuapp.com/ :pear: <br />
Run `npm test` to run tests. 

## Pre-populated data
Our web app makes calls to MIT People API to make sure that users sign up for the right type of account (student/staff). Graduate students are counted as staffs in our web app. This feature makes it difficult to test our web app, so we included some test data when db is loaded, and you can log in using the test credentials to test our features. 
- In `students` collection
    * kerberos: student1, password: 123, departments: * (which is a wildcard department field representing freshmen, and it can get matched to any department), name: Test Student Account, year: 1
- In `staffs` collection
    * kerberos: staff1, password: 123
    * kerberos: staff2, password: 123
- In `skills` collection
    * "Python", "Java", "Javascript", "C", "Objective C", "Matlab"
- In `tags` collection
    * "Artificial Intelligence", "Web Development", "Robotics", "Machine Learning","Computer Graphics", "Architecture"
- In `postings` collection
    * one posting titled "No Skills Required" that doesn't require any skills (so student1 should be matched to it).
    * one posting titled "Some Skills Required" that requires level 5 Javascript, and it's has tags "Web Development" and "Computer Graphics".

## Authorship
    .
    ├── controllers
    │   ├── emailController.js           # Kelly
    │   ├── kerberosController.js        # Kelly
    │   ├── loginController.js           # Kelly
    │   └── resumeController.js          # Kelly
    ├── models                  
    │   ├── dictionary.js                # Meghana
    │   ├── posting.js                   # Meghana
    │   ├── skillschema.js               # Meghana
    │   ├── staff.js                     # Kelly
    │   ├── student.js                   # Kelly
    │   └── tempUser.js                  # Kelly
    ├── public                   
    │   ├── css
	│   │   ├── login_style.cssn         # Kelly
	│   │   ├── staff.css                # Elise
	│   │   ├── student.css              # Willow
	│   │   └── style.css                # Elise
    │   ├── data
	│   │   ├── mit_departments.json     # Elise
	│   │   └── urop_deadlines.json      # Elise
    │   ├── js
	│   │   ├── auth.js                  # Kelly
	│   │   ├── profile.js               # Meghana
	│   │   ├── staff.js                 # Elise
	│   │   └── student.js               # Willow
    │   ├── index.html                   # Kelly
    │   ├── staff.html                   # Elise
    │   ├── student.html                 # Willow
    │   └── studentProfile.html          # Meghana
    ├── routes
    │   ├── index.js                     # Kelly
    │   ├── postings.js                  # Meghana
    │   ├── skills.js                    # Meghana
    │   ├── tags.js                      # Kelly
    │   └── users.js                     # Kelly
    ├── templates
    │   ├── display_user.handlebars      # Willow
    │   ├── matched_urops.handlebars     # Willow
    │   ├── skills.handlebars            # Willow
    │   ├── skills_table.handlebars      # Willow
    │   ├── suggested_students.handlebars# Elise
    │   ├── tags.handlebars              # Willow
    │   ├── urop_post_view.handlebars    # Elise
    │   ├── urops_names.handlebars       # Willow
    │   └── user_profile.handlebars      # Meghana
    ├── tests                    
    │   └── test.js                      # All of us
    ├── utils   
    │   ├── init.js                      # Kelly
    │   └── utils.js                     # Kelly                         
    ├── .gitignore                       # Kelly    
    ├── app.js                           # Meghana
    ├── server.js                        # Meghana
    └── README.md                        # Kelly
