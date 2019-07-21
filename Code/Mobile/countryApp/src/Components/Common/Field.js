import React from 'react';
import {TextInput, View, Text} from 'react-native';

const Field = ({label, value, onChangeText, placeholder, hidden}) => {
    const {inputStyle, labelStyle, containerStyle} = styles;

    return (
        <View style={containerStyle}>
            <Text style={labelStyle}>{label}</Text>
            <TextInput
                autoCorrect={false}
                placeholder={placeholder}
                style={inputStyle}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={hidden}
            />
        </View>
    )
};

const styles = {
    inputStyle: {
        color: '#000',
        paddingRight: 5,
        paddingLeft: 5,
        fontSize: 18,
        flex: 2
    },
    labelStyle: {
        fontSize: 18,
        color:'#000',
        paddingLeft: 20,
        flex: 1
    },
    containerStyle: {
        heigth: 40,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    }
}

export {Field};
