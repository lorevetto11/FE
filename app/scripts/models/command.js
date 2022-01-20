angular.module('APP')
    .factory('Command', function () {

        function Command() {};

        Command.action = {
            ADD : 'ADD',
            ADD_LAYOUT : 'ADD_LAYOUT',
            ADD_WATER_SUPPLY : 'ADD_WATER_SUPPLY'
        };

        return Command;
    });
