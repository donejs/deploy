var path = require("path"),
	_ = require("lodash")
	glob = require("glob"),
	pathparse = require("path-parse"),
	self = this;

module.exports = {
	_selected: function(specified, configured) {
	 	return (specified && configured[specified])
			? configured[specified]
			: _.first(_.filter(_.values(configured), { "default": true }));
	},
	_service: function(available, selected) {
		return _.first(_.pluck(_.where(available, {"type": selected.type}), "service"));
	},
	_properties: function(service, selected, error) {
		_.map(service.properties, function(prop) {
			if (!_.get(selected, prop.name)) {
				var _default = _.get(prop, "default");
				if (_.isFunction(_default)) {
					_default = _default.call({ env: process.env, pkg: package });
				}
				if (!_default) {
					error("The property '" + prop.name + "' is missing from the selected '"
						+ selected.type + "' service configuration.");
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
		if (!selected) {
			selected = _.first(_.values(configured));
		}
		var service = this._service(available, selected);
		if (!service) {
			error("'"+  selected.type + "' is not supported.")
		}
		return {
			service: service,
			config: this._properties(service, selected, error)
		};
	}
}
