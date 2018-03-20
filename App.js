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
import * as Helper from './helper';
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
const imageTimeOut = null;
const connectInterval = null;
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
      currentFileType: null,
      currentMqttResult: null,
      errorUrl: null,
      server: null,
      mqttServer: null,
      appError: null
    }

  }

  componentDidMount() {
    let arrLCD = [];
    let arrSegment = [];
    //this.getLCD_Segment();
    this.playDataLocal();
    this.subscribeTopic();
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

  async subscribeTopic() {
    AsyncStorage.multiGet(['@settingsApp'], (err, values) => {
      let settingsApp = null;
      if (values.length > 0) {
        values.map((result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];
          if (key == "@settingsApp" && value != null && value != '') {
            settingsApp = JSON.parse(value);
          }
        });
        if (settingsApp) {
          this.setState({ mqttServer: settingsApp.mqttServer, server: settingsApp.server })
          this.createClient(Helper.getIMEI(), settingsApp.mqttServer);
        }
        else {
          this.setState({ modalShow: true });
        }
      }
      else {
        this.setState({ modalShow: true });
      }
    }).catch(() => {
      this.setState({ modalShow: true });
    })
  }

  createClient(topic, mqttServer, deviceName) {
    /* create mqtt client */
    clientId = guid();

    this.setState({ appError: "Đang kết nối đến server..." })
    mqtt.createClient({
      uri: `tcp://${mqttServer}`,
      clientId: 'tcp/incoming/' + topic + "/" + clientId
    }).then((client) => {
      mqttClient = client;
      client.on('closed', (msg) => {
        if (!mqttClient) {
          this.setState({ appError: "Kết nối đến server đã đóng." })
        }

        if (!connectInterval) {
          connectInterval = setInterval(() => {
            this.reconnect(topic, mqttServer, deviceName);
          }, 30000)
        }
      });
      client.on('error', (msg) => {
        this.setState({ appError: "Lỗi: kết nối đến server thất bại." })
        if (!connectInterval) {
          connectInterval = setInterval(() => {
            this.reconnect(topic, mqttServer, deviceName);
          }, 30000)
        }
      });
      client.on('message', this.onMessageMqtt.bind(this));
      let req = { request: { imei: Helper.getIMEI(), clientId: clientId, deviceName: deviceName } };
      client.on('connect', (msg) => {
        this.setState({ appError: null })
        if (connectInterval) {
          clearInterval(connectInterval);
        }
        client.subscribe('tcp/incoming/' + topic, 2);
        client.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
      });
      client.connect();
    }).catch((err) => {
      this.setState({ appError: "Lỗi: kết nối đến server thất bại." })
      if (connectInterval) {
        clearInterval(connectInterval);
      }
      connectInterval = setInterval(() => {
        this.reconnect(topic, mqttServer, deviceName);
      }, 30000)
    });
  }

  reconnect(topic, mqttServer, deviceName) {
    clientId = guid();
    mqtt.createClient({
      uri: `tcp://${mqttServer}`,
      clientId: 'tcp/incoming/' + topic + "/" + clientId
    }).then((client) => {
      mqttClient = client;
      client.on('closed', () => {
        this.setState({ appError: "Kết nối đến server đã đóng." })
      });
      client.on('error', (msg) => {
        this.setState({ appError: "Lỗi: kết nối đến server thất bại." })
      });
      client.on('message', this.onMessageMqtt.bind(this));
      let req = { request: { imei: Helper.getIMEI(), clientId: clientId, deviceName: deviceName } };
      client.on('connect', () => {
        this.setState({ appError: null })
        if (connectInterval) {
          clearInterval(connectInterval);
        }
        client.subscribe('tcp/incoming/' + topic, 2);
        client.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
      });
      client.connect();
    }).catch((err) => {
      this.setState({ appError: "Lỗi: kết nối đến server thất bại." })
    });
  }

  async playDataLocal() {
    try {
      const value = await AsyncStorage.getItem('@tableData');
      if (value !== null) {
        const msgObj = JSON.parse(value);
        if (msgObj && msgObj.resources && msgObj.resources.length > 0) {
          let arrayUrl = msgObj.resources;
          this.setArrUrlFirst(arrayUrl, true);
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
    } catch (error) {
      // Error retrieving data
    }
  }

  async onMessageMqtt(msg) {
    AsyncStorage.setItem("@tableData", msg.data);
    this.bindInterVal(msg);
    const msgObj = JSON.parse(msg.data);
    if (msgObj && msgObj.resources && msgObj.resources.length > 0) {
      let arrayUrl = msgObj.resources;
      await Helper.deleteEntireFolder();
      this.setArrUrlFirst(arrayUrl);
      this.syncVideoCache(arrayUrl);
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

  async setArrUrlFirst(arrayUrl, fromLocal) {
    //delete cache folder
    //await Helper.deleteEntireFolder();
    let isExitsCache = await Helper.checkVideoCacheExits(arrayUrl[0].resourcePath);
    let urlSource = null;
    if (isExitsCache) {
      urlSource = Helper.getLinkVideoCacheExits(arrayUrl[0].resourcePath);
    }
    else {
      urlSource = arrayUrl[0].resourcePath;
    }
    //urlSource = arrayUrl[0].resourcePath;
    this.setState({
      arrayUrl: arrayUrl, newMessage: (fromLocal ? false : true),
      currentMqttResult: arrayUrl[0],
      currentUrl: urlSource, currentFileType: arrayUrl[0].fileType
    })
  }

  async setUrlFromCache(url) {
    try {
      let isExitsCache = await Helper.checkVideoCacheExits(url.resourcePath);
      let urlSource = null;
      if (isExitsCache) {
        urlSource = Helper.getLinkVideoCacheExits(url.resourcePath);
      }
      else {
        urlSource = url;
        sync1VideoCache(url);
      }
      this.setState({
        currentUrl: urlSource,
        currentMqttResult: url,
        currentFileType: url.fileType
      })
    }
    catch (e) {
      //debugger;
    }

  }

  sync1VideoCache(url) {
    Helper.downloadVideo(url.resourcePath);
  }

  async syncVideoCache(arrUrl) {
    Helper.downloadVideo(arrUrl[0].resourcePath);
    for (var i = 0; i < arrUrl.length; i++) {
      let url = arrUrl[i];
      Helper.downloadVideo(url.resourcePath, null);
    }
  }

  syncDeleteVideoCache() {

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
  }

  onModalOk(state) {
    try {

      this.setState({ mqttServer: state.mqttServer, server: state.server, deviceName: state.deviceName, appError: null, modalShow: false })
      //this.setSettingsApptoServer(state);
      AsyncStorage.setItem('@settingsApp', JSON.stringify(state));
      if (mqttClient) {
        mqttClient.disconnect();
      }
      this.createClient(Helper.getIMEI(), state.mqttServer, state.deviceName);
      // }
      // else {
      //   let req = { request: { imei: Helper.getIMEI(), clientId: clientId } };
      //   mqttClient.subscribe('tcp/incoming/' + Helper.getIMEI(), 2);
      //   mqttClient.publish('tcp/outgoing/request', JSON.stringify(req), 2, false);
      // }
    }
    catch (e) {
      this.setState({ appError: 'Kiểm tra lại tên server.' })
    }
  }

  setSettingsApptoServer(state) {
    let dataPost = {};
    dataPost = {};
    dataPost.imei = state.imei;
    dataPost.deviceName = state.deviceName;
    fetch(`http://${state.server}/cms-web-api/device/register`, {//${state.server}
      method: 'POST',
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataPost)
    }).then((res) => {
      if (res.status == 200) {
        this.setState({ modalShow: false })
      }
      else {
        this.setState({ appError: 'Lưu thông tin server thất bại' })
      }
    }).then((resJson) => {

    }).catch((error) => {
      debugger;
      this.setState({ appError: 'Lưu thông tin server thất bại' })
    })
  }

  onEnd(val) {
    const { currentUrl, arrayUrl, currentMqttResult } = this.state;
    let index = -1;
    for (var i = 0; i < arrayUrl.length; i++) {
      if (arrayUrl[i].resourcePath == currentMqttResult.resourcePath) {
        index = i;
        break;
      }
    }
    console.log(index);
    let newIndex = 0;
    let newUrl = null;
    if (index != arrayUrl.length - 1) {
      newIndex = index + 1;
    }
    newUrl = arrayUrl[newIndex];
    this.setUrlFromCache(newUrl);
  }

  videoError(e, b, c, d) {
    const { currentUrl, arrayUrl, currentMqttResult } = this.state;
    console.log("error video")
    if (currentUrl.indexOf("file://") == 0) {
      this.setState({ currentUrl: currentMqttResult.resourcePath });
      Helper.downloadVideo(currentMqttResult.resourcePath, null, true);
      return;
    }
    let index = -1;
    for (var i = 0; i < arrayUrl.length; i++) {
      if (arrayUrl[i].resourcePath == currentMqttResult.resourcePath) {
        index = i;
        break;
      }
    }
    let newIndex = 0;
    let newUrl = null;
    if (index != arrayUrl.length - 1) {
      newIndex = index + 1;
    }
    newUrl = arrayUrl[newIndex];
    this.setUrlFromCache(newUrl);
    //this.setState({ currentUrl: newUrl.resourcePath, errorUrl: currentUrl, currentFileType: newUrl.fileType })

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
    const { newMessage, arrLCD, modalShow, currentUrl, errorUrl, currentFileType, appError } = this.state;
    let paused = false;
    let temcurrentUrl = currentUrl;
    // if (currentUrl != currentPlayingUrl) {
    //   // paused = true;
    //   temcurrentUrl = "http://" + "wifi1.easylink.vn:8080/cms-web-api/private/video/video/1520928091894-cafesuavalentine.mp4";
    // }
    if (imageTimeOut) {
      clearTimeout(imageTimeOut);
    }
    if (currentFileType == "IMAGE") {
      imageTimeOut = setTimeout(() => {
        this.onEnd();
      }, 10000);
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar hidden={true} />
        <Button onPress={() => { this.setState({ modalShow: true }) }} style={{ position: 'absolute', top: 5, right: 5, opacity: 0.7, zIndex: 99999, backgroundColor: "transparent" }}>
          <Image
            style={{ width: 24, height: 24 }}
            source={require('./images/setting.png')}
          />
        </Button>
        <ModalLcd show={modalShow} onOK={this.onModalOk.bind(this)} onCancel={() => { this.setState({ modalShow: false }) }}></ModalLcd>
        <MyDate style={{ position: "absolute", top: 15, left: 35, zIndex: 99999 }}></MyDate>
        <Text style={{ position: "absolute", bottom: 25, left: 5, color: "#fff", fontSize: 18, zIndex: 99999 }}>{appError || true ? appError : ""}</Text>
        {/* <Text style={{ position: "absolute", bottom: 5, left: 5, color: "#fff", fontSize: 18, zIndex: 99999 }}>{errorUrl ? ("video lỗi: " + errorUrl.replace(/^.*[\\\/]/, '')) : ""}</Text> */}
        <Text style={{ position: "absolute", bottom: 5, right: 5, color: "#fff", fontSize: 18, zIndex: 99999 }}>{newMessage ? "Đang cập nhật dữ liệu mới..." : ""}</Text>
        {
          currentFileType == "VIDEO" || !currentUrl ?
            <Video source={currentUrl ? { uri: currentUrl } : require('./video/1.mp4')}
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
              style={styles.video} /> :
            null
        }
        {
          currentFileType == "IMAGE" ?
            < Image style={styles.video} resizeMode="contain"
              source={currentUrl ? { uri: currentUrl } : require('./video/1.mp4')}></Image> :
            null
        }
        {
          // this.renderPlayer(currentUrl)
        }
        <KeepAwake />
      </View >
    )
  }

  renderPlayer(currentUrl) {
    const objSource = { uri: 'http://' + currentUrl };
    if (currentUrl != currentPlayingUrl) {
      this.player.setNativeProps({ source: objSource });
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
  }
});
