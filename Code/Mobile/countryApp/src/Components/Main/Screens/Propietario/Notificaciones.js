import React, { Component } from 'react';
import { FlatList, StyleSheet, View, Alert} from 'react-native';
import { ListItem, Left, Body, Text, Thumbnail, Root, Toast, Right } from 'native-base';
import Swipeout from 'react-native-swipeout';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LocalStorage } from '../../../DataBase/Storage';
import { Database } from '../../../DataBase/Firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';

//FLATLIST DE PRUEBA : REEMPLAZAR LUEGO LOS FLATLISTDATA POR THIS.STATE.FLATLISTDATA !!

const reservaItem = {
        idReservaServicio: "Country/nkB2OpDMe6znzVkQRCRf/Servicios/i9KeauCpNWGt1SJCywOW/Reservas/MeLvCqo2YNFHjFXg4dmB",
        key: "j2xl9mgK1TlKHIvPXRlN",
        nombre: "Entrenamiento",
        servicio: "Polo",
        fechaDesde: moment(),
        fechaHasta: moment()
    }

class FlatListItem extends Component {
    state = { showSpinner: false };

    componentWillMount() {
        this.setState({ usuario: this.props.usuario });
    }

    render() {
        const swipeOutSettings = {
            style: { backgroundColor: '#fff' },
            rowId: this.props.index,
            sectionId: 1,
        };
        
        if (this.props.item.tipo == 'Evento') {
            return (
                <Swipeout {...swipeOutSettings}>
                    <ListItem
                    avatar
                    onPress={() => {
                        Alert.alert(
                            'Atención',
                            '¿ Desea acceder a esta reserva ? ',
                            [
                                { text: 'Cancelar', onPress: () => console.log('Cancel pressed'), style: 'cancel' },
                                {
                                    text: 'Aceptar',
                                    onPress: () => {
                                        this.props.navigation.navigate('InformacionReserva', {
                                            usuario: this.state.usuario,
                                            reserva: reservaItem,
                                        });
                                    },
                                },
                            ],
                            { cancelable: true }
                        );
                    }}>
                        <Left>
                            <Thumbnail source={require('../../../../assets/Images/notificaciones.png')} />
                        </Left>
                        <Body style={{ alignSelf: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight:'bold' }}> {this.props.item.tipo} </Text>
                                <Text style={{ fontSize: 12 }}> {this.props.item.texto} </Text>
                        </Body>
                        <Right style={{ alignSelf: 'center', marginTop: '3.3%' }}>
                                <Text style={{ fontSize: 11, color: 'gray', alignSelf: 'center' ,justifyContent:'center'}}> {this.props.item.time} </Text>
                                <Text></Text>
                        </Right>
                    </ListItem>
                </Swipeout>
            );
        } else {
            return (
                <Swipeout {...swipeOutSettings}>
                    <ListItem
                        avatar>
                        <Left>
                            <Thumbnail source={require('../../../../assets/Images/notificaciones.png')} />
                        </Left>
                        <Body style={{ alignSelf: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight:'bold' }}> {this.props.item.tipo} </Text>
                                <Text style={{ fontSize: 12 }}> {this.props.item.texto} </Text>
                        </Body>
                        <Right style={{ alignSelf: 'center' , marginTop: '5%'}}>
                                <Text style={{ fontSize: 11, color: 'gray', alignSelf: 'center', justifyContent:'center' }}> {this.props.item.time} </Text>
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
            title: 'Notificaciones',
            headerLeft: <Icon style={{ paddingLeft: 10 }} onPress={() => navigation.goBack()} name="arrow-back" size={30} />,
        };
    };

    constructor(props) {
        super(props);
        state = { flatListData: [] };
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
                this.setData()

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

    //REEMPLAZAR POR LA FUNCIÓN QUE OBTIENE LAS NOTIFICACIONES.
    setData = () => {
        this.setState({
            flatListData : [
                {
                    key: 'hwkd9729',
                    tipo: 'Ingreso',
                    texto: 'Alexis Pagura ha ingresado. ',
                    time: '28/05/20 9:35'
                },
                {
                    key: 'aosr8208',
                    tipo: 'Egreso',
                    texto: 'Ezequiel Braicovich ha egresado.',
                    time: '29/05/20 10:00'
                },
                {
                    key: 'sneo9248',
                    tipo: 'Evento',
                    texto: "Luis Quiroga se ha inscripto para el evento 'Futbol 5'",
                    time: '29/05/20 19:00'
                }
            ]
        })
        this.setState({
            showSpinner: false,
        });
    }
    render() {
        if (this.state.flatListData && this.state.flatListData.length == 0) {
            return (
                <Root>
                    <View>
                        <Text style={styles.textDefault}> No hay notificaciones para mostrar. </Text>
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