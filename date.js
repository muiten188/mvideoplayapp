
import React, { PureComponent, Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
export default class MyDate extends Component {

    constructor(props) {
        super(props)
        let dateNow = new Date();
        this.state = {
            curTime: this.formatDate(dateNow)
        }

    }

    componentDidMount() {
        setInterval(() => {
            let dateNow = new Date();
            this.setState({
                curTime: this.formatDate(dateNow)
            })
        }, 1000)
    }

    formatDate(date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var second = date.getSeconds();
        // var day = date.getDate();
        // var monthIndex = date.getMonth() + 1;
        // var year = date.getFullYear();
        if (second % 2 == 0) {
            return (hour + " ") + ((minutes < 10) ? ("0" + minutes) : minutes);
        }
        else {
            return (hour + ":") + ((minutes < 10) ? ("0" + minutes) : minutes);
        }

    }

    render() {
        const { dataItem, style } = this.props;
        const { curTime } = this.state;
        return (
            <Text style={[styles.dateText, style]}>{curTime}</Text>
        )
    }
}
const styles = StyleSheet.create({
    dateCon: {
        minWidth: 60,
        height: 40,
    },
    dateEx: {
        flex: 1
    },
    dateText: {
        color: '#ccc',
        fontSize: 35
    }
});