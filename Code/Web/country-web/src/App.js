import React, { Component } from 'react';
import Login from "./componente/login/Login";
import Encabezado from "./componente/Encabezado/Encabezado";
import "./estilo.css";
import logo1 from "./logo1.jpg";
import firebase from 'firebase'; 
import 'firebase/database'
import { DB_CONFIG } from './config/config';
import Inicio from "./componente/Alta/Inicio";
import Router from './componente/router';

// para probar encabezado poner <Encabezado></Encabezado>
// <h1 className="display-3 text-center">Come in </h1>
// <Login ></Login>
class App extends Component{

  render(){
    return(
      <div className="app container-fluid ">        
        <Encabezado></Encabezado>
<<<<<<< HEAD
        <Router></Router>
=======
          <div className="text-center">     
          <img src={logo1} width="300" height="129"></img>
          </div>  
          <hr className="my-4"></hr>
        </div>
        <Inicio></Inicio>
        
        
>>>>>>> f036dc0810b7fc58085e64f83da8f47164bc0ee9
      </div>


    );
  }
}

export default App;