describe('Eliminar iniciativa desde la página de Explora', () => {
    beforeEach(() => {
      // Iniciar sesión como administrador
      cy.visit('evertech-sprint2.web.app');
      cy.get('input[placeholder="Ingresa el correo"]').type('admin@evertech.com');
      cy.get('input[placeholder="Ingresa la contraseña"]').type('evertech123!');
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
    });
  
    it('cancelar eliminar la iniciativa "Reforestación"', () => {
      // Buscar la iniciativa "Reforestación"
      cy.contains('.e-titulo', 'Reforestación').parent().within(() => {
        // Hacer clic en el SVG de la iniciativa
        cy.get('.e-boton svg').click();
      });
  
      // Confirmar que se muestra el modal de eliminación
      cy.get('.ea-modal-title').should('contain', 'Confirmar eliminación');
  
      // Confirmar que la iniciativa que se va a eliminar es "Reforestación"
      cy.get('.ea-modal-body').should('contain', '¿Estás seguro que quieres eliminar la iniciativa Reforestación?');
  
      // Confirmar que se puede eliminar la iniciativa
      cy.contains('Cerrar').click();
  
      cy.contains('.e-titulo', 'Reforestación').should('exist');
      
    });

    it('debería eliminar la iniciativa "Reforestación"', () => {
        // Buscar la iniciativa "Reforestación"
        cy.contains('.e-titulo', 'Reforestación').parent().within(() => {
          // Hacer clic en el SVG de la iniciativa
          cy.get('.e-boton svg').click();
        });
    
        // Confirmar que se muestra el modal de eliminación
        cy.get('.ea-modal-title').should('contain', 'Confirmar eliminación');
    
        // Confirmar que la iniciativa que se va a eliminar es "Reforestación"
        cy.get('.ea-modal-body').should('contain', '¿Estás seguro que quieres eliminar la iniciativa Reforestación?');
    
        // Confirmar que se puede eliminar la iniciativa
        cy.get('.eliminar').click();
        cy.wait(10000)
    
        // Verificar que se muestra el mensaje de éxito
        cy.get('.ea-modal-title').should('contain', 'Éxito');
       
        
      });
  });
  