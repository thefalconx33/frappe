context('Table MultiSelect', () => {
	beforeEach(() => {
		cy.login();
	});

	let name = 'table multiselect' + Math.random().toString().slice(2, 8);

	it('Generate Payroll Entry', () => {
		cy.new_form("Payroll Entry");
		cy.fill_field("payroll_frequency", "Monthly", "Select");
		cy.fill_field("branch", "Vidyavihar", "Link");
		cy.fill_field("designation", "Writer", "Link");
		cy.save_doc();
		cy.get_toolbar("Get Employees");
		cy.get_button("Create Salary Slips");
		cy.reload();
		cy.get_toolbar("Submit Salary Slip");
		cy.get_open_dialog().find('.btn-primary').click();
		cy.hide_dialog();
	});
});
