describe('Pruebas de registro - Parte 2', () => {
    beforeEach(() => {
      cy.visit('evertech-sprint2.web.app/register');
  
      cy.get('input[placeholder="Ingresa el correo"]').type('angegtzv@gmail.com');
      cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
      cy.get('input[placeholder="Confirma la contraseña"]').type('evertech123!');
      cy.get('button[type="submit"]').click();
    });
  
    it('infoRegistro2 - El usuario ya existe', () => {
      // Ingresar nombre y usuario ya existentes
      cy.get('input[placeholder="Ingresa tu nombre completo"]').type('Angela Gutiérrez');
      cy.get('input[placeholder="Ingresa tu usuario"]').type('isabellaSofttek');
  
      // Desenfocar el campo para activar la validación
      cy.get('input[placeholder="Ingresa tu usuario"]').blur();
  
      // Verificar mensaje de usuario duplicado
      cy.contains('El usuario ya está en uso').should('be.visible');
    });
  
    it('infoRegistro3 - Menor de edad', () => {
      // Ingresar datos de menor de edad
      cy.get('input[placeholder="Ingresa tu nombre completo"]').type('Angela Gutiérrez');
      cy.get('input[placeholder="Ingresa tu usuario"]').type('angieGtzSofttek');
      cy.get('.fecha-caja-register2').type('01/06/2009');
  
      // Desenfocar el campo para activar la validación
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
  
      // Verificar que se abre la pantalla de carta responsiva
      cy.contains('Carta Responsiva - Menor de Edad').should('be.visible');
    });
  
    it('infoRegistro4 - Formato de nombre inválido', () => {
      // Ingresar nombre con formato inválido
      cy.get('input[placeholder="Ingresa tu nombre completo"]').type('Martha7');
  
      // Desenfocar el campo para activar la validación
      cy.get('input[placeholder="Ingresa tu nombre completo"]').blur();
  
      // Verificar mensaje de formato de nombre inválido
      cy.contains('Formato de nombre inválido').should('be.visible');
    });
  });
  