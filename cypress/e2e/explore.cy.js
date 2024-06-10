describe('Pruebas de la vista explora', () => {
    beforeEach(() => {
      // Navegar a la página de perfil antes de cada prueba
      cy.visit('evertech-sprint2.web.app');
      cy.get('input[placeholder="Ingresa el correo"]').type('a00833965@tec.mx');
      cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
      cy.get('button[type="submit"]').click();
      cy.wait(5000); // Esperar un segundo para asegurar que la página cargue completamente
    });
  
    it('explora1 - buscar "Carbon " sin filtros', () => {
      // Esperar a que el input de búsqueda esté presente y visible
      cy.get('input[placeholder="¿Qué iniciativa buscas?"]')
        .should('exist')
        .should('be.visible')
        .type('Carbon');
      
      // Esperar a que el resultado de la búsqueda esté visible
      cy.contains('Huella de Carbono').should('be.visible');
    });
  
    it('explora2 - buscar "Carbo" con filtro de lugar "CDMX"', () => {
      // Esperar a que el filtro de ubicación esté presente y visible
      cy.contains('Ubicación')
        .should('exist')
        .should('be.visible')
        .click();
      
      // Esperar a que la opción de CDMX esté presente y visible
      cy.contains('CDMX')
        .should('exist')
        .should('be.visible')
        .click();
      
      cy.get('input[placeholder="¿Qué iniciativa buscas?"]')
      .should('exist')
      .should('be.visible')
      .type('Hogar');
      
      // Esperar a que el resultado de la búsqueda esté visible
      cy.contains('Hogar Sustentable').should('be.visible');
    });

    it('explora3 - buscar "Reforestación de Árboles" sin resultados', () => {
        // Esperar a que el input de búsqueda esté presente y visible
        cy.get('input[placeholder="¿Qué iniciativa buscas?"]')
          .should('exist')
          .should('be.visible')
          .type('Reforestación de Árboles');
        
        // Verificar que no haya resultados visibles en el contenedor de iniciativas
        cy.get('.e-iniciativas-container')
          .children()
          .should('have.length', 0);
    });

    it('explora4 - buscar "Iniciativa Reciclaje" y verificar botón Solicitar Unirme', () => {
    // Esperar a que el input de búsqueda esté presente y visible
    cy.get('input[placeholder="¿Qué iniciativa buscas?"]')
        .should('exist')
        .should('be.visible')
        .type('Iniciativa Reciclaje');
    
    // Esperar a que el resultado de la búsqueda esté visible y hacer clic en él
    cy.contains('Iniciativa Reciclaje').should('be.visible').click();
    
    /// Verificar que el botón "Solicitar Unirme" sea visible
    cy.contains('button', 'Solicitar unirme').should('be.visible');
    });
/*
    it('explora5 - buscar "Iniciativa Privada" y verificar botón Suscribirme', () => {
        // Esperar a que el input de búsqueda esté presente y visible
        cy.get('input[placeholder="¿Qué iniciativa buscas?"]')
          .should('exist')
          .should('be.visible')
          .type('priv');
        
        // Esperar a que el resultado de la búsqueda esté visible y hacer clic en él
        cy.contains('Iniciativa Privada').should('be.visible').click();
        
        // Verificar que el botón "Suscribirme" sea visible
        cy.contains('button', 'Solicitar unirme').should('be.visible');
    });*/

    it('explora6 - buscar "Smart Cities" y verificar botón ver iniciativa', () => {
        // Esperar a que el input de búsqueda esté presente y visible
        cy.get('input[placeholder="¿Qué iniciativa buscas?"]')
          .should('exist')
          .should('be.visible')
          .type('Smart');
        
        // Esperar a que el resultado de la búsqueda esté visible y hacer clic en él
        cy.contains('Smart Cities').should('be.visible').click();
        
        // Verificar que el botón "Suscribirme" sea visible
        cy.contains('Ver iniciativa').should('be.visible');
    });    
  });
  