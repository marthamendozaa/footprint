describe('Pruebas de la vista de perfil', () => {
  beforeEach(() => {
    // Navegar a la página de perfil antes de cada prueba
    cy.visit('evertech-sprint2.web.app');
    cy.get('input[type="correo"]').type('a00833965@tec.mx');
    cy.get('input[type="password"]').type('evertech123!');
    cy.get('button[type="submit"]').click();

    //Abrir barra de navegación
    cy.get('.boton-cerrar > .btn').then($btn => {
      if ($btn.text().includes('>')) {
        $btn.click();
      }
    });
    cy.wait(250);

    //Navegar a Perfil
    cy.get('nav').within(() => {
      cy.get('li').contains('Perfil').click();
    });
    cy.url().should('include', '/profile');
    
    // Cerrar barra de navegación
    cy.get('.boton-cerrar > .btn').then($btn => {
      if (!$btn.text().includes('>')) {
        $btn.click();
      }
    });
  });

  it('perfil1 - Verificar que ya exista un perfil del usuario', () => {
    cy.contains('Angela Gtz').should('be.visible');
    cy.contains('Edad: 21 años').should('be.visible');
    cy.contains('Usuario: @angelaSofttek').should('be.visible');
    cy.contains('a00833965@tec.mx').should('be.visible');

    /*cy.get('ul.p-etiquetas').contains('Trabajo en Equipo').should('have.class', 'highlighted');
    cy.contains('Ciberseguridad').should('have.class', 'highlighted');
    cy.contains('Ambiente').should('have.class', 'highlighted');
    cy.contains('Investigación').should('have.class', 'highlighted');*/
  });
/*
  it('perfil2 - Añadir habilidad y verificar cambio de color', () => {
    cy.contains('Cloud').should('not.have.class', 'highlighted');
    cy.contains('Cloud').click();
    cy.contains('Cloud').should('have.class', 'highlighted');
  });

  it('perfil3 - Añadir interés y verificar cambio de color', () => {
    cy.contains('Comunidad').should('not.have.class', 'highlighted');
    cy.contains('Comunidad').click();
    cy.contains('Comunidad').should('have.class', 'highlighted');
  });

  it('perfil4 - Verificar mensaje de error por falta de habilidades', () => {
    // Eliminar todas las habilidades
    cy.contains('Trabajo en Equipo').click();
    cy.contains('Ciberseguridad').click();
    cy.contains('Cloud').should('not.exist'); // Asegúrate de eliminar todas las habilidades

    cy.contains('Debes tener al menos una habilidad').should('be.visible');
  });

  it('perfil5 - Verificar mensaje de error por falta de intereses', () => {
    // Eliminar todos los intereses
    cy.contains('Ambiente').click();
    cy.contains('Investigación').click();
    cy.contains('Comunidad').should('not.exist'); // Asegúrate de eliminar todos los intereses

    cy.contains('Debes tener al menos un interés').should('be.visible');
  });*/
});
  