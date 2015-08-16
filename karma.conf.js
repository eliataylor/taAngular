module.exports = function(config) {
    config.set({
        frameworks: ['jasmine', 'browserify', 'source-map-support'],

        files: [
            'src/vendor/jquery/dist/jquery.js',
            'src/vendor/jquery-ui/ui/core.js',
            'src/vendor/jquery-ui/ui/widget.js',
            'src/vendor/jquery-ui/ui/mouse.js',
            'src/vendor/jquery-ui/ui/sortable.js',
            'src/vendor/angular/angular.js',
            'src/modules/**/*.{html,js}',
            'src/html/**/*.html',
            'src/test/**/*.js'
        ],

        exclude: [
            'src/test/mocks.js',
            'src/modules/**/*.js',
            'src/test/test-main.js'
        ],

        preprocessors: {
            'src/modules/**/*.html': ['ng-html2js'],
            'src/html/**/*.html': ['ng-html2js'],
            'src/test/**/*.js': ['browserify']
        },

        ngHtml2JsPreprocessor: {
            // strip this from the file path
            cacheIdFromPath: function (path) {
                var newPath = path.replace(/^src/, '');
                console.log('Processing template', newPath);
                return newPath;
            },

            // the name of the Angular module to create
            moduleName: "karma.templates"
        },

        browserify: {
            debug: true,
            transform: [
                ['babelify', { compact: 'none' }],
                ['browserify-shim']
            ]
        },

        browsers: ['Chrome']
    });
};
