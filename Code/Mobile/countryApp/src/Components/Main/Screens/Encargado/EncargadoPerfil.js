import React, { Component } from 'react';
import { LocalStorage } from '../../../DataBase/Storage';
import { View, StyleSheet, TextInput, StatusBar } from 'react-native';
import { Database } from '../../../DataBase/Firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { Content, Button, Text, Picker, Root, Toast } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { NavigationActions } from 'react-navigation';
import moment from 'moment';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

const LIGHT_GRAY = '#D3D3D3';

let datosEncargado = {};

const navigateAction = NavigationActions.navigate({
    routeName: 'Registros',
    action: NavigationActions.navigate({ routeName: 'Registros' }),
});

class MiPerfil extends Component {
    static navigationOptions = {
        title: 'Actualizar Datos',
        headerRight: <View />,
    };

    componentWillMount() {
        this.setState({ showSpinner: true });

        setInterval(() => {
            this.setState({
                showSpinner: false,
            });
        }, 3000);

        LocalStorage.load({
            key: 'UsuarioLogueado',
        })
            .then((usuario) => {
                this.setState({ usuario, tiposDocumento: global.tiposDocumento });
                this.obtenerDatosPersonales();
            })
            .catch((error) => {
                this.setState({ showSpinner: false });
                Toast.show({
                    text: 'La key solicitada no existe.',
                    buttonText: 'Aceptar',
                    duration: 3000,
                    position: 'bottom',
                    type: 'danger',
                });
            });
    }

    state = {
        tiposDocumento: [],
        tipoAcceso: '',
        nombre: '',
        apellido: '',
        picker: '',
        documento: '',
        fechaNacimiento: moment(new Date()),
        celular: '',
        isFocused: false,
        showSpinner: false,
        isVisible: false,
        usuario: {},
        nombreError: '',
        apellidoError: '',
        celularError: '',
    };

    obtenerDatosPersonales = () => {
        var refCountry = Database.collection('Country').doc(this.state.usuario.country);
        var refEncargados = refCountry.collection('Encargados');
        try {
            refEncargados.doc(this.state.usuario.datos).onSnapshot((doc) => {
                if (doc.exists) {
                    var encargado = doc.data();
                    this.setState({
                        nombre: encargado.Nombre,
                        apellido: encargado.Apellido,
                        documento: encargado.Documento,
                        picker: encargado.TipoDocumento.id,
                        celular: encargado.Celular,
                        fechaNacimiento: moment.unix(encargado.FechaNacimiento.seconds),
                    });
                    datosEncargado = encargado;
                    this.setState({ showSpinner: false });
                }
            });
        } catch (error) {
            Toast.show({
                text: 'Lo siento, ocurrió un error inesperado.',
                buttonText: 'Aceptar',
                duration: 3000,
                position: 'bottom',
                type: 'danger',
            });
        }
    };

    actualizarDatos = async () => {
        var refCountry = Database.collection('Country').doc(this.state.usuario.country);
        var refEncargado = refCountry.collection('Encargados').doc(this.state.usuario.datos);
        try {
            await refEncargado.set(
                {
                    Nombre: this.state.nombre,
                    Apellido: this.state.apellido,
                    Celular: this.state.celular,
                    FechaNacimiento: this.state.fechaNacimiento.toDate(),
                },
                { merge: true }
            );
            return 0;
        } catch (error) {
            return 1;
        } finally {
            this.setState({ showSpinner: false });
        }
    };

    cancelarCambios = () => {
        this.setState({
            nombre: datosEncargado.Nombre,
            apellido: datosEncargado.Apellido,
            documento: datosEncargado.Documento,
            picker: datosEncargado.TipoDocumento.id,
            celular: datosEncargado.Celular,
            fechaNacimiento: moment.unix(datosEncargado.FechaNacimiento.seconds),
        });
    };

    onBlur() {
        this.setState({ isFocused: false });
    }

    onFocus() {
        this.setState({ isFocused: true });
    }

    handlePicker = (datetime) => {
        this.setState({
            isVisible: false,
            fechaNacimiento: moment(datetime),
        });
    };

    hidePicker = () => {
        this.setState({ isVisible: false });
    };

    showPicker = () => {
        this.setState({ isVisible: true });
    };

    onToastClosed = (reason) => {
        this.props.navigation.dispatch(navigateAction);
    };

    verificarFechaNacimiento = async () => {
        const today = moment();
        const birthDate = this.state.fechaNacimiento;
        if (birthDate.isBefore(today)) {
            return 0;
        } else {
            this.setState({ showSpinner: false });
            return 1;
        }
    };

    verificarTextInputs = async (inputArray) => {
        let someEmpty = false;
        inputArray.forEach((text) => {
            const inputError = text + 'Error';
            if (this.state[text] == '') {
                someEmpty = true;
                this.setState({ [inputError]: '*Campo requerido', showSpinner: false });
            } else {
                this.setState({ [inputError]: '' });
            }
        });
        return someEmpty;
    };

    render() {
        return (
            <Root>
                <ScrollView>
                    <Content>
                        <View style={styles.container}>
                            <Spinner visible={this.state.showSpinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />
                            <StatusBar backgroundColor="#1e90ff"></StatusBar>

                            <TextInput
                                style={styles.textInput}
                                placeholder="Nombre"
                                value={this.state.nombre}
                                onChangeText={(nombre) => this.setState({ nombre })}
                                underlineColorAndroid={LIGHT_GRAY}
                                onFocus={() => this.onFocus()}
                                onBlur={() => this.onBlur()}
                                keyboardType={'default'}
                                maxLength={25}
                            />
                            <Text style={styles.error}>{this.state.nombreError}</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Apellido"
                                value={this.state.apellido}
                                onChangeText={(apellido) => this.setState({ apellido })}
                                underlineColorAndroid={LIGHT_GRAY}
                                onFocus={() => this.onFocus()}
                                onBlur={() => this.onBlur()}
                                keyboardType={'default'}
                                maxLength={25}
                            />
                            <Text style={styles.error}>{this.state.apellidoError}</Text>
                            <Picker
                                note
                                mode="dropdown"
                                style={styles.picker}
                                selectedValue={this.state.picker}
                                enabled={false}
                                onValueChange={(itemValue, itemIndex) => this.setState({ picker: itemValue })}>
                                {this.state.tiposDocumento.map((item, index) => {
                                    return <Picker.Item label={item.nombre} value={item.id} key={index} />;
                                })}
                            </Picker>

                            <TextInput
                                style={styles.textInput}
                                placeholder="Documento"
                                onChangeText={(documento) => this.setState({ documento })}
                                underlineColorAndroid={LIGHT_GRAY}
                                onFocus={() => this.onFocus()}
                                onBlur={() => this.onBlur()}
                                keyboardType={'numeric'}
                                value={this.state.documento}
                                editable={false}
                            />

                            <View style={styles.datetime}>
                                <Text style={{ color: '#8F8787' }}>Fecha de nacimiento</Text>
                                <Text style={{ color: '#1e90ff', fontSize: 15 }}>{this.state.fechaNacimiento.format('DD/MM/YYYY')}</Text>
                                <IconFontAwesome
                                    onPress={() => {
                                        this.showPicker();
                                    }}
                                    name="calendar"
                                    size={25}
                                />
                            </View>

                            <DateTimePicker
                                isVisible={this.state.isVisible}
                                onConfirm={this.handlePicker}
                                onCancel={this.hidePicker}
                                mode={'date'}
                                date={new Date(this.state.fechaNacimiento)}
                                is24Hour={true}></DateTimePicker>

                            <TextInput
                                style={styles.textInput}
                                placeholder="Celular"
                                onChangeText={(celular) => this.setState({ celular })}
                                underlineColorAndroid={LIGHT_GRAY}
                                onFocus={() => this.onFocus()}
                                onBlur={() => this.onBlur()}
                                keyboardType={'numeric'}
                                value={this.state.celular}
                                maxLength={10}
                            />

                            <Text style={styles.error}>{this.state.celularError}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={styles.buttons}>
                                    <Button
                                        bordered
                                        success
                                        disabled={this.state.showSpinner}
                                        style={{ paddingHorizontal: '5%' }}
                                        onPress={async () => {
                                            this.setState({ showSpinner: true }, async () => {
                                                const textInputs = await this.verificarTextInputs(['nombre', 'apellido', 'celular']);
                                                if (textInputs == true) {
                                                    return false;
                                                }
                                                const verificacion = await this.verificarFechaNacimiento();
                                                if (verificacion == 1) {
                                                    Toast.show({
                                                        text: 'La fecha de nacimiento debe ser anterior al día actual.',
                                                        buttonText: 'Aceptar',
                                                        duration: 3000,
                                                        position: 'bottom',
                                                        type: 'warning',
                                                    });
                                                } else if (verificacion == 0) {
                                                    const result = await this.actualizarDatos();
                                                    if (result == 0) {
                                                        Toast.show({
                                                            text: 'Datos personales actualizados.',
                                                            buttonText: 'Aceptar',
                                                            duration: 3000,
                                                            position: 'bottom',
                                                            type: 'success',
                                                            onClose: this.onToastClosed.bind(this),
                                                        });
                                                    } else if (result == 1) {
                                                        Toast.show({
                                                            text: 'Lo siento, ocurrió un error inesperado.',
                                                            buttonText: 'Aceptar',
                                                            duration: 3000,
                                                            position: 'bottom',
                                                            type: 'danger',
                                                            onClose: this.onToastClosed.bind(this),
                                                        });
                                                    }
                                                }
                                            });
                                        }}>
                                        <Text>Aceptar</Text>
                                    </Button>
                                </View>
                                <View style={styles.buttons}>
                                    <Button
                                        bordered
                                        danger
                                        disabled={this.state.showSpinner}
                                        style={{ paddingHorizontal: '5%' }}
                                        onPress={() => {
                                            this.cancelarCambios();
                                            this.props.navigation.dispatch(navigateAction);
                                        }}>
                                        <Text>Cancelar</Text>
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </Content>
                </ScrollView>
            </Root>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: '2%',
        marginVertical: '5%',
        flexDirection: 'column',
        flex: 1,
    },
    spinnerTextStyle: {
        fontSize: 20,
        fontWeight: 'normal',
        color: '#FFF',
    },
    picker: {
        width: '85%',
        fontSize: 18,
        marginTop: '3%',
        marginBottom: '3%',
        alignItems: 'flex-start',
    },
    textInput: {
        width: '82%',
        fontSize: 16,
        alignItems: 'flex-start',
        marginTop: '3%',
    },
    buttons: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
        marginTop: '5%',
    },
    datetime: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '13%',
        marginBottom: '3%',
        width: '80%',
    },
    error: {
        color: 'red',
        alignSelf: 'flex-start',
        fontSize: 12,
        marginLeft: '10%',
    },
});

export default MiPerfil;
