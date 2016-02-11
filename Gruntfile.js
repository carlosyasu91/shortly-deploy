module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '// ==========================================================\n',
      },
      dist: {
        src:[ 'public/client/app.js', 
              'public/client/link.js', 
              'public/client/links.js', 
              'public/client/linkView.js', 
              'public/client/linksView.js', 
              'public/client/createLinkView.js', 
              'public/client/router.js' ],
        dest: 'public/min/built.js'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'public/min/built.min.js' : ['public/min/built.js']
        }
      }
    },

    eslint: {
      target: [
        'public/min/built.js'
      ]
    },

    cssmin: {
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },

    gitpush: {
      your_target: {
        options: {
          remote: 'live',
          branch: 'master'
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });


  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['deploy', 'gitpush']);
    }
    grunt.task.run([ 'server-dev' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'concat', 'eslint', 'uglify', 'mochaTest'
  ]);

  grunt.registerTask('lint', [
    'concat','eslint'
  ]);

  grunt.registerTask('build', ['nodemon'
  ]);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', function(n) {
    if (grunt.option('prod')){
      grunt.task.run([
        'concat', 'eslint', 'uglify', 'mochaTest', 'nodemon', 'gitpush'
      ]);      
    }else{
      grunt.task.run([
        'concat', 'eslint', 'uglify', 'mochaTest', 'nodemon'
      ]);
    }
  });

  grunt.registerTask('default', ['nodemon']);


};
