describe('Pruebas en la vista Create', () => {
    beforeEach(() => {
      // Navegar a la página de perfil antes de cada prueba
      cy.visit('evertech-sprint2.web.app');
      cy.get('input[placeholder="Ingresa el correo"]').type('a00833965@tec.mx');
      cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
      cy.get('button[type="submit"]').click();
      cy.wait(250);
  
      // Abrir barra de navegación
      cy.get('.boton-cerrar > .btn').then($btn => {
        if ($btn.text().includes('>')) {
          $btn.click();
        }
      });
      cy.wait(250);
      
      // Navegar a create
      cy.get('nav').within(() => {
        cy.contains('Crear').click();
      });
      cy.url().should('include', '/create');
      cy.wait(2000);
  
      // Cerrar la barra de navegación
      cy.get('.boton-cerrar > .btn').then($btn => {
        if ($btn.text().includes('<')) {
          $btn.click();
        }
      });
    });
  
    it('Verifica que se muestra un error si los campos están vacíos', () => {
      // Hacer clic en el botón Crear
      cy.get('.c-btn-crear').click();
  
      // Verificar que el modal de error se muestra con el mensaje correcto
      cy.get('.c-modal')
        .should('be.visible')
        .within(() => {
          cy.contains('Error').should('be.visible');
          cy.contains('No se pueden dejar los siguientes campos vacíos:').should('be.visible');
          cy.contains('Título').should('be.visible');
          cy.contains('Descripción').should('be.visible');
          cy.contains('Región').should('be.visible');
          cy.contains('Etiquetas').should('be.visible');
          cy.contains('Tareas').should('be.visible');
        });
  
    });

    it('debería permitir al usuario crear una iniciativa con los datos proporcionados', () => {
        // Espera a que las etiquetas y regiones estén disponibles
        cy.get('.spinner', { timeout: 10000 }).should('not.exist');

        // Ingresa el título
        cy.get('.c-btn-editar-titulo').click();
        cy.get('.c-titulo-input-texto')
        .type('Reforestación')
        .blur();

        // Selecciona las etiquetas
        cy.get('.c-etiqueta-item').contains('Ambiente').click();
        cy.get('.c-etiqueta-item').contains('Comunidad').click();

        // Selecciona la fecha de cierre
        cy.get('.c-calendarios').within(() => {
        cy.get('.c-calendario-input').eq(1).click();
        });
        cy.get('.react-datepicker__input-container-create')
        .eq(1)
        .click()
        .clear()
        .type('27/06/2024')
        .type('{enter}');

        // Selecciona la región
        cy.get('.c-dropdown-container').contains('Ubicación').click();
        cy.get('.c-dropdown-input').type('Monterrey');
        cy.get('.c-dropdown-item').contains('Monterrey').click();

        // Ingresa la descripción
        cy.get('.c-btn-editar-desc').click();
        cy.get('.c-desc-input-texto')
        .type('Ir a plantar 50 árboles en parques de Monterrey')
        .blur();

        // Agrega una tarea
        cy.get('.c-btn-editar-tarea').click();
        cy.get('.c-tarea-titulo').first().within(() => {
            cy.get('input[type="text"]').type('Comprar árboles');
          });
        cy.get('.c-btn-editar-tarea-2').click();
        cy.get('.c-tarea').within(() => {
          cy.get('.c-desc-input-texto-2').type('Comprar 50 árboles para plantar');
        });
        cy.get('.c-tarea-boton').contains('Fecha').click();
        cy.get('.react-datepicker-2').clear().type('20/06/2024').type('{enter}');

        // Crear la iniciativa
        cy.get('.c-btn-crear').click();
        cy.wait(10000);

        // Verificar que la iniciativa fue creada con éxito
        cy.get('.c-modal-title').should('contain', 'Éxito');
        cy.get('.c-modal-body').should('contain', 'Iniciativa Reforestación creada exitosamente');
        
    });
  });  