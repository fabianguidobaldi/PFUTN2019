import React, { Component } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Field, Header, Card, CardSection, Button } from '../../Common';
import { Firebase, Database } from '../../Firebase';

class Login extends Component {
    state = { email: '', password: '', result: '', showSpinner: false };

    static navigationOptions = {
        header: null
    };

    onButtonPress() {
        Firebase.auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                this.setState({ showSpinner: true });
                this.setState({ result: 'Logueo exitoso.' });
                this.logueoUsuario();
            })
            .catch(() => {
                this.setState({ result: 'Falló la autenticación.' });
            });
    }

    logueoUsuario = () => {
        var dbRef = Database.collection('Usuarios');
        var dbDoc = dbRef
            .doc(this.state.email)
            .get()
            .then(doc => {
                if (doc.exists) {
                    this.setState({ result2: doc.data().TipoUsuario.id });
                    switch (doc.data().TipoUsuario.id) {
                        case 'Propietario':
                            this.props.navigation.navigate('Propietario');
                            break;
                        case 'Guardia':
                            this.props.navigation.navigate('Encargado');
                            break;
                    }
                } else {
                    this.setState({ result2: 'Else' });
                }
            })
            .catch(err => {});
    };
    render() {
        if (this.state.showSpinner) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#007aff" />
                    <Text
                        style={{
                            color: '#000',
                            textAlign: 'center',
                            fontSize: 18
                        }}>
                        Loading ...
                    </Text>
                </View>
            );
        } else {
            return (
                <View>
                    <Header headerText="Welcome to CountryApp!" />
                    <Card>
                        <CardSection>
                            <Field
                                placeholder="ejemplo@mail.com"
                                label="Email"
                                value={this.state.email}
                                onChangeText={email => this.setState({ email })}
                                hidden={false}
                            />
                        </CardSection>
                        <CardSection>
                            <Field
                                placeholder="password"
                                label="Password"
                                value={this.state.password}
                                onChangeText={password => this.setState({ password })}
                                hidden={true}
                            />
                        </CardSection>
                        <CardSection>
                            <Button onPress={this.onButtonPress.bind(this)}>Log in</Button>
                        </CardSection>
                        <CardSection>
                            <Text>{this.state.result}</Text>
                        </CardSection>
                    </Card>
                </View>
            );
        }
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column'
    }
});
export default Login;