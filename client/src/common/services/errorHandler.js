'use strict';

angular.module('services.errorHandler', ['services.notifications', 'services.localizedMessages', 'ui.bootstrap']);
angular.module('services.errorHandler').factory('errorHandler', ['localizedMessages', 'notifications', '$dialog', function (localizedMessages, notifications, $dialog) {

    return {
        handleError: function (status) {
            var title = ' ';
            var msg = localizedMessages.get('error.fatal') + ' status:' + status;
            var btns = [
                {result: 'ok', label: 'OK'}
            ];

            $dialog.messageBox(title, msg, btns)
                .open()
                .then(function (result) {
                });
        }
    };
}]);