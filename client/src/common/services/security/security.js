'use strict';

// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
        'security.retryQueue' // Keeps track of failed requests that need to be retried once the user logs in
    ])

    .provider('security', function SecurityProvider() {

        this.$get = ['$http', '$q', '$location', 'securityRetryQueue', function ($http, $q, $location, queue) {


            // Redirect to the given url (defaults to '/')
            function redirect(url) {
                url = url || '/';
                $location.path(url);
            }

            // Register a handler for when an item is added to the retry queue
            var lastPath = null;
            queue.onItemAddedCallbacks.push(function (retryItem) {
                if (queue.hasMore()) {
                    lastPath = $location.path();
                    redirect('/login');
                }
            });


            // The public API of the service
            var service = {

                // Get the first reason for needing a login
                getLoginReason: function () {
                    return queue.retryReason();
                },

                // Attempt to authenticate a user by the given email and password
                login: function (email, password, rememberMe) {
                    var request = $http.post('/api/login', {user: {email: email, password: password}, rememberMe: rememberMe});
                    return request.then(function (response) {

                        service.currentUser = response.data.user;
                        return {loggedIn: service.isAuthenticated(), redirectPath: lastPath};
                    }, function (response) {
                        service.currentUser = null;
                        return {loggedIn: service.isAuthenticated(), redirectPath: lastPath};
                    });
                },

                // Give up trying to login and clear the retry queue
                cancelLogin: function () {
                    redirect();
                },

                // Logout the current user and redirect
                logout: function (redirectTo) {
                    $http.post('/api/logout').then(function () {
                        service.currentUser = null;
                        redirect(redirectTo);
                    });
                },

                // Ask the backend to see if a user is already authenticated - this may be from a previous session.
                requestCurrentUser: function () {
                    if (service.isAuthenticated()) {
                        return $q.when(service.currentUser);
                    } else {
                        return $http.get('/api/current-user').then(function (response) {
                            service.currentUser = response.data.user;
                            service.loaded = true;
                            return service.currentUser;
                        });
                    }
                },

                // Information about the current user
                currentUser: null,

                loaded: false,

                // Is the current user authenticated?
                isAuthenticated: function(){
                    return !!service.currentUser;
                },

                isLoaded: function(){
                    return service.loaded;
                },

                isAdmin: function() {
                    return !!(service.currentUser && service.currentUser.role === 'admin');
                }



            };
            return service;
        }];
    }
)
;
