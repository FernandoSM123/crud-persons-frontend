import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../models/person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private static readonly headers =new HttpHeaders().set("Content-Type","application/json");; //constante

  constructor(
    private http:HttpClient
  ) {}

  getPersons(amount:number):Observable<any> {
    let headers=new HttpHeaders().set("Content-Type","application/json");
    const path = "https://crud-persons.herokuapp.com/api/getPersons/"+amount;
    return this.http.get(path,{headers:headers});
  }

  getPersonsByPagination(page:number,limit:number,field:string,value:string):Observable<any>{
    const path= "https://crud-persons.herokuapp.com/api/getPersonsByPagination?limit="+limit+"&page="+page+"&field="+field+"&value="+value;
    return this.http.get(path);
  }

  insertPerson(person:Person):Observable<any>{
    let params=JSON.stringify(person);
    let headers=new HttpHeaders().set("Content-Type","application/json");
    const path= "https://crud-persons.herokuapp.com/api/savePerson";

    return this.http.post(path,params,{headers:headers});
  }

  deletePerson(personID:number | undefined):Observable<any>{
    let headers=new HttpHeaders().set("Content-Type","application/json");
    const path= "https://crud-persons.herokuapp.com/api/deletePerson/"+personID;
    
    return this.http.delete(path,{headers:headers});
  }

  deleteAllPersons():Observable<any>{
    let headers=new HttpHeaders().set("Content-Type","application/json");
    const path= "https://crud-persons.herokuapp.com/api/deleteAllPersons";
    
    return this.http.delete(path,{headers:headers});
  }

  updatePersonById(person:Person):Observable<any>{
    let params=JSON.stringify(person);
    let headers=new HttpHeaders().set("Content-Type","application/json");
    const path= "https://crud-persons.herokuapp.com/api/updatePerson/"+person._id;

    return this.http.put(path,params,{headers:headers});
  }
}
