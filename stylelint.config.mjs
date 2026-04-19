/** @type {import("stylelint").Config} */
export default {
	extends: ["stylelint-config-standard", "stylelint-config-html/astro"],
	rules: {
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
