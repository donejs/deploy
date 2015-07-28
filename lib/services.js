var path = require("path"),
	_ = require("lodash"),
	fsx = require("fs-extra"),
	glob = require("glob");

module.exports = {
	list: function() {
		var pattern = __dirname + "/../services/**/service-*.js";
		return glob.sync(pattern).map(function(servicePath) {
			return {
				type: path.parse(servicePath).name.split("-")[1],
				service: require(servicePath)
			}
		});
	},
	selected: function(specified, configured, available) {
		var selected = (specified && configured[specified])
				? configured[specified]
				: _.first(_.filter(_.values(configured), { "default": true }));
		if (!selected) { selected = _.first(_.values(configured)); }

		var service =
			_.first(_.pluck(_.where(available, {"type": selected.type}), "service"));
		if (!service) {
			throw new Error("'"+  selected.type +"' is not supported. ")
		}

		var hasProps =
			_.every(service.properties, function(prop) { return _.has(selected, prop)});
		if (!hasProps) {
			var required = service.properties.join(", ").trim();
			throw new Error("'" + selected.type + "' requires the following "
				+ "properties to be configured: " + required);
		}

		return { service: service, config: selected };
	}
}
