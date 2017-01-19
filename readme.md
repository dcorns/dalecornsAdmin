#dalecornsAdmin
###An HTML interface for dalecorns.com administration

####Development Flow
For development gulp and grunt is used. Gulp is used to call grunt indirectly.
#####Gulp Tasks
######watcher
Running `gulp watcher` will insure that all the css is converted from 4 to 3 and combined into one file, insure that the all the Java Script is converted from ES6 to 5 and combined into one file, insures that all the html views are converted to JavaScript, and keeps Development/index.html in up to date with app/index.html.
######mockData
run this for testing local data in development
######adminData
run this to use the tool for managing the mongodb data on EC2.
####Development Flow AWS
######gulp mockData
run this for testing local data in development