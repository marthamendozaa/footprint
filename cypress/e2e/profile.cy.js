describe('Pruebas de la vista de perfil', () => {
  beforeEach(() => {
    // Navegar a la página de perfil antes de cada prueba
    cy.visit('evertech-sprint2.web.app');
    cy.get('input[placeholder="Ingresa el correo"]').type('a00833965@tec.mx');
    cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
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
  }); 

  it('perfil1 - Verificar que ya exista un perfil del usuario', () => {
    cy.contains('Angela Gtz').should('be.visible');
    cy.contains('Edad: 21 años').should('be.visible');
    cy.contains('Usuario: @angelaSofttek').should('be.visible');
    cy.contains('a00833965@tec.mx').should('be.visible');

    cy.contains('Trabajo en equipo').should('have.class', 'highlighted');
    cy.contains('Ciberseguridad').should('have.class', 'highlighted');
    cy.contains('Ambiente').should('have.class', 'highlighted');
    cy.contains('Investigación').should('have.class', 'highlighted');
  });

  it('perfil2 - Añadir habilidad y verificar cambio de color', () => {
    cy.contains('Servicios en la nube').should('not.have.class', 'highlighted');
    cy.contains('Servicios en la nube').click();
    cy.contains('Servicios en la nube').should('have.class', 'highlighted');
    cy.wait(2500);
  });

  it('perfil3 - Añadir interés y verificar cambio de color', () => {
    cy.contains('Comunidad').should('not.have.class', 'highlighted');
    cy.contains('Comunidad').click();
    cy.contains('Comunidad').should('have.class', 'highlighted');
    cy.wait(2500);
  });

  it('perfil4 - Verificar mensaje de error por falta de habilidades', () => {
    // Eliminar todas las habilidades
    cy.wait(2500);
    cy.contains('Trabajo en equipo').click();
    cy.contains('Ciberseguridad').click();  
    cy.contains('Servicios en la nube').click();
    cy.contains('Debes tener al menos una habilidad').should('be.visible');
  });

  it('perfil5 - Verificar mensaje de error por falta de intereses', () => {
    // Eliminar todos los intereses
    cy.wait(250);
    cy.contains('Ambiente').click();
    cy.contains('Investigación').click();
    cy.contains('Comunidad').click();

    cy.contains('Debes tener al menos un interés').should('be.visible');
  });

  it('perfil6 - Cambiar el nombre de Angela Gtz a Martha Mendoza', () => {
    // Hacer clic en el botón de edición (FaPen)
    cy.get('.edit-profile-btn').click();

    // Editar el nombre
    cy.get('input.edit-name-box').clear().type('Martha Mendoza');

    // Hacer clic fuera del input para guardar los cambios
    cy.get('body').click(0, 0); // Simula un clic en la esquina superior izquierda de la página

    // Verificar que el nombre haya cambiado
    cy.contains('Martha Mendoza').should('be.visible');
  });

  it('perfil7 - Verificar que el nombre no puede estar vacío', () => {
    // Hacer clic en el botón de edición (FaPen)
    cy.get('.edit-profile-btn').click();

    // Borrar el contenido del input de nombre
    cy.get('input.edit-name-box').clear();

    // Hacer clic fuera del input para desencadenar la validación
    cy.get('body').click(0, 0); // Simula un clic en la esquina superior izquierda de la página

    // Verificar que el mensaje de error aparezca
    cy.contains('El nombre no puede estar vacío').should('be.visible');
  });

  it('perfil8 - Cambiar el nombre a números', () => {
    // Hacer clic en el botón de edición (FaPen)
    cy.get('.edit-profile-btn').click();

    // Editar el nombre
    cy.get('input.edit-name-box').clear().type('5678');

    // Hacer clic fuera del input para guardar los cambios
    cy.get('body').click(0, 0); // Simula un clic en la esquina superior izquierda de la página

    // Verificar que el nombre haya cambiado
    cy.contains('El nombre solo puede contener letras').should('be.visible');
  });

  it('cerrarSesion1 - Cancelar el cierre de sesión', () => {
    // Estar en la vista perfil
    cy.url().should('include', '/profile');

    // Presionar el botón Cerrar Sesión
    cy.contains('Cerrar Sesión').click();

    // Presionar Cancelar en el diálogo de confirmación
    cy.contains('Cancelar').click();

    // Regresar a la vista de perfil
    cy.url().should('include', '/profile');
  });

  it('cerrarSesion2 - Confirmar el cierre de sesión', () => {
    // Estar en la vista perfil
    cy.url().should('include', '/profile');

    // Presionar el botón Cerrar Sesión
  cy.get('button').contains('Cerrar Sesión').click();

  // Presionar Cerrar sesión en el cuadro de diálogo de confirmación
  cy.get('.modal').within(() => {
    cy.get('button').contains('Cerrar Sesión').click();
  });

    // Cambiar a la vista de Inicio de sesión
    cy.url().should('include', '/login');
  });

  it('contraNoValida1 - Contraseña actual, nueva y confirmación iguales', () => {
    cy.contains('Cambiar contraseña').click();
    cy.get('input[placeholder="Contraseña actual"]').type('123456');
    cy.get('input[placeholder="Nueva contraseña"]').type('123456');
    cy.get('input[placeholder="Confirmar nueva contraseña"]').type('123456');
    cy.get('button').contains('Guardar').should('be.disabled');
  });

  it('contraNoValida2 - Contraseñas no coinciden', () => {
    cy.contains('Cambiar contraseña').click();
    cy.get('input[placeholder="Contraseña actual"]').type('evertech123!');
    cy.get('input[placeholder="Nueva contraseña"]').type('204evertech!');
    cy.get('input[placeholder="Confirmar nueva contraseña"]').type('654321');
    cy.get('input[placeholder="Contraseña actual"]').click();
    cy.contains('Las contraseñas no coinciden').should('be.visible');
  });

  it('contraNoValida3 - Campos de contraseña vacíos', () => {
    cy.contains('Cambiar contraseña').click();
    cy.get('input[placeholder="Contraseña actual"]').clear();
    cy.get('input[placeholder="Nueva contraseña"]').clear();
    cy.get('input[placeholder="Confirmar nueva contraseña"]').clear();
    cy.get('button').contains('Guardar').should('be.disabled');
  });

  it('contraNoValida4 - Nueva contraseña demasiado corta', () => {
    cy.contains('Cambiar contraseña').click();
    cy.get('input[placeholder="Contraseña actual"]').type('123evertech');
    cy.get('input[placeholder="Nueva contraseña"]').type('12');
    cy.get('input[placeholder="Confirmar nueva contraseña"]').clear();
    cy.get('button').contains('Guardar').should('be.disabled');
  });
});
  