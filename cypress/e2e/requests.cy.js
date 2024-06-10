describe('Pruebas de la vista explora', () => {
  beforeEach(() => {
    // Navegar a la página de perfil antes de cada prueba
    cy.visit('evertech-sprint2.web.app');
    cy.get('input[placeholder="Ingresa el correo"]').type('a00833965@tec.mx');
    cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
    cy.get('button[type="submit"]').click();
    cy.wait(250);

    //Abrir barra de navegación
    cy.get('.boton-cerrar > .btn').then($btn => {
      if ($btn.text().includes('>')) {
        $btn.click();
      }
    });
    cy.wait(250);
    
    //Navegar a Perfil
    cy.get('nav').within(() => {
      cy.get('li').contains('Solicitudes').click();
    });
    cy.url().should('include', '/requests');
  }); 

  it('solicitudVisualizacion1 - Verificar que "Agua Iniciativa" exista con estatus "Pendiente"', () => {
    // Verificar que la iniciativa "Agua Iniciativa" con estatus "Pendiente" esté presente
    cy.contains('.rq-titulo', 'Agua Iniciativa')
      .should('be.visible')
      .parent()
      .within(() => {
        cy.contains('Pendiente').should('be.visible');
      });

    // Hacer clic en la iniciativa "Agua Iniciativa"
    cy.contains('.rq-titulo', 'Agua Iniciativa').click();

    // Verificar que la descripción esté visible
    cy.contains('Iniciativa enfocada en el cuidado del agua para disminuir huella de carbono en áreas de trabajo.')
      .should('be.visible');
  });

  it('solicitudVisualizacion2 - Aceptar una invitación', () => {
    cy.contains('.rq-titulo', 'Huella de Carbono')
      .should('be.visible')

    // Hacer clic en la iniciativa 
    cy.contains('.rq-titulo', 'Huella de Carbono').click();

    // Verificar que la descripción esté visible
    cy.contains('Iniciativa dirigida a disminuir la huella de carbono dentro de oficinas de Guadalajara. Buscamos gente con mucho compromiso con el medio ambiente.')
      .should('be.visible');

    cy.get('body').click(0, 0); // Simula un clic en la esquina superior izquierda de la página

    cy.contains('.rq-titulo', 'Huella de Carbono')
      .should('be.visible')
      .parent()
      .within(() => {
        // Hacer clic en el botón de aceptar
        cy.get('.fa-5-button').first().click();
      });

    cy.wait(5000);

    // Refrescar la página
    cy.reload();

    // Esperar a que la página se recargue completamente
    cy.wait(5000);

    // Verificar que la iniciativa "Huella de Carbono" ya no esté presente
    cy.contains('.rq-titulo', 'Huella de Carbono').should('not.exist');
  });
  
});