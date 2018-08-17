/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';




importScripts("sw-toolbox.js", "runtime-caching.js");


/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [
    ["app-content/app.css", "6cec3a5d75cb9f643c7ca8b1298f817b"],
    ["app-content/ng-table.min.css", "d219244599f90ecd6faf41c626d2b7c5"],
    ["app-content/theme.css", "4d4d4350d85b9c46e9fb09c321acdabf"],
    ["app-content/wavelabs.css", "acf350f069d86f8fb6ea4a07f5429846"],
    ["app.js", "da41aedff7e001c4d26cbdf6e04cd677"],
    ["bower.json", "f270354464513e9081e099eafdce7680"],
    ["index.html", "dfd2ebb21354c0104accc251208e9ec0"],
    ["manifest.json", "fb37082a3ca84b8b8b1993e0746a6813"],
    ["npm-debug.log", "f6d3a19c7512ad398c3dc66a07487806"],
    ["runtime-caching.js", "9c83e15f99e79458edac1c17dea524c5"],
    ["sw-toolbox.js", "2770efb889cc10c4de88d0b746c2a13c"]
];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1-sw-precache-' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
        url.pathname += index;
    }
    return url.toString();
};

var getCacheBustedUrl = function(url, param) {
    param = param || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
        'sw-precache=' + param;

    return urlWithCacheBusting.toString();
};

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
        return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
        return path.match(whitelistedPathRegex);
    });
};

var populateCurrentCacheNames = function(precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
        var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
        var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
        currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
        absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
        absoluteUrlToCacheName: absoluteUrlToCacheName,
        currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
};

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
        .split('&') // Split into an array of 'key=value' strings
        .map(function(kv) {
            return kv.split('='); // Split each 'key=value' string into a [key, value] array
        })
        .filter(function(kv) {
            return ignoreUrlParametersMatching.every(function(ignoredRegex) {
                return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
            });
        })
        .map(function(kv) {
            return kv.join('='); // Join each [key, value] array into a 'key=value' string
        })
        .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
};


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
    return caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                return caches.delete(cacheName);
            })
        );
    });
}

self.addEventListener('install', function(event) {
    event.waitUntil(
        // Take a look at each of the cache names we expect for this version.
        Promise.all(Object.keys(CurrentCacheNamesToAbsoluteUrl).map(function(cacheName) {
            return caches.open(cacheName).then(function(cache) {
                // Get a list of all the entries in the specific named cache.
                // For caches that are already populated for a given version of a
                // resource, there should be 1 entry.
                return cache.keys().then(function(keys) {
                    // If there are 0 entries, either because this is a brand new version
                    // of a resource or because the install step was interrupted the
                    // last time it ran, then we need to populate the cache.
                    if (keys.length === 0) {
                        // Use the last bit of the cache name, which contains the hash,
                        // as the cache-busting parameter.
                        // See https://github.com/GoogleChrome/sw-precache/issues/100
                        var cacheBustParam = cacheName.split('-').pop();
                        var urlWithCacheBusting = getCacheBustedUrl(
                            CurrentCacheNamesToAbsoluteUrl[cacheName], cacheBustParam);

                        var request = new Request(urlWithCacheBusting, { credentials: 'same-origin' });
                        return fetch(request).then(function(response) {
                            if (response.ok) {
                                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName],
                                    response);
                            }

                            console.error('Request for %s returned a response status %d, ' +
                                'so not attempting to cache it.',
                                urlWithCacheBusting, response.status);
                            // Get rid of the empty cache if we can't add a successful response to it.
                            return caches.delete(cacheName);
                        });
                    }
                });
            });
        })).then(function() {
            return caches.keys().then(function(allCacheNames) {
                return Promise.all(allCacheNames.filter(function(cacheName) {
                    return cacheName.indexOf(CacheNamePrefix) === 0 &&
                        !(cacheName in CurrentCacheNamesToAbsoluteUrl);
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                }));
            });
        }).then(function() {
            if (typeof self.skipWaiting === 'function') {
                // Force the SW to transition from installing -> active state
                self.skipWaiting();
            }
        })
    );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
    self.addEventListener('activate', function(event) {
        event.waitUntil(self.clients.claim());
    });
}

self.addEventListener('message', function(event) {
    if (event.data.command === 'delete_all') {
        console.log('About to delete all caches...');
        deleteAllCaches().then(function() {
            console.log('Caches deleted.');
            event.ports[0].postMessage({
                error: null
            });
        }).catch(function(error) {
            console.log('Caches not deleted:', error);
            event.ports[0].postMessage({
                error: error
            });
        });
    }
});


self.addEventListener('fetch', function(event) {
    if (event.request.method === 'GET') {
        var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
            IgnoreUrlParametersMatching);

        var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
        var directoryIndex = 'index.html';
        if (!cacheName && directoryIndex) {
            urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
            cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
        }

        var navigateFallback = '';
        // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
        // supported yet:
        // https://code.google.com/p/chromium/issues/detail?id=540967
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
        if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
            event.request.headers.get('accept').includes('text/html') &&
            /* eslint-disable quotes, comma-spacing */
            isPathWhitelisted([], event.request.url)) {
            /* eslint-enable quotes, comma-spacing */
            var navigateFallbackUrl = new URL(navigateFallback, self.location);
            cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
        }

        if (cacheName) {
            event.respondWith(
                // Rely on the fact that each cache we manage should only have one entry, and return that.
                caches.open(cacheName).then(function(cache) {
                    return cache.keys().then(function(keys) {
                        return cache.match(keys[0]).then(function(response) {
                            if (response) {
                                return response;
                            }
                            // If for some reason the response was deleted from the cache,
                            // raise and exception and fall back to the fetch() triggered in the catch().
                            throw Error('The cache ' + cacheName + ' is empty.');
                        });
                    });
                }).catch(function(e) {
                    console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
                    return fetch(event.request);
                })
            );
        }
    }
});

self.addEventListener('push', function(event) {

    console.info('Event: Push');

    var title = 'New commit on Github Repo: RIL';

    var body = {
        'body': 'Click to see the latest commit',
        'tag': 'pwa',
        'icon': './images/48x48.png'
    };

    event.waitUntil(
        self.registration.showNotification(title, body)
    );
});


self.addEventListener('notificationclick', function(event) {

    var url = './index.html';

    event.notification.close(); //Close the notification

    // Open the app and navigate to latest.html after clicking the notification
    event.waitUntil(
        clients.openWindow(url)
    );

});