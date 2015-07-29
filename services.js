var path = require("path"),
	_ = require("lodash"),
	fsx = require("fs-extra"),
	glob = require("glob"),
	pathparse = require("path-parse");

module.exports = {
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
		var selected = (specified && configured[specified])
				? configured[specified]
				: _.first(_.filter(_.values(configured), { "default": true }));
		if (!selected) { selected = _.first(_.values(configured)); }

		var service =
			_.first(_.pluck(_.where(available, {"type": selected.type}), "service"));
		if (!service) {
			error("'"+  selected.type +"' is not supported. ")
		}

		_.map(service.properties, function(prop) {
			if (!_.get(selected, prop.name)) {
				var _default = _.get(prop.default);
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
		return { service: service, config: selected };
	}
}
