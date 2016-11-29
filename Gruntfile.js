module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['src/**/*.js', 'test/**/*.js'],
            options : {
                // On bosse en Ecma 6
                esversion: 6,
                // pour les amoureux du non-semicolon
                asi : true
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-coveralls');


};