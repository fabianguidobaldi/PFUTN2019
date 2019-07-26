import React, { Component } from 'react';
import Select from 'react-select';
import "../Style/Alta.css";

import {Link} from 'react-router-dom'
import {Database, Firebase} from "../../config/config";

//https://react-select.com/home
//https://firebase.google.com/docs/auth/web/manage-users#create_a_user

class AltaEncargado extends Component{

    constructor(){
        super();
        this.state = {
            nombre: '',
            apellido: '',
            tipoDocumento: '',
            documento: '',
            legajo: '',
            celular: '',
            descripcion: '',
            fechaNacimiento: '',
            fechaAlta: '', 
            mail: '',
            pass: '',
            idCountry: '',
            tipoD: [],// Para cargar el combo
            resultado: ''
        }
        this.addEncargado= this.addEncargado.bind(this);
        this.ChangeNombre = this.ChangeNombre.bind(this);
        this.ChangeApellido = this.ChangeApellido.bind(this);
        this.ChangeLegajo = this.ChangeLegajo.bind(this);
        this.ChangeDocumento = this.ChangeDocumento.bind(this);
        this.ChangeCelular = this.ChangeCelular.bind(this);
        this.ChangeDescripcion = this.ChangeDescripcion.bind(this);
        this.ChangeFechaNacimiento = this.ChangeFechaNacimiento.bind(this);
        this.ChangeMail = this.ChangeMail.bind(this);
        this.ChangePass = this.ChangePass.bind(this);
        this.crearUsuario = this.crearUsuario.bind(this);
        this.registrar = this.registrar.bind(this);

    }

    async componentDidMount(){
        const { tipoD } = this.state;
        await Database.collection('TipoDocumento').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                this.state.tipoD.push(
                    {value: doc.id, label: doc.data().Nombre}
                )
            });
        });
        this.setState({tipoD});
        await Database.collection('Administradores').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                
                if(doc.data().Usuario === localStorage.getItem('mail')){
                        this.state.idCountry = doc.data().IdCountry
                }
            });
        });
        
        
        
    }


    addEncargado(){
        var dbRef = Database.collection('Encargados')
        dbRef.add({
            Nombre: this.state.nombre,
            Apellido: this.state.apellido,
            Legajo: this.state.legajo,
            Documento: this.state.documento,
            Celular: this.state.celular,
            Descripcion: this.state.descripcion,
            TipoDocumento: Database.doc('TipoDocumento/' + this.state.tipoDocumento.valueOf().value),
            FechaNacimiento: this.state.fechaNacimiento,
            FechaAlta: new Date(),
            Usuario: this.state.mail,
            IdCountry: this.state.idCountry,

        });

    }

    ChangeNombre(event) {
        this.setState({nombre : event.target.value});
    }
    ChangeApellido(event) {
        this.setState({apellido: event.target.value});
    }
    ChangeLegajo(event) {
        this.setState({legajo: event.target.value});
    }

    ChangeCelular(event) {
        this.setState({celular : event.target.value});
    }
    ChangeDocumento(event) {
        this.setState({documento : event.target.value});
    }
    ChangeDescripcion(event) {
        this.setState({descripcion : event.target.value});
    }

    ChangeSelect(value){
        this.setState({tipoDocumento : value});
    }
    ChangeFechaNacimiento(event){
        this.setState({fechaNacimiento : event.target.value});
    }

    ChangeMail(event) {
        this.setState({mail : event.target.value});
    }
    ChangePass(event) {
        this.setState({pass : event.target.value});
    }


    registrar(){
        //Agregar validaciones para no registrar cualquier gilada
        if(true){
            this.crearUsuario();
            this.addEncargado();
        }
    }

    crearUsuario(){
        const {mail} = this.state;
        const {pass} = this.state;
        if (true){
            Firebase.auth().createUserWithEmailAndPassword(mail, pass).then(
                Database.collection('Usuarios').doc(mail).set({
                    NombreUsuario: mail,
                    TipoUsuario: Database.doc('/TiposUsuario/Encargado')
                })
            )
            .catch(function(error) {
              console.log('error :', error);
              //La pass debe tener al menos 6 caracteres wachina
            });
           

        }
    }



    render(){
        return(
            <div className="col-12 jumbotron">
            <div>
                <div className="col-md-1"></div>
                <div className="col-md-8 borde">
                    <legend>  Registrar Alta </legend>
                        <div className = "form-group">
                            <label for = "Nombre">  Nombre  </label>
                            <input type = "name" className = "form-control"   placeholder = "Name"
                            value={this.state.nombre}
                            onChange={this.ChangeNombre}
                            />
                        </div>
                        <div className = "form-group">
                            <label for = "Apellido">  Apellido  </label>
                            <input type = "family-name" className = "form-control"   placeholder = "Surname"
                                    value={this.state.apellido}
                                   onChange= {this.ChangeApellido} />
                        </div>
                        <div className = "form-group">
                        <label for = "TipoDocumento">  Tipo Documento  </label>
                            <Select
                                className="select-documento"
                                classNamePrefix="select"
                                defaultValue={this.state.tipoD[0]}
                                isDisabled={false}
                                isLoading={false}
                                isClearable={true}
                                isSearchable={true}
                                options={this.state.tipoD}
                                onChange={this.ChangeSelect.bind(this)}
                            />
                        </div>
                        <div className = "form-group">
                            <label for = "NumeroDocumento">  Numero de Documento  </label>
                            <input type = "document" className = "form-control" 
                              placeholder = "Document number"
                              value={this.state.documento}
                              onChange={this.ChangeDocumento}/>
                        </div>
                        <div className = "form-group">
                            <label for = "FechaNacimiento">  Fecha de Nacimiento  </label>
                            <input type="date"className = "form-control" name="FechaNacimiento"
                                   step="1" min="1920-01-01"
                                   onChange={this.ChangeFechaNacimiento}
                            />
                        </div>
                        <div className = "form-group">
                            <label for = "NumeroCelular">  Legajo  </label>
                            <input type = "tel" className = "form-control"   placeholder = "Mobile number"
                            value={this.state.legajo}
                            onChange={this.ChangeLegajo}/>
                        </div>
                        <div className = "form-group">
                            <label for = "NumeroCelular">  Celular  </label>
                            <input type = "tel" className = "form-control"   placeholder = "Mobile number"
                            value={this.state.celular}
                            onChange={this.ChangeCelular}/>
                        </div>
                        <div className = "form-group">
                            <label for = "exampleInputEmail1">  Dirección de correo electrónico  </label>
                            <input type = "email" className = "form-control" id = "exampleInputEmail1"
                                   aria-describe by = "emailHelp" placeholder = "Enter email"
                                   value={this.state.mail}
                                   onChange={this.ChangeMail}/>
                        </div>
                        <div className = "form-group">
                            <label for = "exampleInputPassword1">  Contraseña  </label>
                            <input type = "password" className = "form-control" id = "exampleInputPassword1"
                                   placeholder = "Password"
                                   value={this.state.pass}
                                   onChange={this.ChangePass}/>
                        </div>        
                        <div className = "form-group">
                            <label for = "exampleTextarea"> Descripcion  </ label >
                            <textarea className = "form-control" id = "exampleTextarea" rows = "3"
                            value={this.state.descripcion}
                            onChange={this.ChangeDescripcion}
                            > </textarea>

                        </div>
                        <div className="form-group izquierda">
                            <button className="btn btn-primary" onClick={this.registrar} >Registrar</button>
                            <Link to="/" type="button" className="btn btn-primary"
                        >Volver</Link> 
                        </div>

                </div>
            </div>
            </div>
            )
        

    }
}
export default  AltaEncargado;

// import React, { Component } from 'react';
// import "../Style/Alta.css";

// //      <small id = "emailHelp" class = "form-text text-muted"> Nunca compartiremos su correo electrónico con nadie más.  </small>


// class AltaEncargado extends Component{
//     render(){
//         return(
//             <div className="col-12 jumbotron">
//             <div>
//                 <div className="col-md-12 borde">
//             <form>
//                 <div className="row">
//                     <legend>  Registrar Alta </legend>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "Nombre">  Nombre  </label>
//                             <input type = "name" className = "form-control"   placeholder = "Name"/>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "Apellido">  Apellido  </label>
//                             <input type = "family-name" className = "form-control"   placeholder = "Surname"/>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "exampleSelect1"> Tipo Documento </label>
//                             <select className = "form-control" id = "exampleSelect1">
//                                 <option>  DNI  </option>
//                                 <option>  Libreta  </option>
//                             </select>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "NumeroDocumento">  Numero de Documento  </label>
//                             <input type = "document" className = "form-control"   placeholder = "Document number"/>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "FechaNacimiento">  Fecha de Nacimiento  </label>
//                             <input type="date"className = "form-control" name="FechaNacimiento" step="1" min="1920-01-01" />
//                         </div>
//                         <fieldset className = "col-md-6  flex-container form-group">
//                             <legend>  Disponibilidad  </legend>
//                                 <div className = "form-check">
//                                     <label className = "form-check-label">
//                                     <input type = "radio" className = "form-check-input" name = "optionsRadios" id = "optionsRadios1" value = "option1" /> 
//                                         Full Time
//                                     </label>
//                                 </div>
//                                 <div className = "col-md-6  flex-container form-check">
//                                     <label className = "form-check-label">
//                                         <input type = "radio" className = "form-check-input" name = "optionsRadios" id = "optionsRadios2" value = "option2"/> 
//                                             Parte Time
//                                     </label>
//                                 </div>
//                         </fieldset>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "NumeroCelular">  Celular  </label>
//                             <input type = "tel" className = "form-control"   placeholder = "Mobile number"/>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "NumeroTelefono">  Telefono Fijo  </label>
//                             <input type = "tel" className = "form-control"   placeholder = "Landline number"/>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "exampleInputEmail1">  Dirección de correo electrónico  </label>
//                             <input type = "email" className = "form-control" id = "exampleInputEmail1" aria-describe by = "emailHelp" placeholder = "Enter email"/>
//                         </div>
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "exampleInputPassword1">  Contraseña  </label>
//                             <input type = "password" className = "form-control" id = "exampleInputPassword1" placeholder = "Password"/>
//                         </div>        
//                         <div className = "col-md-6  flex-container form-group">
//                             <label for = "exampleTextarea"> Descripcion  </ label >
//                             <textarea className = "form-control" id = "exampleTextarea" rows = "3"> </textarea>
//                         </div>
//                     </div>
//             </form>
//             <div className="form-group izquierda">
//                             <button className="btn btn-primary">Registrar</button>                  
//                         </div>
                   
//             </div>
//             </div>
//         </div>
        
//         );
//     }
// }
// export default AltaEncargado;