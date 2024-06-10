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
        cy.get('li').contains('Mis Iniciativas').click();
      });
      cy.url().should('include', '/myInitiatives');
      cy.wait(5000);
    });

    it('visualizarIniciativaCreada - Verificar que "Hogar Sustentable" exista en la lista de iniciativas creadas y se pueda acceder la información', () => {
        // Verificar que la iniciativa "Hogar Sustentable" esté presente y hacer clic en ella
        cy.contains('.m-titulo', 'Limpiar el río')
            .should('be.visible')
            .click();

        // Verificar que la URL haya cambiado a la página de la iniciativa
        cy.url().should('include', 'initiative/Io07qbh3i2vGVjPDTGaz');

        // Verificar que el usuario @angelaSofttek esté en la lista de miembros
        cy.contains('.i-btn-miembro-contenido', '@angelaSofttek')
            .should('be.visible');
    });

    it('visualizarIniciativaMiembro - Verificar que "Hogar Sustentable" exista en la lista de iniciativas creadas y se pueda acceder la información', () => {
        // Verificar que la iniciativa "Hogar Sustentable" esté presente y hacer clic en ella
        cy.contains('.m-titulo', 'Hogar Sustentable')
            .should('be.visible')
            .click();

        // Verificar que la URL haya cambiado a la página de la iniciativa
        cy.url().should('include', 'initiative/k5tdLahSsgSGwCP7DkHa');

        // Verificar que el usuario @angelaSofttek esté en la lista de miembros
        cy.contains('.i-btn-miembro-contenido', '@angelaSofttek')
            .should('be.visible');
    });

    it('visualizarMeGusta - Verificar que "Huella de Carbono" exista en la lista de Iniciativas favoritas', () => {
        //Abrir barra de navegación
        cy.get('.boton-cerrar > .btn').then($btn => {
            if ($btn.text().includes('>')) {
            $btn.click();
            }
        });
        cy.wait(250);
      
        //Navegar a explore
        cy.get('nav').within(() => {
            cy.get('li').contains('Explora').click();
        });
        cy.url().should('include', '/explore');
        cy.wait(5000);

        cy.contains('.e-titulo', 'Huella de Carbono')
        .should('be.visible')
        .parent()
        .within(() => {
            // Hacer click en el corazón para agregar a la lista de Me Gusta
            cy.get('.e-boton').within(() => {
            cy.get('svg').then($icon => {
                if ($icon.hasClass('heart animate') || $icon.hasClass('heart ')) {
                $icon.click();
                } else {
                cy.get('svg').click();
                }
            });
            });
        });
        cy.wait(10000);

        //Navegar a Mis iniciativas
        cy.get('nav').within(() => {
            cy.get('li').contains('Mis Iniciativas').click();
          });
          cy.url().should('include', '/myInitiatives');
          cy.wait(5000);
        
        // Verificar que la iniciativa "Huella de Carbono" esté presente y hacer clic en ella
        cy.contains('.m-titulo', 'Huella de Carbono')
            .should('be.visible')
            .click();

        // Verificar que se abra el modal
        cy.contains('Iniciativa dirigida a disminuir la huella de carbono dentro de oficinas de Guadalajara. Buscamos gente con mucho compromiso con el medio ambiente.')
            .should('be.visible');
    });
});