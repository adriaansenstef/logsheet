sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		splitStatus: function (item) {
			if (item.includes(",")) {
				return item.split(",");
			}
			else {
				return item;
			}
		},

		removeWhiteSpacingFormat: function (item) {
			return item.trim();
		},

		iconTabFilterTextFormat: function (item) {
			let description = item.description;
			if (this.hasNOK(item)) {
				description = "! " + description;
			} return description;
		},

		iconTabFilterColorFormat: function (item) {
			if (this.hasNOK(item)) {
				return sap.ui.core.IconColor.Negative
			} else {
				return sap.ui.core.IconColor.Default
			}
		},

		highlightedOperationFormat: function (item) {
			if (item.internalStatus === 'E0003') {
				return 'Error'
			} else {
				return 'None'
			}
		},

		decimalFormatter: sap.ui.model.CompositeType.extend("number", {
			constructor: function () {
				sap.ui.model.CompositeType.apply(this, arguments);
				this.bParseWithValues = true; // make 'parts' available in parseValue
				//this.bUseRawValues = true;
			},

			/**
			 * Displaying data from the right model (model -> view)
			 */
			formatValue: function (parts) {
				return parts ? parseFloat(parts[0]).toFixed(parts[1]) : null;
			},

			/**
			 * Assigning entered value to the right model (view -> model)
			 */
			parseValue: function (enteredValue, stuff, parts) {
				return (parts && parts[1] && (!isNaN(parts[1]) || parts[1] === 0)) ? [parseFloat(enteredValue).toFixed(parts[1]), parts[1]] : [
					parseFloat(enteredValue).toFixed(3), 3
				];
			},

			validateValue: () => true // Nothing to validate here
		})

	};

});