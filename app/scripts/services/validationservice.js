angular.module('APP')
    .factory('ValidationService', function ($log) {

        var _pattern = {
            FULLNAME : new RegExp('^[a-zA-Zèéàòìù \']{1,100}$'),
            PHONE : new RegExp('^[+]?[0-9][0-9]{1,14}$'), //new RegExp('^[+]?[1-9][0-9]{1,14}$'), //E.164 Reccomandation
            FISCALCODE : new RegExp('^[a-zA-Z0-9]{16}$'),
            EMAIL : new RegExp('^(?=.{1,100}$)[a-zA-Z0-9]+[a-zA-Z0-9._-]*[a-zA-Z0-9]+@[a-zA-Z0-9]+[a-zA-Z0-9.-]*[a-zA-Z0-9]+\\.[a-zA-Z]{2,6}$'),
            ORGNAME : new RegExp('^[a-zA-Z0-9]{10}$'),
            VATNUMBER : new RegExp('^[A-Z]{2}[0-9]{8,12}$'),
            LEGALRESIDENCE : new RegExp('^[a-z-A-Z0-9\,\.\°\' \(\)\-\/]{1,100}$')
        };
		/*
			INT_BETWEEN_1_100 : new RegExp('/^[0-9]{1, 100}$/'),
			INT_BETWEEN_1_30 : new RegExp('/^[0-9]{1, 30}$/')
			*/

        function _validateFiscalCodeCheckCode(_cf)
        {
            var cf = _cf.toUpperCase();

            // do not invalidate checkCode if CF has not a valid pattern
            if( cf == '' )  return true;
            if( ! /^[0-9A-Z]{16}$/.test(cf) )
                return true;

            var map = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 1, 0, 5, 7, 9, 13, 15, 17,
                19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23];
            var s = 0;
            for(var i = 0; i < 15; i++){
                var c = cf.charCodeAt(i);
                if( c < 65 )
                    c = c - 48;
                else
                    c = c - 55;
                if( i % 2 == 0 )
                    s += map[c];
                else
                    s += c < 10? c : c - 10;
            }
            var checkCode = String.fromCharCode(65 + s % 26);
            return checkCode == cf.charAt(15);
        }
    
        var _dirtyForm = function (form) {
            if (form) {
                form.$setDirty();
                angular.forEach(form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setDirty();
                        
                        // apply to subForm
                        _dirtyForm(errorField);
                    });
                });
            }
        }

        return {
            PATTERN : _pattern,

            validateFiscalCodeCheckCode : function(fiscalCode) {
                return _validateFiscalCodeCheckCode(fiscalCode);
            },

            validateIUPCheckCode : function(iup) {
                return _validateIUPCheckCode(iup);
            },

            validateRURCheckCode : function(rur) {
                return _validateRURCheckCode(rur);
            },
            dirtyForm: function (form) {
                return _dirtyForm(form);
            }
        }
    });
