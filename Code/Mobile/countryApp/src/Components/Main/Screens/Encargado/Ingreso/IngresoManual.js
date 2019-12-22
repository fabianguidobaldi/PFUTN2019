import React, { Component } from 'react';
import { View, StyleSheet, TextInput, StatusBar, Alert } from 'react-native';
import { Database } from '../../../../DataBase/Firebase';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Content, Button, Text, Picker } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import { LocalStorage } from '../../../../DataBase/Storage';
import moment from 'moment';

const BLUE = '#428AF8';
const LIGHT_GRAY = '#D3D3D3';

class IngresoManual extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Ingreso Manual',
            headerLeft: <Icon style={{ paddingLeft: 10 }} onPress={() => navigation.goBack()} name="arrow-back" size={30} />
        };
    };

    state = { picker: '', tiposDocumento: [], documento: '', showSpinner: false, isFocused: false, usuario: {} };

    componentDidMount() {
        setInterval(() => {
            this.setState({
                showSpinner: false
            });
        }, 3000);

        LocalStorage.load({
            key: 'UsuarioLogueado'
        })
            .then(usuario => {
                this.setState({ usuario });
            })
            .catch(error => {
                switch (error.name) {
                    case 'NotFoundError':
                        console.log('La key solicitada no existe.');
                        break;
                    default:
                        console.warn('Error inesperado: ', error.message);
                }
            });
    }

    // TODO: extraer este metodo a un modulo aparte para evitar consultas repetitivas a la BD.
    obtenerPickers = () => {
        var dbRef = Database.collection('TipoDocumento');
        var dbDocs = dbRef.get().then(snapshot => {
            var tiposDocumento = [];
            snapshot.forEach(doc => {
                tiposDocumento.push({ id: doc.id, nombre: doc.data().Nombre });
            });
            this.setState({ tiposDocumento });
        });
    };

    //Graba el ingreso en Firestore
    grabarIngreso = (nombre, apellido, tipoDoc, numeroDoc) => {
        try {
            var refCountry = Database.collection('Country').doc(this.state.usuario.country);
            var refIngresos = refCountry.collection('Ingresos');
            refIngresos.add({
                Nombre: nombre,
                Apellido: apellido,
                Documento: numeroDoc,
                TipoDocumento: Database.doc('TipoDocumento/' + tipoDoc),
                Descripcion: '',
                Egreso: true,
                Estado: true,
                Fecha: new Date(),
                IdEncargado: Database.doc('Country/' + this.state.usuario.country + '/Encargados/' + this.state.usuario.datos)
            });

            return 0;
        } catch (error) {
            return error;
        }
    };

    //Devuelve la primer invitación válida a partir de un conjunto de invitaciones
    obtenerInvitacionValida = invitaciones => {
        var now = moment().unix(); //Se obtiene la fecha actual en formato Timestamp para facilitar la comparación

        for (var i = 0; i < invitaciones.length; i++) {
            var docInvitacion = invitaciones[i].data();
            if (now >= docInvitacion.FechaDesde.seconds && now <= docInvitacion.FechaHasta.seconds) {
                docInvitacion.id = invitaciones[i].id;
                return docInvitacion;
            }
        }

        return -1;
    };

    //Verifica si el visitante está autenticado o no
    estaAutenticado = invitacion => {
        return invitacion.Nombre != '' && invitacion.Apellido != '';
    };

    //Redirige al formulario para autenticar el visitante
    autenticarVisitante = (tipoDocumento, numeroDocumento, usuario, invitacion) => {
        this.props.navigation.navigate('RegistroVisitante', {
            esAcceso: true,
            tipoAcceso: 'Ingreso',
            tipoDocumento: tipoDocumento,
            numeroDocumento: numeroDocumento,
            usuario: usuario,
            invitacion: invitacion
        });
    };

    //Registra el ingreso según tipo y número de documento
    registrarIngreso = (tipoDoc, numeroDoc) => {
        //Busca si es un propietario
        var refCountry = Database.collection('Country').doc(this.state.usuario.country);
        var refPropietarios = refCountry.collection('Propietarios');
        this.setState({ showSpinner: true });
        refPropietarios
            .where('Documento', '==', numeroDoc)
            .where('TipoDocumento', '==', Database.doc('TipoDocumento/' + tipoDoc))
            .get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    //Si existe el propietario, registra el ingreso.
                    var docPropietario = snapshot.docs[0].data();

                    var result = this.grabarIngreso(docPropietario.Nombre, docPropietario.Apellido, tipoDoc, numeroDoc);
                    if (result == 0) {
                        this.setState({ showSpinner: false });
                        Alert.alert('Atención', 'El ingreso se registró correctamente. (PROPIETARIO)');
                        this.props.navigation.navigate('Ingreso');
                    } else {
                        this.setState({ showSpinner: false });
                        Alert.alert('Atención', 'Ocurrió un error: ' + result);
                    }
                } else {
                    //Si no existe el propietario, busca si tiene invitaciones.
                    var refInvitados = refCountry.collection('Invitados');

                    refInvitados
                        .where('Documento', '==', numeroDoc)
                        .where('TipoDocumento', '==', Database.doc('TipoDocumento/' + tipoDoc))
                        .get()
                        .then(snapshot => {
                            if (!snapshot.empty) {
                                //Si tiene invitaciones, verifica que haya alguna invitación válida.

                                var invitacion = this.obtenerInvitacionValida(snapshot.docs);
                                if (invitacion != -1) {
                                    //Si hay una invitación válida, verifica que esté autenticado.

                                    if (this.estaAutenticado(invitacion)) {
                                        //Si está autenticado, registra el ingreso.
                                        var result = this.grabarIngreso(invitacion.Nombre, invitacion.Apellido, tipoDoc, numeroDoc);
                                        if (result == 0) {
                                            this.setState({ showSpinner: false });
                                            Alert.alert(
                                                'Atención',
                                                'El ingreso se registró correctamente. (VISITANTE AUTENTICADO CON INVITACIÓN VÁLIDA)'
                                            );
                                            this.props.navigation.navigate('Ingreso');
                                        } else {
                                            this.setState({ showSpinner: false });
                                            Alert.alert('Atención', 'Ocurrió un error: ' + result);
                                        }
                                    } else {
                                        //Si no está autenticado, se debe autenticar.
                                        console.log('El visitante no está autenticado, se debe autenticar primero.');
                                        console.log(invitacion);
                                        this.autenticarVisitante(tipoDoc, numeroDoc, this.state.usuario, invitacion.id);
                                        this.setState({ showSpinner: false });
                                    }
                                } else {
                                    // Existe pero no tiene invitaciones válidas, TODO:se debe generar una nueva invitación por ese día.
                                    console.log('No hay ninguna invitación válida.');
                                    this.setState({ showSpinner: false });
                                    Alert.alert('Atención', 'No se encontró ninguna invitación válida.');
                                }
                            } else {
                                //La persona no existe , TODO:se debe generar una nueva invitación por ese día.
                                console.log('No tiene invitaciones.');
                                this.setState({ showSpinner: false });
                                Alert.alert('Atención', 'La persona no existe.');
                            }
                        });
                }
            })
            .catch(error => {
                Alert.alert('Atención', 'Ocurrió un error: ', error);
                this.setState({ showSpinner: false });
            });
    };

    handleFocus = event => {
        this.setState({ isFocused: true });
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    };
    handleBlur = event => {
        this.setState({ isFocused: false });
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };

    render() {
        const { isFocused } = this.state;

        if (this.state.tiposDocumento.length < 3) {
            this.obtenerPickers();
        }

        return (
            <ScrollView>
                <Content>
                    <View style={styles.container}>
                        <Spinner visible={this.state.showSpinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />
                        <StatusBar backgroundColor="#1e90ff"></StatusBar>
                        <Text style={styles.header}>Registrar nuevo ingreso</Text>

                        <Picker
                            note
                            mode="dropdown"
                            style={styles.picker}
                            selectedValue={this.state.picker}
                            onValueChange={(itemValue, itemIndex) => this.setState({ picker: itemValue })}>
                            <Picker.Item label="Tipo de documento" value="-1" color="#7B7C7E" />
                            {this.state.tiposDocumento.map((item, index) => {
                                return <Picker.Item label={item.nombre} value={item.id} key={index} />;
                            })}
                        </Picker>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Número de documento"
                            onChangeText={documento => this.setState({ documento })}
                            underlineColorAndroid={isFocused ? BLUE : LIGHT_GRAY}
                            onFocus={this.handleFocus}
                            onBlur={this.handleBlur}
                            keyboardType={'numeric'}
                        />

                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.buttons}>
                                <Button
                                    bordered
                                    success
                                    style={{ paddingHorizontal: '5%' }}
                                    onPress={() => {
                                        this.registrarIngreso(this.state.picker, this.state.documento);
                                    }}>
                                    <Text>Aceptar</Text>
                                </Button>
                            </View>
                            <View style={styles.buttons}>
                                <Button
                                    bordered
                                    danger
                                    style={{ paddingHorizontal: '5%' }}
                                    onPress={() => {
                                        this.props.navigation.goBack();
                                    }}>
                                    <Text>Cancelar</Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                </Content>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: '3%',
        marginVertical: '5%',
        flex: 1
    },
    spinnerTextStyle: {
        fontSize: 20,
        fontWeight: 'normal',
        color: '#FFF'
    },
    header: {
        textAlign: 'center',
        fontSize: 26,
        marginHorizontal: '5%',
        marginTop: '13%',
        color: '#08477A',
        fontWeight: 'normal',
        fontStyle: 'normal'
    },
    picker: {
        width: '85%',
        fontSize: 18,
        marginTop: '15%',
        alignItems: 'flex-start'
    },
    textInput: {
        width: '80%',
        fontSize: 16,
        alignItems: 'flex-start',
        marginTop: '13%'
    },
    buttons: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
        marginTop: '13%'
    }
});

export default IngresoManual;