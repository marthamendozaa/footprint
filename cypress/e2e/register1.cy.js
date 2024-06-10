describe('Pruebas de registro', () => {
    beforeEach(() => {
      // Navegar a la página de registro antes de cada prueba
      cy.visit('evertech-sprint2.web.app/register');
    });
  
    it('registroNoValido1 - El correo ya está en uso', () => {
      // Ingresar correo ya registrado
      cy.get('input[placeholder="Ingresa el correo"]').type('mmarthamendozaa@gmail.com');
  
      // Desenfocar el campo para activar la validación
      cy.get('input[placeholder="Ingresa el correo"]').blur();
  
      // Verificar mensaje de correo duplicado
      cy.contains('El correo ya está en uso').should('be.visible');
    });
  
    it('registroNoValido2 - Formato de correo inválido', () => {
      // Ingresar correo inválido
      cy.get('input[placeholder="Ingresa el correo"]').type('isabella');
  
      // Desenfocar el campo para activar la validación
      cy.get('input[placeholder="Ingresa el correo"]').blur();
  
      // Verificar mensaje de formato de correo inválido
      cy.contains('Formato de correo inválido').should('be.visible');
    });
  
    it('registroNoValido3 - Contraseña débil', () => {
      // Ingresar correo válido
      cy.get('input[placeholder="Ingresa el correo"]').type('test@example.com');
  
      // Ingresar contraseña débil
      cy.get('input[placeholder="Ingresa la contraseña"]').type('ever');
  
      // Desenfocar el campo para activar la validación
      cy.get('input[placeholder="Ingresa la contraseña"]').blur();
  
      cy.get('button[type="submit"]').should('be.disabled');
    });
  
    it('registroNoValido4 - Las contraseñas no coinciden', () => {
      // Ingresar correo válido
      cy.get('input[placeholder="Ingresa el correo"]').type('test@example.com');
  
      // Ingresar contraseña
      cy.get('input[placeholder="Ingresa la contraseña"]').type('Evertech123!');
  
      // Ingresar confirmación de contraseña diferente
      cy.get('input[placeholder="Confirma la contraseña"]').type('evertech1');
  
      // Desenfocar el campo para activar la validación
      cy.get('input[placeholder="Confirma la contraseña"]').blur();
  
      // Verificar mensaje de contraseñas no coinciden
      cy.contains('Las contraseñas no coinciden').should('be.visible');
    });
  
    it('registroNoValido5 - No llenar los datos y verificar el botón deshabilitado', () => {
      // Verificar que el botón de registro esté deshabilitado
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });
  