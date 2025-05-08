import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suministros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suministros.component.html',
  styleUrl: './suministros.component.scss'
})
export class SuministrosComponent {
  @ViewChild('searchInput')
  searchInput!: ElementRef;
  @ViewChild('searchResults')
  searchResults!: ElementRef;
  @ViewChild('optionsMenu')
  optionsMenu!: ElementRef;
  @ViewChild('settingsButton')
  settingsButton!: ElementRef;
  
  // Estado para controlar si hay suministros
  hasSuministros = true;
  
  // Suministro seleccionado actualmente
  selectedSuministro = {
    direccion: 'Domicilio completo y largo para ver como queda si es muy enorme el texto',
    localidad: 'Nombre de la localidad',
    alias: 'Nombre del alias',
    nis: '123456789',
    etiquetas: ['Etiqueta', 'Etiqueta', 'Etiqueta'],
    showOptions: false
  };
  
  // Lista de todos los suministros disponibles (no incluye el seleccionado)
  suministros = [
    {
      direccion: 'Avenida de la Libertad N°2541',
      localidad: 'Nombre de la localidad',
      alias: 'Empresa',
      nis: '987654321',
      etiquetas: ['Casa', 'Principal', 'Familiar']
    },
    {
      direccion: 'Boulevard Rivadavia 456',
      localidad: 'Villa Nueva',
      alias: 'Oficina',
      nis: '456789123',
      etiquetas: ['Trabajo', 'Oficina']
    },
    {
      direccion: 'Avenida Corrientes 789',
      localidad: 'Buenos Aires',
      alias: 'Departamento',
      nis: '789123456',
      etiquetas: ['Alquiler', 'Temporal']
    }
  ];

  // Control de los modales
  showModal = false;
  showEditAliasModal = false;
  showDesvincularModal = false;
  
  // Control de errores de validacion
  formErrors = {
    asociar: {
      direccion: false,
      localidad: false,
      alias: false,
      nis: false
    }
  };
  
  // Control del toast
  toast = {
    show: false,
    message: '',
    type: 'error' // 'error', 'success', 'info'
  };
  
  // Suministro a desvincular
  suministroToDesvincular: any = null;
  
  // Termino de busqueda
  searchTerm = '';
  
  // Control de la visualizacion de resultados
  showSearchResults = false;
  
  // Control de la visualizacion de suministros asociados
  showAssociatedSupplies = false;
  
  // Numero maximo de resultados a mostrar
  maxVisibleResults = 4;
  
  // Nuevo suministro para el formulario
  nuevoSuministro = {
    direccion: '',
    localidad: '',
    alias: '',
    nis: '',
    etiquetas: [] as string[]
  };
  
  // Datos para editar alias
  aliasEdit = '';
  
  // Nueva etiqueta para añadir
  nuevaEtiqueta = '';

  // Escuchar clics fuera del componente de busqueda
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    // Verificar si el clic fue fuera del input de búsqueda y de los resultados
    const searchInputElement = this.searchInput?.nativeElement;
    const searchResultsElement = this.searchResults?.nativeElement;
    
    if (!searchInputElement?.contains(event.target) && 
        !searchResultsElement?.contains(event.target)) {
      // Si no hay texto en la búsqueda, ocultar los resultados
      if (!this.searchTerm.trim()) {
        this.showSearchResults = false;
      }
    }
    
    // Cerrar el menu de opciones si se hace clic fuera
    if (this.selectedSuministro.showOptions) {
      const optionsMenuElement = this.optionsMenu?.nativeElement;
      const settingsButtonElement = this.settingsButton?.nativeElement;
      
      if (!optionsMenuElement?.contains(event.target) && 
          !settingsButtonElement?.contains(event.target)) {
        this.selectedSuministro.showOptions = false;
      }
    }
  }

  truncateText(text: string, maxLength: number = 40): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
  
  // Metodo para verificar si el texto necesita truncamiento
  needsTruncation(text: string, maxLength: number = 40): boolean {
    return text.length > maxLength;
  }

  // Metodo para mostrar un toast
  showToast(message: string, type: 'error' | 'success' | 'info' = 'error'): void {
    this.toast = {
      show: true,
      message,
      type
    };
    
    // Ocultar el toast despues de 5 segundos
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }
  
  // Metodo para ocultar el toast
  hideToast(): void {
    this.toast.show = false;
  }

  // Metodo para abrir el modal de asociar
  openAsociarModal(): void {
    this.showModal = true;
    // Reiniciar el formulario y los errores
    this.nuevoSuministro = {
      direccion: '',
      localidad: '',
      alias: '',
      nis: '',
      etiquetas: []
    };
    this.resetFormErrors('asociar');
    this.nuevaEtiqueta = '';
  }

  // Metodo para cerrar el modal de asociar
  closeModal(): void {
    this.showModal = false;
  }

  // Metodo para abrir el modal de editar alias
  openEditAliasModal(): void {
    this.showEditAliasModal = true;
    this.selectedSuministro.showOptions = false; // Cerrar el menu de opciones
    
    // Copiar el alias actual al formulario de edicion
    this.aliasEdit = this.selectedSuministro.alias;
  }

  // Metodo para cerrar el modal de editar alias
  closeEditAliasModal(): void {
    this.showEditAliasModal = false;
  }
  
  // Metodo para abrir el modal de desvincular suministro
  openDesvincularModal(): void {
    this.showDesvincularModal = true;
    this.selectedSuministro.showOptions = false; // Cerrar el menu de opciones
    this.suministroToDesvincular = this.selectedSuministro;
  }
  
  // Metodo para cerrar el modal de desvincular suministro
  closeDesvincularModal(): void {
    this.showDesvincularModal = false;
    this.suministroToDesvincular = null;
  }

  // Metodo para enviar el formulario de asociar
  submitForm(): void {
    // Validar que todos los campos esten completos
    const validationResult = this.validateForm('asociar');
    
    if (validationResult.isValid) {
      // Crear nuevo suministro
      const newSuministro = {
        direccion: this.nuevoSuministro.direccion,
        localidad: this.nuevoSuministro.localidad,
        alias: this.nuevoSuministro.alias,
        nis: this.nuevoSuministro.nis,
        etiquetas: [...this.nuevoSuministro.etiquetas]
      };
      
      // Agregar el nuevo suministro a la lista
      this.suministros.push(newSuministro);
      
      // Si no hay suministro seleccionado, seleccionar este nuevo
      if (!this.hasSuministros) {
        this.selectedSuministro = {
          ...newSuministro,
          showOptions: false
        };
        this.hasSuministros = true;
        //Lo quitamos de la lista de suministros que agregamos anteriormente
        this.suministros = this.suministros.filter(s => s.nis !== newSuministro.nis);
      }

      if(this.suministros.length <= 1) {
        this.showAssociatedSupplies = false;
      }else{
        this.showAssociatedSupplies = true;
      }
      
      // Mostrar toast de exito
      this.showToast('Suministro asociado correctamente', 'success');
      
      // Cerrar el modal
      this.closeModal();
    } else {
      // Mostrar toast con los campos faltantes
      this.showToast(validationResult.message, 'error');
    }
  }
  
  // Metodo para enviar el formulario de editar alias
  submitEditAliasForm(): void {
    if (this.aliasEdit.trim()) {
      // Actualizar el alias del suministro seleccionado
      this.selectedSuministro.alias = this.aliasEdit;
      
      // Actualizar tambien en la lista de suministros
      const index = this.suministros.findIndex(s => s.nis === this.selectedSuministro.nis);
      if (index !== -1) {
        this.suministros[index].alias = this.aliasEdit;
      }
      
      // Mostrar toast de exito
      this.showToast('Alias actualizado correctamente', 'success');
      
      // Cerrar el modal
      this.closeEditAliasModal();
    } else {
      // Mostrar toast de error
      this.showToast('El alias no puede estar vacío', 'error');
    }
  }
  
  // Metodo para validar formularios
  validateForm(formType: 'asociar'): { isValid: boolean, message: string } {
    let isValid = true;
    const camposFaltantes: string[] = [];
    
    if (formType === 'asociar') {
      // Validar campos del formulario de asociar
      if (!this.nuevoSuministro.direccion.trim()) {
        this.formErrors.asociar.direccion = true;
        camposFaltantes.push('Dirección');
        isValid = false;
      } else {
        this.formErrors.asociar.direccion = false;
      }
      
      if (!this.nuevoSuministro.localidad.trim()) {
        this.formErrors.asociar.localidad = true;
        camposFaltantes.push('Localidad');
        isValid = false;
      } else {
        this.formErrors.asociar.localidad = false;
      }
      
      if (!this.nuevoSuministro.alias.trim()) {
        this.formErrors.asociar.alias = true;
        camposFaltantes.push('Alias');
        isValid = false;
      } else {
        this.formErrors.asociar.alias = false;
      }
      
      if (!this.nuevoSuministro.nis.trim()) {
        this.formErrors.asociar.nis = true;
        camposFaltantes.push('NIS');
        isValid = false;
      } else {
        this.formErrors.asociar.nis = false;
      }
    }
    
    // Construir mensaje de error
    let message = '';
    if (camposFaltantes.length > 0) {
      message = `Por favor, complete los siguientes campos obligatorios: ${camposFaltantes.join(', ')}`;
    }
    
    return { isValid, message };
  }
  
  // Metodo para resetear errores de formulario
  resetFormErrors(formType: 'asociar'): void {
    if (formType === 'asociar') {
      this.formErrors.asociar = {
        direccion: false,
        localidad: false,
        alias: false,
        nis: false
      };
    }
  }

  // Metodo para mostrar/ocultar opciones del suministro principal
  toggleSuministroOptions(): void {
    this.selectedSuministro.showOptions = !this.selectedSuministro.showOptions;
  }
  
  // Metodo para mostrar/ocultar suministros asociados
  toggleAssociatedSupplies(): void {
    this.showAssociatedSupplies = !this.showAssociatedSupplies;
  }
  
  // Metodo para desvincular un suministro
  desvincularSuministro(): void {
    if (this.suministroToDesvincular) {
      // Si el suministro desvinculado es el seleccionado actualmente
      if (this.selectedSuministro.nis === this.suministroToDesvincular.nis) {
        // Si hay otros suministros, seleccionar el primero
        if (this.suministros.length > 0) {
          const newSelected = this.suministros[0];
          this.selectedSuministro = {
            ...newSelected,
            showOptions: false
          };
          
          // Eliminar el nuevo suministro seleccionado de la lista
          this.suministros = this.suministros.filter(
            suministro => suministro.nis !== newSelected.nis
          );
        } else {
          // Si no hay más suministros, mostrar el estado "sin suministros"
          this.hasSuministros = false;
        }
      } else {
        // Si el suministro desvinculado no es el seleccionado, solo eliminarlo de la lista
        this.suministros = this.suministros.filter(
          suministro => suministro.nis !== this.suministroToDesvincular.nis
        );
      }
      
      // Mostrar toast de exito
      this.showToast('Suministro desvinculado correctamente', 'success');
      
      // Cerrar el modal
      this.closeDesvincularModal();
    }
  }

  // Metodo para filtrar suministros basado en el termino de busqueda
  get filteredSuministros() {
    if (!this.searchTerm.trim()) {
      return this.suministros;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.suministros.filter(suministro => 
      suministro.direccion.toLowerCase().includes(term) || 
      suministro.localidad.toLowerCase().includes(term) || 
      suministro.alias.toLowerCase().includes(term) ||
      suministro.nis.toLowerCase().includes(term)
    );
  }

  // Metodo para obtener los suministros limitados para mostrar
  get limitedSuministros() {
    return this.filteredSuministros.slice(0, this.maxVisibleResults);
  }

  // Metodo para verificar si hay mas resultados de los que se muestran
  get hasMoreResults(): boolean {
    return this.filteredSuministros.length > this.maxVisibleResults;
  }

  // Metodo para obtener el numero de resultados adicionales
  get additionalResultsCount(): number {
    return this.filteredSuministros.length - this.maxVisibleResults;
  }

  // Metodo para resaltar el termino de busqueda en el texto
  highlightText(text: string): string {
    if (!this.searchTerm.trim()) {
      return text;
    }
    
    const regex = new RegExp(`(${this.searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // Metodo para mostrar los resultados de busqueda
  onSearchFocus(): void {
    this.showSearchResults = true;
  }

  // Metodo para limpiar la busqueda
  clearSearch(): void {
    this.searchTerm = '';
  }

  // Metodo para seleccionar un suministro
  selectSuministro(suministro: any): void {
    // Guardar el suministro actual en la lista
    const currentSuministro = {
      direccion: this.selectedSuministro.direccion,
      localidad: this.selectedSuministro.localidad,
      alias: this.selectedSuministro.alias,
      nis: this.selectedSuministro.nis,
      etiquetas: this.selectedSuministro.etiquetas || []
    };
    
    // Eliminar el suministro seleccionado de la lista
    this.suministros = this.suministros.filter(s => s.nis !== suministro.nis);
    
    // Añadir el suministro actual a la lista
    this.suministros.push(currentSuministro);
    
    // Establecer el nuevo suministro seleccionado
    this.selectedSuministro = {
      ...suministro,
      showOptions: false
    };
    
    // Cerrar los resultados de busqueda
    this.showSearchResults = false;
    // Cerrar los suministros asociados
    this.showAssociatedSupplies = false;
  }
  
  // Metodo para determinar si mostrar el buscador o las tarjetas
  get shouldShowSearcher(): boolean {
    return this.suministros.length > 2;
  }
  
  // Metodo para determinar si mostrar las tarjetas
  get shouldShowCards(): boolean {
    return this.suministros.length > 0 && this.suministros.length <= 2;
  }
  
  // Metodo para determinar si mostrar el boton de flecha
  get shouldShowArrowButton(): boolean {
    if(this.suministros.length > 1 || (this.suministros.length == 1 && this.selectedSuministro)){
      return true;
    }else{
      return false;
    }
  }
  
  // Metodos para manejo de etiquetas
  
  // Método para agregar una etiqueta (para asociar)
  addTag(): void {
    const tag = this.nuevaEtiqueta.trim();
    
    if (tag && this.nuevoSuministro.etiquetas.length < 3) {
      // Verificar si la etiqueta ya existe
      if (!this.nuevoSuministro.etiquetas.includes(tag)) {
        this.nuevoSuministro.etiquetas.push(tag);
        this.nuevaEtiqueta = ''; // Limpiar el campo
      } else {
        this.showToast('Esta etiqueta ya existe', 'info');
      }
    } else if (this.nuevoSuministro.etiquetas.length >= 3) {
      this.showToast('Solo se permiten hasta 3 etiquetas', 'info');
    }
  }
  
  // Metodo para eliminar una etiqueta (para asociar)
  removeTag(index: number): void {
    this.nuevoSuministro.etiquetas.splice(index, 1);
  }
  
  // Metodo para manejar la tecla Enter en el input de etiquetas
  handleTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evitar que el formulario se envie
      this.addTag();
    }
  }
}