
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
            curTime: dateNow.toLocaleTimeString(),
            curDate: dateNow.toLocaleDateString()
        }

    }

    componentDidMount() {
        setInterval(() => {
            let dateNow = new Date();
            this.setState({
                curTime: dateNow.toLocaleTimeString(),
                curDate: this.formatDate(dateNow)
            })
        }, 1000)
    }

    formatDate(date) {
        // var hour = date.getHours();
        // var minutes = date.getMinutes();
        var day = date.getDate();
        var monthIndex = date.getMonth() + 1;
        var year = date.getFullYear();
        return day + "/" + monthIndex + "/" + year;
    }

    render() {
        const { dataItem } = this.props;
        const { curTime, curDate } = this.state;
        return (
            <View style={styles.dateCon}>
                <View style={styles.dateEx}><Text style={styles.dateText}>{curDate}</Text></View>
                <View style={styles.dateEx}><Text style={styles.dateText}>{curTime}</Text></View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    dateCon: {
        width: 140,
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateEx: {
        width: '100%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateText: {
        color: '#ccc',
        fontSize: 20
    }
});