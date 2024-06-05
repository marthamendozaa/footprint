describe('Realizar inicio de sesión en la plataforma', () => {

  beforeEach(() => {
    // Navegar a la página de inicio de sesión antes de cada prueba
    cy.visit('evertech-sprint2.web.app');
  });

  it('inicioValido - introduce usuario válido', () => {
    cy.get('input[type="correo"]').type('a00833965@tec.mx');
    cy.get('input[type="password"]').type('evertech123!');
    cy.get('button[type="submit"]').click();

    // Verificar que la vista principal es visible después de un inicio de sesión exitoso
    cy.url().should('include', '/explore'); // Cambia '/main-view' a la URL de tu vista principal

    //Navegación entre páginas
    //Abrir barra de navegación
    cy.get('.boton-cerrar > .btn').then($btn => {
      if ($btn.text().includes('>')) {
        $btn.click();
      }
    });

    // Esperar a que el texto de la navbar esté visible 
    cy.wait(250);

    //Navegar a Solicitudes
    cy.get('nav').within(() => {
      cy.get('li').contains('Solicitudes').click();
    });
    cy.url().should('include', '/requests');

    //Navegar a Mis iniciativas
    cy.get('nav').within(() => {
      cy.get('li').contains('Mis Iniciativas').click();
    });
    cy.url().should('include', '/myInitiatives');

    //Navegar a Perfil
    cy.get('nav').within(() => {
      cy.get('li').contains('Perfil').click();
    });
    cy.url().should('include', '/profile');

    //Navegar a Crear
    cy.get('nav').within(() => {
      cy.get('button').contains('Crear').click();
    });
    cy.url().should('include', '/create');
  });
  

  it('inicioNoValido1 - usuario no existe', () => {
    cy.get('input[type="correo"]').type('angiegtz@softtek.com');
    cy.get('input[type="password"]').type('evertech123');
    cy.get('button[type="submit"]').click();

    // Verificar mensaje de error para usuario no existente
    cy.contains('Inicio de sesión fallido. Verifica tu correo y contraseña.').should('be.visible');
  });

  it('inicioNoValido2 - contraseña incorrecta', () => {
    cy.get('input[type="correo"]').type('a00833965@tec.mx');
    cy.get('input[type="password"]').type('123evertech');
    cy.get('button[type="submit"]').click();

    // Verificar mensaje de error para contraseña incorrecta
    cy.contains('Inicio de sesión fallido. Verifica tu correo y contraseña.').should('be.visible');
  });

  it('inicioNoValido3 - contraseña vacía', () => {
    cy.get('input[type="correo"]').type('a00833965@tec.mx');
    cy.get('button[type="submit"]').should('be.disabled');

  });

  it('inicioNoValido4 - formato de correo inválido', () => {
    cy.get('input[type="correo"]').type('Angela');
    cy.get('input[type="password"]').type('123evertech');
    cy.get('button[type="submit"]').should('be.disabled');

    // Verificar mensaje de error para formato de correo inválido
    cy.contains('Formato de correo inválido').should('be.visible');
  });
});
