(function (angular, $) {
	'use strict';
	return angular.module('notyModule', []).provider('noty', function () {
		var provider = {
			settings: $.noty.defaults,
			$get: function () {
				var callNoty = function (newSettings) {
					return noty(angular.extend({}, provider.settings, newSettings));
				};

				return {
					show: function (message, type) {
						callNoty({text: message || provider.settings.text, type: type || provider.settings.type, timeout: 1000});
					},

					showAlert: function (message) {
						callNoty({text: message || provider.settings.text, type: "warning", timeout: 1000});
					},

					showSuccess: function (message) {
						callNoty({text: message || provider.settings.text, type: "success", timeout: 1000});
					},

					showError: function (message) {
						callNoty({text: message || provider.settings.text, type: "error", timeout: 1000});
					},

					closeAll: function () {
						return $.noty.closeAll();
					},
					clearShowQueue: function () {
						return $.noty.clearQueue();
					}.bind(this)
				};
			}

		};
		return provider;
	});
}(angular, jQuery));