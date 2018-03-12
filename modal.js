import React, { Component } from "react";
import { Text, TouchableOpacity, View, AsyncStorage } from "react-native";
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
    Picker
} from "native-base";
import styles from "./styles";
import Modal from "react-native-modal";

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lcd: null,
            arrLCD: [],
            loadding: false
        }
    }

    componentDidMount() {
        this.getLCD();
    }

    async getLCD() {
        try {
            let responseLCD = await fetch("http://10.168.85.20:8080/cms-web-api/device/load-all", {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }, ),
                async: false
            })
            arrLCD = await responseLCD.json();
            //this.setState({ arrLCD: arrLCD })
            if (arrLCD.length <= 0) {
                Alert.alert("Thông báo", "Không có LCD nào trong dữ liệu, vui lòng tạo LCD vào khởi động lại app.");
            }

        } catch (error) {
            Alert.alert("Thông báo", "Ko lấy được danh sách LCD kiểm tra lại kết nối.");
        }
        if (arrLCD.length > 0) {
            AsyncStorage.multiGet(['@LCD'], (err, values) => {
                let lcd = "";
                if (values.length > 0) {
                    values.map((result, i, store) => {
                        let key = store[i][0];
                        let value = store[i][1];
                        if (key == "@LCD" && value != null && value != '') {
                            lcd = value;
                        }
                    });
                    if ((lcd == "" || lcd == null) || (this.checkExitsLCDInArr(lcd, arrLCD) == false)) {
                        this.setState({ arrLCD: arrLCD, lcd: arrLCD[0].deviceTopic });
                        //this.createClient(arrLCD[0].deviceTopic);
                    }
                    else {
                        this.setState({ arrLCD: arrLCD, lcd: lcd });
                        //this.createClient(lcd);
                    }
                }
                else {
                    this.setState({ arrLCD: arrLCD, lcd: arrLCD[0].deviceTopic });
                    //this.createClient(arrLCD[0].deviceTopic);
                }
            }).catch(() => {
                this.setState({ arrLCD: arrLCD, lcd: arrLCD[0].deviceTopic });
                //this.createClient(arrLCD[0].deviceTopic);
            })
        }
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
        
        this.setState({
            lcd: value,
            loadding: true
        });
        // let req = { request: { topic: value, clientId: clientId } };
        // if (!mqttClient) {
        //     this.createClient(value);
        // }
        // else {
        //     mqttClient.subscribe('tcp/incoming/' + value, 2);
        //     mqttClient.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
        // }
    }

    render() {
        const { show, onOK } = this.props;
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
                            Chọn LCD
                        </H3>
                    </View>
                    <View style={{ width: '100%', flex: 1, backgroundColor: '#f6f8fa', alignItems: 'center', justifyContent: 'center' }}>
                        <Item style={{ borderBottomWidth: 0 }}>
                            <Label>LCD: </Label>
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
                            </Picker>
                        </Item>
                    </View>
                    <Footer style={styles.Footer}>
                        <Item style={styles.border_bottomNone}>
                            <Button onPress={() => { onOK(this.state.lcd) }} style={styles.buttonCancel}>
                                <Text style={[styles.textSize, styles.textOk]}>OK</Text>
                            </Button>
                        </Item>
                    </Footer>
                </View>
            </Modal>
        );
    }
}