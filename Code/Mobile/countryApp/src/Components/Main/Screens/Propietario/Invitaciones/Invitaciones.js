import React, { Component } from 'react';
import { FlatList, Alert, StyleSheet, View } from 'react-native';
import { ListItem, Left, Body, Text, Right, Thumbnail, Root, Toast } from 'native-base';
import Swipeout from 'react-native-swipeout';
import { LocalStorage } from '../../../../DataBase/Storage';
import { Database } from '../../../../DataBase/Firebase';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';

class FlatListItem extends Component {
    state = { activeRowKey: null, showSpinner: false };

    componentWillMount() {
        this.setState({ usuario: this.props.usuario });
    }

    eliminarInvitacion = async (invitacion) => {
        var refCountry = Database.collection('Country').doc(this.state.usuario.country);
        var refInvitados = refCountry.collection('Invitados');
        try {
            await refInvitados.doc(invitacion).set(
                {
                    Estado: false,
                },
                { merge: true }
            );
            return 0;
        } catch (error) {
            return 1;
        }
    };

    render() {
        const swipeOutSettings = {
            autoClose: true,
            style: { backgroundColor: '#fff' },
            onClose: (secId, rowId, direction) => {
                if (this.state.activeRowKey != null) {
                    this.setState({ activeRowKey: null });
                }
            },
            onOpen: (secId, rowId, direction) => {
                this.setState({ activeRowKey: this.props.item.key });
            },
            right: [
                {
                    text: 'Eliminar',
                    type: 'delete',
                    onPress: () => {
                        Alert.alert(
                            'Atención',
                            '¿ Está seguro que desea eliminar la invitación ?',
                            [
                                { text: 'Cancelar', onPress: () => console.log('Cancel pressed'), style: 'cancel' },
                                {
                                    text: 'Aceptar',
                                    onPress: async () => {
                                        const result = await this.eliminarInvitacion(this.props.item.key);
                                        if (result == 0) {
                                            Toast.show({
                                                text: 'Invitado eliminado exitosamente.',
                                                buttonText: 'Aceptar',
                                                duration: 3000,
                                                position: 'bottom',
                                                type: 'success',
                                            });
                                        } else if (result == 1) {
                                            Toast.show({
                                                text: 'Lo siento, ocurrió un error inesperado.',
                                                buttonText: 'Aceptar',
                                                duration: 3000,
                                                position: 'bottom',
                                                type: 'danger',
                                            });
                                        }
                                    },
                                },
                            ],
                            { cancelable: true }
                        );
                    },
                },
            ],
            rowId: this.props.index,
            sectionId: 1,
        };
        if (this.props.item.nombre == '' && this.props.item.apellido == '') {
            return (
                <Swipeout {...swipeOutSettings}>
                    <ListItem
                        avatar
                        onPress={() => {
                            Alert.alert(
                                'Atención',
                                '¿ Desea modificar esta invitación ? ',
                                [
                                    { text: 'Cancelar', onPress: () => console.log('Cancel pressed'), style: 'cancel' },
                                    {
                                        text: 'Aceptar',
                                        onPress: () => {
                                            this.props.navigation.navigate('ModificarInvitado', {
                                                usuario: this.state.usuario,
                                                invitacion: this.props.item,
                                                autenticado: false,
                                            });
                                        },
                                    },
                                ],
                                { cancelable: true }
                            );
                        }}>
                        <Left>
                            <Thumbnail source={require('../../../../../assets/Images/invitado.jpg')} />
                        </Left>
                        <Body style={{ alignSelf: 'center', marginTop: '2.7%' }}>
                            <Text style={{ fontSize: 14 }}> {this.props.item.documento} </Text>
                        </Body>
                        <Right style={{ alignSelf: 'center' }}>
                            <Text style={{ fontSize: 11, color: 'gray' }}> {this.props.item.fechaDesde} </Text>
                            <Text style={{ fontSize: 11, color: 'gray' }}> {this.props.item.fechaHasta} </Text>
                        </Right>
                    </ListItem>
                </Swipeout>
            );
        } else {
            return (
                <Swipeout {...swipeOutSettings}>
                    <ListItem
                        avatar
                        onPress={() => {
                            Alert.alert(
                                'Atención',
                                '¿ Desea modificar esta invitación ? ',
                                [
                                    { text: 'Cancelar', onPress: () => console.log('Cancel pressed'), style: 'cancel' },
                                    {
                                        text: 'Aceptar',
                                        onPress: () => {
                                            this.props.navigation.navigate('ModificarInvitado', {
                                                usuario: this.state.usuario,
                                                invitacion: this.props.item,
                                                autenticado: true,
                                            });
                                        },
                                    },
                                ],
                                { cancelable: true }
                            );
                        }}>
                        <Left>
                            <Thumbnail source={require('../../../../../assets/Images/invitado.jpg')} />
                        </Left>
                        <Body style={{ alignSelf: 'center' }}>
                            <Text style={{ fontSize: 14 }}> {this.props.item.nombre + ' ' + this.props.item.apellido} </Text>
                            <Text style={{ fontSize: 14 }}> {this.props.item.documento} </Text>
                        </Body>
                        <Right style={{ alignSelf: 'center', marginTop: '2.4%' }}>
                            <Text style={{ fontSize: 11, color: 'gray' }}> {this.props.item.fechaDesde} </Text>
                            <Text style={{ fontSize: 11, color: 'gray' }}> {this.props.item.fechaHasta} </Text>
                        </Right>
                    </ListItem>
                </Swipeout>
            );
        }
    }
}

export default class BasicFlatList extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Invitaciones',
        };
    };

    constructor(props) {
        super(props);
        state = { deletedRowKey: null, flatListData: [] };
    }

    componentDidMount() {
        setInterval(() => {
            this.setState({
                showSpinner: false,
            });
        }, 3000);
    }

    componentWillMount() {
        this.setState({ showSpinner: true });
        LocalStorage.load({
            key: 'UsuarioLogueado',
        })
            .then((response) => {
                this.setState({ usuario: response });
                this.obtenerInvitaciones();
                this.createListeners();
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

    componentWillUnmount() {
        this._unsubscribeSnapshot.remove();
        this._subscribeSnapshot.remove();
    }

    createListeners() {
        this._subscribeSnapshot = this.props.navigation.addListener('didFocus', () => {
            this.obtenerInvitaciones();
        });

        this._unsubscribeSnapshot = this.props.navigation.addListener('didBlur', () => {
            this.snapshotInvitados();
        });
    }

    obtenerInvitaciones = () => {
        var refCountry = Database.collection('Country').doc(this.state.usuario.country);
        var refInvitados = refCountry.collection('Invitados');
        try {
            this.snapshotInvitados = refInvitados
            .where(
                'IdPropietario',
                '==',
                Database.doc('Country/' + this.state.usuario.country + '/Propietarios/' + this.state.usuario.datos)
            )
            .where('Estado', '==', true)
            .onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    //El propietario tiene invitaciones
                    var tempArray = [];
                    for (var i = 0; i < snapshot.docs.length; i++) {
                        var invitado = {
                            key: snapshot.docs[i].id,
                            nombre: snapshot.docs[i].data().Nombre,
                            apellido: snapshot.docs[i].data().Apellido,
                            documento: snapshot.docs[i].data().Documento,
                            tipoDocumento: snapshot.docs[i].data().TipoDocumento.id,
                            fechaDesde: moment.unix(snapshot.docs[i].data().FechaDesde.seconds).format('D/M/YYYY HH:mm'),
                            fechaHasta: moment.unix(snapshot.docs[i].data().FechaHasta.seconds).format('D/M/YYYY HH:mm'),
                        };
                        tempArray.push(invitado);
                    }
                    this.setState({ showSpinner: false, flatListData: tempArray });
                } else {
                    this.setState({ showSpinner: false, flatListData: [] });
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

    refreshFlatList = (deletedKey) => {
        this.setState((prevState) => {
            return {
                deletedRowKey: deletedKey,
            };
        });
    };

    render() {
        if (this.state.flatListData && this.state.flatListData.length == 0) {
            return (
                <Root>
                    <View>
                        <Text style={styles.textDefault}> No hay invitaciones para mostrar. </Text>
                    </View>
                </Root>
            );
        } else {
            return (
                <Root>
                    <View>
                        <Spinner visible={this.state.showSpinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />
                        <FlatList
                            data={this.state.flatListData}
                            renderItem={({ item, index }) => {
                                return (
                                    <FlatListItem
                                        navigation={this.props.navigation}
                                        usuario={this.state.usuario}
                                        item={item}
                                        index={index}
                                        parentFlatList={this}></FlatListItem>
                                );
                            }}></FlatList>
                    </View>
                </Root>
            );
        }
    }
}

const styles = StyleSheet.create({
    spinnerTextStyle: {
        fontSize: 20,
        fontWeight: 'normal',
        color: '#FFF',
    },
    textDefault: {
        marginTop: '65%',
        textAlign: 'center',
        fontSize: 14,
        color: '#8F8787',
        fontWeight: 'normal',
        fontStyle: 'normal',
    },
});
