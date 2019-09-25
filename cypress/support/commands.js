import 'cypress-file-upload';
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... });
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... });
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... });
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... });
Cypress.Commands.add('login', (email, password) => {
	if (!email) {
		email = 'Administrator';
	}
	if (!password) {
		password = Cypress.config('adminPassword');
	}
	cy.request({
		url: '/api/method/login',
		method: 'POST',
		body: {
			usr: email,
			pwd: password
		}
	});
});

Cypress.Commands.add('call', (method, args) => {
	return cy.window().its('frappe.csrf_token').then(csrf_token => {
		return cy.request({
			url: `/api/method/${method}`,
			method: 'POST',
			body: args,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-Frappe-CSRF-Token': csrf_token
			}
		}).then(res => {
			expect(res.status).eq(200);
			return res.body;
		});
	});
});

Cypress.Commands.add('create_records', (doc) => {
	return cy.call('frappe.tests.ui_test_helpers.create_if_not_exists', { doc })
		.then(r => r.message);
});

Cypress.Commands.add('get_field', (fieldname, fieldtype) => {
	let selector = `.form-control[data-fieldname="${fieldname}"]`;
	if (fieldtype === 'Text Editor') {
		selector = `[data-fieldname="${fieldname}"] .ql-editor[contenteditable=true]`;
	}
	if (fieldtype === 'Code') {
		selector = `[data-fieldname="${fieldname}"] .ace_text-input`;
	}
	return cy.get(selector);
});

Cypress.Commands.add('fill_field', (fieldname, value, fieldtype='Data') => {
	cy.get_field(fieldname, fieldtype).as('input');
	cy.get('@input').then(($input) => {
		if (Cypress.dom.isHidden($input)) {
			$input.closest('.section-body.hide').removeClass('hide');
		}
		$input.val(undefined);
	})
	cy.get('@input').focus();
	if (fieldtype === 'Select') { return cy.get('@input').select(value) }
	else if (fieldtype === 'Code') { return cy.get('@input').type(value, {force: true, delay: 100}) }
	else if (fieldtype === 'Check') { return cy.get('@input').check(value) }
	else if (fieldtype === 'Link') {
		cy.server();
		cy.route('POST', '/api/method/frappe.desk.search.search_link').as('search_link');
		cy.route('GET', '/api/method/frappe.desk.form.utils.validate_link*').as('validate_link');
		cy.wait('@search_link');
		cy.get('ul[role="listbox"]').as('awesomeplete').should('be.visible');
		cy.get('@input').type(value.slice(0, value.length - 2), { delay: 200 });
		let link_name = new RegExp("^" + value + "$", "g")
		cy.get('@awesomeplete').contains(link_name).closest('li').click();
		cy.get('@awesomeplete').should('be.hidden');
		cy.get('@input').should('have.value', value);
	}
	else if (fieldtype === 'Datetime' || fieldtype === 'Date') {
		cy.wait(500);
		cy.get('@input').type(value, { delay: 100 });
	}
	else {
		cy.get('@input').type(value, { delay: 100 });
	}
	return cy.get('@input').blur();
});

Cypress.Commands.add('fill_table', (tablename, rows) => {
	var table_empty = 0;
	let selector = `.frappe-control[data-fieldname="${tablename}"]:visible`
	cy.get(selector).as('table')
	cy.get('@table').find('.grid-body > .rows').children().then(($children) => {
		table_empty = $children.length ? 0 : 1;
	})
	for(let [idx, row] of rows.entries()){
		let fields = Object.keys(row)
		let values = Object.values(row)
		if (table_empty) {
			cy.get('@table').find('.grid-add-row').click()
			table_empty = 0;
		}
		cy.get('@table').find(`.grid-row[data-idx="${idx + 1}"]`).as('grid-row');
		for(let [idx, field] of fields.entries()){
			cy.get('@grid-row').find(`.grid-static-col[data-fieldname="${field}"]`).click();
			cy.get('@grid-row').find(`.input-with-feedback.form-control.input-sm[data-fieldname="${field}"]`).type(values[idx], {delay: 150}).blur();
		}
	}

});

Cypress.Commands.add('get_toolbar', (fieldname, action='') => {
	cy.get('.form-inner-toolbar:visible').as('toolbar');
	if (action === '') {
		cy.get('@toolbar').find(`.btn[data-label="${encodeURIComponent(fieldname.trim())}"]:visible`).as('button');
		cy.get('@button').click();
	} else {
		cy.get('@toolbar').find(`.btn-group[data-label="${encodeURIComponent(fieldname.trim())}"]:visible`).as('button');
		cy.get('@button').find('.btn.dropdown-toggle[data-toggle="dropdown"]:visible').click();
		cy.get('@toolbar').find(`[data-label="${encodeURIComponent(action.trim())}"]:visible`).as('action');
		cy.get('@action').click();
	}
});

Cypress.Commands.add('get_button', (fieldname) => {
	cy.get('.page-head').as('page-head');
	cy.get('@page-head').find(`.btn[data-label="${fieldname.trim()}"]`).as('button');
	cy.get('@button').click();
});

Cypress.Commands.add('awesomebar', (text) => {
	cy.get('#navbar-search').type(`${text}{downarrow}{enter}`, { delay: 100 });
});

Cypress.Commands.add('new_form', (doctype) => {
	cy.visit(`/desk#Form/${doctype}/New ${doctype} 1`);
});

Cypress.Commands.add('go_to_form', (doctype, docname) => {
	cy.visit(`/desk#Form/${doctype}/${docname}`);
});

Cypress.Commands.add('go_to_list', (doctype) => {
	cy.visit(`/desk#List/${doctype}/List`);
});

Cypress.Commands.add('go_to_report', (doctype) => {
	cy.visit(`/desk#List/${doctype}/Report`);
});

Cypress.Commands.add('clear_cache', () => {
	cy.window().its('frappe').then(frappe => {
		frappe.ui.toolbar.clear_cache();
	});
});

Cypress.Commands.add('dialog', (opts) => {
	return cy.window().then(win => {
		var d = new win.frappe.ui.Dialog(opts);
		d.show();
		return d;
	});
});

Cypress.Commands.add('get_open_dialog', () => {
	return cy.get('.modal:visible').last();
});

Cypress.Commands.add('hide_dialog', () => {
	cy.get_open_dialog().find('.btn-modal-close').click();
	cy.get('.modal:visible').should('not.exist');
});

Cypress.Commands.add('save_doc', () => {
	cy.server();
	cy.route('POST', '/api/method/frappe.desk.form.save.savedocs').as('save_form');

	cy.get('[data-label="Save"]:visible').click();
	cy.wait('@save_form').its('status').should('eq', 200);
})

Cypress.Commands.add('submit_doc', () => {
	// check if doc is submittable
	cy.server();
	cy.route('POST', '/api/method/frappe.desk.form.save.savedocs').as('save_form');

	cy.get('[data-label="Submit"]:visible').click();
	cy.get_open_dialog().find('.btn-primary').click();

	cy.wait('@save_form').its('status').should('eq', 200);
})

Cypress.Commands.add('fill_filter', (label, value) => {
	const selector = `.input-with-feedback.form-control.input-sm[placeholder=${label}]`

	cy.get(selector).as('filter');
	const isSelect = cy.get('@filter').invoke('attr', 'data-fieldtype').should('contain', 'Select');

	if(isSelect) {
		cy.get('@filter').select(value)
	} else {
		cy.get('@filter').type(value, { waitForAnimations: false })
	}
})

Cypress.Commands.add('upload_files', (files, fieldname) => {
	cy.get(`.btn-attach[data-fieldname="${fieldname}"]`).as('attach_button');
	cy.get('@attach_button').click();
	const files_to_be_uploaded = []
	Promise.all(
		files.map(file => {
			return cy.fixture(file.filename).then(content => {
				files_to_be_uploaded.push({ fileContent: content, fileName: file.filename, mimeType: file.mime_type })
			})
		})
	).then(() => {
		console.log('files uploaded');
	})

	cy.get(`input[type="file"]`).upload(files_to_be_uploaded, {});
	return cy.get('.modal-dialog').find('.btn.btn-primary').click();
})

Cypress.Commands.add('find_in_list', (string) => {
	return cy.get(`.list-subject:contains(${string})`);
})

Cypress.Commands.add('sidebar', (fieldname, dropdown=false, search=false, value='') => {
	cy.get('.list-sidebar').as('sidebar')
	if (!dropdown) {
		cy.get('@sidebar').find(`[data-label="${fieldname}"]`).as('sidebar-element');
		cy.get('@sidebar-element').invoke('attr', 'class').should('not.have.class', 'disabled');
		cy.get('@sidebar-element').click();
	} else {
		cy.get('@sidebar').find(`.dropdown-toggle[data-label="${fieldname}"]`).as('sidebar-element');
		cy.get('@sidebar-element').invoke('attr', 'aria-expanded').should('contain', 'false');
		cy.get('@sidebar-element').click().invoke('attr', 'aria-expanded').should('contain', 'true');
		if (search) {
			cy.get('@sidebar-element').parent().find('.form-control.dropdown-search-input').type(value);
		}
		cy.get('@sidebar-element').parent().find(`.group-by-value[data-name="${value}"]`).click();
	}
})
