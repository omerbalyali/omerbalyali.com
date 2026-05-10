/** @type {import("stylelint").Config} */
export default {
	extends: ["stylelint-config-standard", "stylelint-config-html/astro"],
	rules: {
		"lightness-notation": "number",
		"hue-degree-notation": "number",
		"alpha-value-notation": "number",
		"custom-property-empty-line-before": null,
		"number-max-precision": 5,
		"value-keyword-case": [
			"lower",
			{
				ignoreKeywords: ["currentColor"],
			},
		],
	},
};
