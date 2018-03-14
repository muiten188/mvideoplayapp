/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  ListItem,
  AsyncStorage,
  Alert,
  StatusBar,
  Image
} from 'react-native';
//import Icon from 'react-native-vector-icons/EvilIcons';
import { Picker, Item, Label, Spinner, Badge, Button } from 'native-base';
import FListItem from './listItem';
import MyDate from './date';
import { Col, Row, Grid } from "react-native-easy-grid";
import Modal from "react-native-modal";
import ModalLcd from "./modal";
import Video from "react-native-video";
import KeepAwake from 'react-native-keep-awake';
const currentPlayingUrl = null;
const currentPlayingIndex = false;
const mqtt = require('react-native-mqtt');
let currentSlice = 0;
let endSilce = 5;
const numberRow = 5;
let interval = null;
let arrMachine = [];
let subInterVal = [];
const mqttClient = null;
const newMesTimeout = null;
const errorTimeout = null;
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
const clientId = "";
export default class App extends Component {
  constructor(props) {
    super(props)
    let lcd = "";
    clientId = guid();
    this.state = {
      modalShow: false,
      lcd: lcd,
      loadding: true,
      newMessage: false,
      change: 0,
      arrLCD: [],
      arrayUrl: [],
      currentUrl: null,
      errorUrl: null
    }

  }

  componentDidMount() {
    let arrLCD = [];
    let arrSegment = [];

    this.getLCD_Segment();
  }

  async getLCD_Segment() {
    let arrLCD = [];
    try {
      let responseLCD = await fetch("http://10.168.85.20:8080/cms-web-api/device/load-all", {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json'
        }, ),
        async: false
      })
      arrLCD = await responseLCD.json()
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
            this.createClient(arrLCD[0].deviceTopic);
          }
          else {
            this.setState({ arrLCD: arrLCD, lcd: lcd });
            this.createClient(lcd);
          }
        }
        else {
          this.setState({ arrLCD: arrLCD, lcd: arrLCD[0].deviceTopic });
          this.createClient(arrLCD[0].deviceTopic);
        }
      }).catch(() => {
        this.setState({ arrLCD: arrLCD, lcd: arrLCD[0].deviceTopic });
        this.createClient(arrLCD[0].deviceTopic);
      })
      //this.createClient("LCD001");
      // this.getLCD_Segment()
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

  createClient(topic) {
    /* create mqtt client */

    mqtt.createClient({
      uri: 'tcp://113.171.23.140:1883',
      clientId: 'tcp/incoming/' + topic + "/" + clientId
    }).then((client) => {
      mqttClient = client;
      client.on('closed', function () {
        alert('kết nối đến server đã đóng');
      });
      client.on('error', function (msg) {
        alert('Lỗi: ', msg);
      });
      client.on('message', this.onMessageMqtt.bind(this));
      let req = { request: { topic: topic, clientId: clientId } };
      client.on('connect', function () {
        client.subscribe('tcp/incoming/' + topic, 2);
        client.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
      });
      client.connect();
    }).catch(function (err) {
      alert(err);
    });
  }

  onMessageMqtt(msg) {
    AsyncStorage.setItem("@tableData", msg.data);
    this.bindInterVal(msg);
    const msgObj = JSON.parse(msg.data);
    debugger;
    if (msgObj && msgObj.resources && msgObj.resources.length > 0) {
      let arrayUrl = msgObj.resources;
      this.setState({ arrayUrl: arrayUrl, newMessage: true, currentUrl: arrayUrl[0] })
      if (newMesTimeout) {
        clearTimeout(newMesTimeout);
      }
      newMesTimeout = setTimeout(() => {
        this.setState({
          newMessage: false
        })
      }, 13000);
    }

  }

  bindInterVal(msg) {
    const msgObj = JSON.parse(msg.data);
    let tableData = msgObj.data;
    if (msgObj.clientId != clientId && msgObj.clientId != "all") {
      return;
    }
    if (interval) {
      window.clearInterval(interval);
    }
    if (subInterVal) {
      window.clearInterval(subInterVal);
    }
    for (var i = 0; i < msgObj.resources.length; i++) {
      let url = msgObj.resources[i];
      console.log(url);
    }

    // const objTableData = this.bindArrMachine(tableData);
    // subInterVal = window.setInterval(() => {
    //   //console.log('change array');
    //   for (var i = 0; i < objTableData.arrMultilMachine.length; i++) {
    //     let arrMulti = objTableData.arrMultilMachine[i];
    //     for (var j = 0; j < arrMulti.length; j++) {
    //       let item = arrMulti[j];
    //       let nextItem = {};
    //       if (j == arrMulti.length - 1) {
    //         nextItem = arrMulti[0];
    //       }
    //       else {
    //         nextItem = arrMulti[j + 1];
    //       }
    //       if (this.state.arrayShow.indexOf(item) > -1 && objTableData.arrSingleMachine.indexOf(item) > -1) {
    //         objTableData.arrSingleMachine[objTableData.arrSingleMachine.indexOf(item)] = nextItem;
    //         break;
    //       }
    //     }
    //   }
    //   let tempCurrentSlice = 0;
    //   let tempEndSilce = 0;
    //   if (currentSlice < numberRow) {
    //     tempCurrentSlice = objTableData.arrSingleMachine.length - numberRow;
    //   }
    //   else {
    //     tempCurrentSlice = currentSlice - numberRow;
    //   }
    //   if (endSilce == numberRow) {
    //     tempEndSilce = objTableData.arrSingleMachine.length;
    //   }
    //   else {
    //     tempEndSilce = endSilce - numberRow;
    //   }
    //   let arrayShow = objTableData.arrSingleMachine.slice(tempCurrentSlice, tempEndSilce);
    //   if (arrayShow.length == this.state.arrayShow.length &&
    //     arrayShow.length > 0 && arrayShow[0].machine == this.state.arrayShow[0].machine) {
    //     this.setState({
    //       arrayShow: arrayShow,
    //       change: this.state.change == 0 ? 1 : 0
    //     })
    //   }
    // }, 3000);
    // currentSlice = 0;
    // endSilce = 5;
    // const arrayShow = objTableData.arrSingleMachine.slice(currentSlice, endSilce);
    // currentSlice = currentSlice + numberRow;
    // endSilce = endSilce + numberRow;
    // if (currentSlice >= objTableData.arrSingleMachine.length) {
    //   currentSlice = 0;
    //   endSilce = 5;
    // }
    // this.setState({
    //   newMessage: true,
    //   arrayShow: arrayShow,
    //   loadding: false
    // })
    // interval = window.setInterval(() => {
    //   const arrayShow = objTableData.arrSingleMachine.slice(currentSlice, endSilce);
    //   currentSlice = currentSlice + numberRow;
    //   endSilce = endSilce + numberRow;
    //   if (currentSlice >= objTableData.arrSingleMachine.length) {
    //     currentSlice = 0;
    //     endSilce = 5;
    //   }
    //   this.setState({
    //     arrayShow: arrayShow,
    //     loadding: false
    //   })
    // }, 13000)
    // if (newMesTimeout) {
    //   clearTimeout(newMesTimeout);
    // }
    // newMesTimeout = setTimeout(() => {
    //   this.setState({
    //     newMessage: false
    //   })
    // }, 15000);
  }

  bindArrMachine(tableData) {
    let temArr = [];
    let arrSingleMachine = [];
    let arrPushedMachine = [];
    let arrMultilMachine = [];
    for (var i = 0; i < tableData.length; i++) {
      let itemI = tableData[i];
      temArr = [];
      if (arrSingleMachine.indexOf(itemI) == -1 && arrPushedMachine.indexOf(itemI.machine) == -1) {
        arrSingleMachine.push(itemI);
      }
      if (arrPushedMachine.indexOf(itemI.machine) == -1) {
        arrPushedMachine.push(itemI.machine);
        for (var j = i + 1; j < tableData.length; j++) {
          let itemJ = tableData[j];
          if (itemJ.machine == itemI.machine) {
            if (temArr.indexOf(itemI) == -1) {
              temArr.push(itemI);
            }
            temArr.push(itemJ);
          }
        }
      }
      if (temArr.length > 0) {
        arrMultilMachine.push(temArr);
      }
    }
    return {
      arrMultilMachine: arrMultilMachine,
      arrSingleMachine: arrSingleMachine
    };
  }

  onModalOk(lcd) {
    this.setState({ modalShow: false })
    if (lcd) {
      AsyncStorage.setItem('@LCD', lcd);
      let req = { request: { topic: lcd, clientId: clientId } };
      if (!mqttClient) {
        this.createClient(lcd);
      }
      else {
        mqttClient.subscribe('tcp/incoming/' + lcd, 2);
        mqttClient.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
      }
    }
  }

  onEnd(val) {
    const { currentUrl, arrayUrl } = this.state;
    let index = arrayUrl.indexOf(currentUrl);
    let newIndex = 0;
    let newUrl = null;
    debugger;
    if (index != arrayUrl.length) {
      newIndex = newIndex + 1;
    }
    newUrl = arrayUrl[newIndex];
    this.setState({ currentUrl: newUrl })
  }

  videoError(e, b, c, d) {
    const { currentUrl, arrayUrl } = this.state;
    let index = arrayUrl.indexOf(currentUrl);
    let newIndex = 0;
    let newUrl = null;
    if (index != arrayUrl.length) {
      newIndex = newIndex + 1;
    }
    newUrl = arrayUrl[newIndex];
    this.setState({ currentUrl: newUrl, errorUrl: currentUrl })
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    errorTimeout = setTimeout(() => {
      this.setState({
        errorUrl: null
      })
    }, 6000);
  }
  render() {
    const { newMessage, arrLCD, modalShow, currentUrl, errorUrl } = this.state;
    let paused = false;
    let temcurrentUrl = currentUrl;
    // if (currentUrl != currentPlayingUrl) {
    //   // paused = true;
    //   temcurrentUrl = "http://" + "wifi1.easylink.vn:8080/cms-web-api/private/video/video/1520928091894-cafesuavalentine.mp4";
    // }
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar hidden={true} />
        <Button onPress={() => { this.setState({ modalShow: true }) }} style={{ position: 'absolute', top: 5, right: 5, opacity: 0.7, zIndex: 99999, backgroundColor: "transparent" }}>
          <Image
            style={{ width: 24, height: 24 }}
            source={require('./images/setting.png')}
          />
        </Button>
        <ModalLcd show={modalShow} onOK={this.onModalOk.bind(this)}></ModalLcd>
        <MyDate style={{ position: "absolute", top: 15, left: 35 }}></MyDate>
        <Text style={{ position: "absolute", bottom: 5, left: 5, color: "#fff", fontSize: 18 }}>{errorUrl ? ("video lỗi: " + errorUrl.replace(/^.*[\\\/]/, '')) : ""}</Text>
        <Text style={{ position: "absolute", bottom: 5, right: 5, color: "#fff", fontSize: 18 }}>{newMessage ? "Đang cập nhật dữ liệu mới..." : ""}</Text>
        {currentUrl ?
          <Video source={currentUrl ? { uri: temcurrentUrl } : require('./video/1.mp4')}
            ref={(ref) => {
              this.player = ref
            }}                                      // Store reference 
            rate={1.0}                              // 0 is paused, 1 is normal. 
            volume={1.0}                            // 0 is muted, 1 is normal. 
            muted={false}                           // Mutes the audio entirely. 
            paused={paused}                          // Pauses playback entirely. 
            resizeMode="contain"                      // Fill the whole screen at aspect ratio.*
            repeat={true}                           // Repeat forever. 
            playInBackground={false}                // Audio continues to play when app entering background. 
            playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown. 
            ignoreSilentSwitch={"ignore"}           // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual. 
            progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms) 
            onLoadStart={this.loadStart}            // Callback when video starts to load 
            onLoad={this.setDuration}               // Callback when video loads 
            onProgress={this.setTime}               // Callback every ~250ms with currentTime 
            onEnd={this.onEnd.bind(this)}                      // Callback when playback finishes 
            onError={this.videoError.bind(this)}               // Callback when video cannot be loaded 
            onBuffer={this.onBuffer}                // Callback when remote video is buffering 
            onTimedMetadata={this.onTimedMetadata}  // Callback when the stream receive some metadata 
            style={styles.video} /> : null
        }
        {
          // this.renderPlayer(currentUrl)
        }
        <KeepAwake />
      </View>
    )
  }

  renderPlayer(currentUrl) {
    const objSource = { uri: 'http://' + currentUrl };
    if (currentUrl != currentPlayingUrl) {
      this.player.setNativeProps({ source: objSource });
    }
  }

  onValueChange(value) {
    AsyncStorage.setItem('@LCD', value);
    if (interval) {
      window.clearInterval(interval);
    }
    if (subInterVal) {
      window.clearInterval(subInterVal);
    }
    this.setState({
      lcd: value,
      loadding: true
    });
    let req = { request: { topic: value, clientId: clientId } };
    if (!mqttClient) {
      this.createClient(value);
    }
    else {
      mqttClient.subscribe('tcp/incoming/' + value, 2);
      mqttClient.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
    }

    //this.createClient(value);
  }

  onSegmentChange(value) {
    AsyncStorage.setItem('@SEGMENT', value.toString());
    if (interval) {
      window.clearInterval(interval);
    }
    if (subInterVal) {
      window.clearInterval(subInterVal);
    }
    this.setState({
      segment: value,
      loadding: true
    });

    let req = { request: { topic: this.state.lcd, segment: value, clientId: clientId } };
    if (!mqttClient) {
      this.createClient(value);
    }
    else {
      mqttClient.subscribe('tcp/incoming/' + value, 2);
      mqttClient.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
    }
  }

  _keyExtractor(item, index) {
    return index;
  }

  renderRow(dataItem) {
    return (
      <FListItem key={dataItem.index} dataItem={dataItem.item} />
    );
  }

}

const styles = StyleSheet.create({
  colBorder: {
    borderWidth: 0.25,
    borderColor: '#d6d7da',
  },
  itemBorderNone: {
    borderBottomWidth: 0
  },
  rowTitle: {
    width: "100%",
    height: 100,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  head: { minHeight: 50, backgroundColor: '#f1f8ff' },
  rowTitleCon: {
    flex: 1,
    flexDirection: 'row'
  },
  logoTitle: {
    color: "#e7fdfd",
    fontSize: 22
  },
  logoCon: {
    width: 350,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleCon: {
    justifyContent: 'center',
    flex: 1
  },
  title: {
    color: '#fff',
    fontSize: 35
  },
  dateCon: {
    width: 140,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: { marginLeft: 5, textAlign: 'center' },
  rowHeader: { height: 100 },
  row: { height: 50 },
  text: { color: '#efc373', fontSize: 22, textAlign: 'center' },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'red'
  }
});
