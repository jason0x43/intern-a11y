export interface A11yViolation {
	message: string,
	snippet: string,
	description: string,
	target: string,
	reference: string,
	tags: string[]
}

export interface A11yResults {
	source: string,
	violations: A11yViolation[]
}
