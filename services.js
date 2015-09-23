var path = require("path"),
	_ = require("lodash")
	glob = require("glob"),
	pathparse = require("path-parse"),
	self = this;

module.exports = {
	_selected: function(specified, configured) {
		var name = specified;
		if (!specified || !configured[specified]) {
			name = _.findKey(configured, "default");
		}
		if (!name) { name = _.keys(configured); }
		return { name: name, service: configured[name] };
	},
	_service: function(available, selected, error) {
		var s = _.find(available, {"type": selected.service.type});
		return s && s.service;
	},
	_properties: function(service, selected, package, error) {
		_.map(service.properties, function(prop) {
			if (!_.get(selected.service, prop.name)) {
				var _default = _.get(prop, "default");
				if (_.isFunction(_default)) {
					_default = _default.call({ env: process.env, pkg: package });
				}
				if (!_default) {
					error("The property '" + prop.name + "' is missing from the selected '"
						+ selected.service.type + "' service configuration.");
				} else {
					selected[prop.name] = _default;
				}
			}
		});
		return selected;
	},
	list: function() {
		var pattern = __dirname + "/services/**/service-*.js";
		return glob.sync(pattern).map(function(servicePath) {
			return {
				type: pathparse(servicePath).name.split("-")[1],
				service: require(servicePath)
			}
		});
	},
	selected: function(package, specified, configured, available, error) {
		var selected = this._selected(specified, configured);
		var service = this._service(available, selected, error);
		if (!service) {
			error("'"+  selected.service.type + "' is not supported.");
		}
		return {
			service: service,
			type: selected.service.type,
			config: this._properties(service, selected, package, error)
		};
	}
}
