import React, { Component } from "react";
import { Text, TouchableOpacity, View, AsyncStorage, TextInput } from "react-native";
import {
    Button,
    Item,
    Footer,
    Left,
    Right,
    Content,
    H1,
    H3,
    Label,
    Picker,
    Input
} from "native-base";
import styles from "./styles";
import Modal from "react-native-modal";
import * as Helper from './helper';
export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lcd: null,
            arrLCD: [],
            loadding: false,
            deviceName: "ANDROID_BOX Mix5",
            imei: Helper.getSerialNumber(),
            server: '10.168.85.20:8080',
            mqttServer: '113.171.23.202:1883'
        }
    }

    componentDidMount() {
        this.getAppState();
    }

    async getAppState() {
        let self = this;
        AsyncStorage.multiGet(['@settingsApp'], (err, values) => {
            let settingsApp = {};
            if (values.length > 0) {
                values.map((result, i, store) => {
                    let key = store[i][0];
                    let value = store[i][1];
                    if (key == "@settingsApp" && value != null && value != '') {
                        settingsApp = JSON.parse(value);
                    }
                });
                if (settingsApp) {
                    self.setState(settingsApp);
                }
            }
        }).catch(() => {

        })
    }

    checkExitsLCDInArr(lcd, arrLcd) {
        let lcdItem = {};
        for (var i = 0; i < arrLcd.length; i++) {
            lcdItem = arrLcd[i];
            if (lcdItem.deviceTopic == lcd) {
                return true;
                break;
            }
        }
        return false;
    }

    onLCDChange(value) {

        // this.setState({
        //     lcd: value,
        //     loadding: true
        // });
    }

    render() {
        const { show, onOK, onCancel } = this.props;
        return (
            <Modal isVisible={show} style={styles.modal}>
                <View style={styles.modalContainer}>
                    <View style={{
                        width: '100%'
                        , borderBottomWidth: 1, borderBottomColor: '#cecece',
                        alignItems: 'center', justifyContent: 'center',
                        height: 40
                    }}>
                        <H3 style={{}}>
                            Cài đặt
                        </H3>

                    </View>
                    <View style={{ width: '100%', flex: 1, backgroundColor: '#f6f8fa', alignItems: 'center' }}>
                        {/* <Item style={{ borderBottomWidth: 0 }}> */}
                        {/* <Label>LCD: </Label>
                            <Picker
                                style={{ minWidth: 250 }}
                                iosHeader="Select one"
                                mode="dropdown"
                                selectedValue={this.state.lcd}
                                onValueChange={this.onLCDChange.bind(this)}
                            >
                                {this.state.arrLCD.map((item, index) => {
                                    return <Item key={index} label={item.deviceName} value={item.deviceTopic} />
                                })}
                            </Picker> */}
                        <Item floatingLabel style={{}}>
                            <Label style={{ paddingTop: 0, marginBottom: 22 }}>Tên device: </Label>
                            <Input style={{ minWidth: 250 }}
                                onChangeText={(deviceName) => this.setState({ deviceName: deviceName })}
                                value={this.state.deviceName} />
                        </Item>
                        <Item floatingLabel style={{ marginTop: 6 }}>
                            <Label style={{ paddingTop: 0, marginBottom: 22 }}>Serial Number: </Label>
                            <Input style={{ minWidth: 250 }}
                                disabled
                                onChangeText={(imei) => this.setState({ imei: imei })}
                                value={this.state.imei} />
                        </Item>
                        {/* <Item floatingLabel style={{ marginTop: 6 }}>
                            <Label style={{ paddingTop: 0, marginBottom: 22 }}>Server: </Label>
                            <Input style={{ minWidth: 250 }}
                                onChangeText={(server) => this.setState({ server: server })}
                                value={this.state.server} />
                        </Item> */}
                        <Item floatingLabel style={{ marginTop: 6 }}>
                            <Label style={{ paddingTop: 0, marginBottom: 22 }}>Mqtt Server: </Label>
                            <Input style={{ minWidth: 250 }}
                                onChangeText={(mqttServer) => this.setState({ mqttServer: mqttServer })}
                                value={this.state.mqttServer} />
                        </Item>
                    </View>
                    <Footer style={styles.Footer}>
                        <Item style={styles.border_bottomNone}>
                            <Button onPress={() => { onOK(this.state) }} style={styles.buttonCancel}>
                                <Text style={[styles.textSize, styles.textOk]}>Đồng ý</Text>
                            </Button>
                            <Button onPress={() => { onCancel() }} style={[styles.buttonCancel, { marginLeft: 6 }]}>
                                <Text style={[styles.textSize, styles.textOk]}>Hủy bỏ</Text>
                            </Button>
                        </Item>
                    </Footer>
                </View>
            </Modal>
        );
    }
}