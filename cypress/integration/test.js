context('Table MultiSelect', () => {
	beforeEach(() => {
		cy.login();
	});

	let name = 'table multiselect' + Math.random().toString().slice(2, 8);

	it('select value from multiselect dropdown', () => {
		let selector = `.input-with-feedback.form-control.input-sm[data-fieldname="skill"]`;
		//cy.new_form('Contact');
		cy.go_to_list('Customer');
		//cy.get('.list-sidebar').find('.dropdown-toggle[data-label="Created By"]').as('sidebar-element');
		//if (cy.get('@sidebar-element').invoke('attr', 'aria-expanded').should('contain', 'false')) {
		//	cy.get('@sidebar-element').click().invoke('attr', 'aria-expanded').should('contain', 'true');
		//	cy.get('@sidebar-element').parent().find('.group-by-value[data-name="Administrator"]').click();

		//}
		//cy.fill_field('first_name', "Test Contact");
		//cy.fill_table('links', [{'link_doctype': 'Customer', 'link_name': '!XLED'}, {'link_doctype': 'Customer', 'link_name': '0001 - 1'}, {'link_doctype': 'Supplier', 'link_name': 'Juststickers'}])
		cy.sidebar('Created By', true, true, "smital@erpnext.com");
	});
});
