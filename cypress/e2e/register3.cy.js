describe('Pruebas de registro - Parte 3', () => {
    beforeEach(() => {
      cy.visit('evertech-sprint2.web.app/register');
  
      cy.get('input[placeholder="Ingresa el correo"]').type('angegtzv@gmail.com');
      cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
      cy.get('input[placeholder="Confirma la contraseña"]').type('evertech123!');
      cy.get('button[type="submit"]').click();
      cy.get('input[placeholder="Ingresa tu nombre completo"]').type('Angela Gutiérrez');
      cy.get('input[placeholder="Ingresa tu usuario"]').type('angieGtzSofttek');
      cy.get('.fecha-caja-register2').type('01/11/2002');
      cy.get('button[type="submit"]').click(); // Submit to move to the next form
    });
  
    it('interesesRegistroNoValido - No seleccionar intereses', () => {
        // Verificar que el botón de continuar esté deshabilitado cuando no se seleccionan intereses
        cy.get('button[type="submit"]').should('be.disabled');
      });

    it('interesesRegistro1 - Selecciona tus intereses', () => {
      // Seleccionar intereses
      cy.contains('li', 'Comunidad').click();
      cy.contains('li', 'Ambiente').click();
      cy.contains('li', 'Liderazgo').click();
  
      // Hacer clic en submit
      cy.get('button[type="submit"]').click();
  
      // Verificar que aparezca el mensaje "Selecciona tus habilidades"
      cy.contains('Selecciona tus habilidades').should('be.visible');

      //Revisa que no se puede avanzar sin tener habilidades
      cy.get('button[type="submit"]').should('be.disabled');

      // Seleccionar habilidades
      cy.contains('li', 'Trabajo en equipo').click();

      //Se puede hacer click en terminar
      cy.get('button[type="submit"]').should('not.be.disabled');
    
    });
  
  });
  