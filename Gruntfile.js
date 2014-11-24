module.exports = function(grunt) {
// Load Grunt tasks declared in the package.json file
require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);



// Configure Grunt
grunt.initConfig({

// Grunt express - our webserver
// https://github.com/blai/grunt-express
express: {
    all: {
        options: {
            bases: ['/var/www/sites/roadtrip/web'],
            port: 9000,
            hostname: "localhost",
            livereload: true
        }
    }
},

sass: {

    dist: {

        files: {

            'web/build/_style.css' : 'src/style/scss/style.scss'

        },
        options: {

            sourcemap: 'none'

        }

    }

},

bower_concat: {

    all: {

        dest: 'web/build/_bower.js',
        cssDest: 'web/build/_bower.css',
        dependencies: {

            'angular-ui-sortable' : 'jqueryui'

        }

    }


},

concat: {

    options: {

        separator: ';'

    },
    css: {

        src: ['web/build/_bower.css', 'web/build/_style.css'],
        dest: 'web/build/main.css'

    },
    js: {

        src: ['web/build/_bower.js', 'src/js/lib/*.js', 'src/js/*.js', 'src/js/controllers/*.js'],
        dest: 'web/build/main.js'

    }

},
// grunt-watch will monitor the projects files
// https://github.com/gruntjs/grunt-contrib-watch
watch: {

    js: {

        files: ['src/js/*.js', 'src/js/lib/*.js', 'src/js/controllers/*.js'],
        tasks: ['concat:js'],

    },

    sass: {

        files: 'src/style/scss/*.scss',
        tasks: ['sass', 'concat:css'],
        options: {

            sourcemap: 'none'

        }
        

    },
    
    all: {
        files: 'web/*.html',
        options: {
            livereload: true
        },
        
    },

    css: {

        files: "web/build/style.css",
        options: {

            livereload: true

        },

    }
},

// grunt-open will open your browser at the project's URL
// https://www.npmjs.org/package/grunt-open
open: {
    all: {
        path: 'http://roadtrip.local.maalls.net'
    }
}
});

// Creates the `server` task
grunt.registerTask('server', [
    'bower_concat',
    'concat',
    'express',
    'open',

    'watch'
    ]);
};