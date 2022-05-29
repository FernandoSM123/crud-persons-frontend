import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PersonService } from './services/person.service';
import { Person } from './models/person';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'CRUD-Persons';
  public tableHeaders = ["position", "name", "lastName", "age", "delete", "update"];
  public usersForm!: FormGroup;
  public dataSource = new MatTableDataSource<Person>([]);
  public searchValue = "";
  public selectedField = "all";
  public noUsers = false;
  public noResult = false;
  public updateState = false;
  public personToUpdate!: Person;
  @ViewChild("paginator", { static: false }) paginator!: MatPaginator;
  @ViewChild("searchInput", { static: false }) searchInput: ElementRef;
  //Pagination options
  length = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    searchInput: ElementRef,
    private spinner: NgxSpinnerService
  ) {
    this.searchInput = searchInput;
  }

  ngOnInit(): void {
    // this.spinner.show();
    // this.spinner.hide();
    this.dataSource.paginator = this.paginator;
    this.buildForm();
    this.getPersonsByPagination();
  }

  //Inicializar formulario y sus validaciones
  buildForm() {
    this.usersForm = this.fb.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      age: [null, [
        Validators.required,
        Validators.min(18),
        Validators.max(100),
      ]],
    });
  }

  //Form getters
  get name() { return this.usersForm?.get('name'); }
  get lastName() { return this.usersForm?.get('lastName'); }
  get age() { return this.usersForm?.get('age'); }


  //Recoje los datos del formulario para crear una nueva persona
  insertUser() {
    let name: string = this.usersForm?.get('name')?.value;
    let lastName: string = this.usersForm?.get('lastName')?.value;
    let age: number = this.usersForm?.get('age')?.value;
    let person: Person = { name: name, lastName: lastName, age: age };

    this.personService.insertPerson(person).subscribe(data => {

      //Caso de que se este ingresando el primer usuario
      if (this.noUsers) {
        this.noUsers = false;
      }
      setTimeout(() => {
        //this.paginator.length = this.paginator.length + 1;
        this.getPersonsByPagination();
      });
      console.log("*** INSERTED PERSON ***");
      console.log(data);
    });
    this.usersForm?.reset();
    this.clearFormErrors();
  }

  //Carga la lista de personas registradas usando paginacion
  getPersonsByPagination() {
    this.personService.getPersonsByPagination(this.currentPage + 1, this.pageSize, this.selectedField, this.searchValue).subscribe(data => {

      //Si no hay usuarios registrados aun
      if (data.result.docs.length === 0) {
        this.noUsers = true;
        return;
      }
      this.dataSource.data = data.result.docs;
      this.noUsers = false;
      setTimeout(() => {
        this.paginator.pageIndex = this.currentPage;
        this.paginator.length = data.result.totalDocs;
      });
      console.log("*** LIST OF PERSONS ***");
      console.log(data);
    });
  }

  //Busca personas por cierto campo y cierto valor
  searchPersonsByField() {
    this.searchValue = this.searchInput.nativeElement.value;
    this.searchInput.nativeElement.value = "";
    this.disableUpdateState();

    this.personService.getPersonsByPagination(this.currentPage + 1, this.pageSize, this.selectedField, this.searchValue).subscribe(data => {

      //Si el resultado no devuelve ningun usuario
      if (data.result.docs.length === 0) {
        this.noResult = true;
        return;
      }
      this.dataSource.data = data.result.docs;
      this.noResult = false;
      setTimeout(() => {
        this.paginator.pageIndex = this.currentPage;
        this.paginator.length = data.result.totalDocs;
      });
      console.log("*** LIST OF PERSONS BY FILTER***");
      console.log(data);
    });
  }

  //Eliminar usuario de la BD y la tabla
  deleteUser(person: Person) {
    //Si los botones de actualizar estan activos se ocultan
    this.disableUpdateState();

    this.personService.deletePerson(person._id).subscribe(data => {
      let personIndex = this.dataSource.data.indexOf(person);
      let removed = this.dataSource.data.splice(personIndex, 1);
      this.dataSource.data = this.dataSource.data;

      // //Caso de que se eliminara el unico usuario
      // if (this.dataSource.data.length === 0) {
      //   this.getPersonsByPagination();
      //   return;
      // }
      setTimeout(() => {
        //this.paginator.length = this.paginator.length - 1;
        this.getPersonsByPagination();
      });
      console.log("DELETED PERSON:", data);
    });

  }

  //Eliminar usuario de la BD y la tabla
  deleteAllUsers() {
    if (confirm("This action will remove all records, wanna proceed?")) {
      //Si los botones de actualizar estan activos se ocultan
      this.disableUpdateState();
      this.personService.deleteAllPersons().subscribe(data => {
        this.dataSource.data = [];
        this.noUsers = true;
        console.log("DELETED ALL PERSONS:", data);
      });
    }
  }

  //Actualizar usuario en la BD y la tabla
  updateUserById() {

    //Tomar datos del formulario
    let id = this.personToUpdate._id;
    let name: string = this.usersForm?.get('name')?.value;
    let lastName: string = this.usersForm?.get('lastName')?.value;
    let age: number = this.usersForm?.get('age')?.value;
    let person: Person = { _id: id, name: name, lastName: lastName, age: age };

    //Peticion
    this.personService.updatePersonById(person).subscribe(data => {

      //Actualizar datos en la tabla
      let personIndex = this.dataSource.data.indexOf(this.personToUpdate);
      let updated = this.dataSource.data[personIndex] = data.personUpdated;
      this.dataSource.data = this.dataSource.data;

      this.disableUpdateState();
      console.log("UPDATED PERSON:", data);
    });
  }

  //Activar botones de actualizar 
  //Y llenar formulario con los datos del usuario a actualizar
  enableUpdateState(person: Person) {
    this.updateState = true;
    this.personToUpdate = person;
    //llenar formulario con los datos de la persona
    this.name?.setValue(person.name);
    this.lastName?.setValue(person.lastName);
    this.age?.setValue(person.age);
  }

  //Ocultar botones de actualizar
  //Y resetear formulario
  disableUpdateState() {
    this.updateState = false;
    this.usersForm?.reset();
    this.clearFormErrors();
  }

  //Cuando se cambia la pagina del paginador
  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getPersonsByPagination();
  }

  //Cambia el valor seleccionado del dropdown
  changeSelectedField(event: any) {
    this.selectedField = event.target.value;
  }

  //Limpiar los errores de los campos de los formularios
  clearFormErrors(){
    this.usersForm.controls["name"].setErrors(null);
    this.usersForm.controls["lastName"].setErrors(null);
    this.usersForm.controls["age"].setErrors(null);
  }


}
