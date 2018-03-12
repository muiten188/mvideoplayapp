
import React, { PureComponent, Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Col, Row, Grid } from "react-native-easy-grid";
export default class FListItem extends Component {
    
    render() {
        const { dataItem } = this.props;
        return (
            <Row style={styles.row}>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.machine}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.orders}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.codeBtp}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.corlor}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.denier}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.plan}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.produced}</Text>
                </Col>
                <Col style={[styles.colBorder, { paddingTop: 8, paddingBottom: 8 }]}>
                    <Text style={styles.text}>{dataItem.remain}</Text>
                </Col>
                <Col style={{
                    paddingTop: 8, paddingBottom: 8, width: 100, borderWidth: 0.25,
                    borderColor: '#d6d7da', justifyContent: 'center'
                }}>
                    <Text style={styles.text}>{dataItem.productDate}</Text>
                </Col>
                <Col style={{
                    paddingTop: 8, paddingBottom: 8, width: 100, borderWidth: 0.25,
                    borderColor: '#d6d7da', justifyContent: 'center'
                }}>
                    <Text style={styles.text}>{dataItem.finishDate}</Text>
                </Col>
                <Col style={{
                    paddingTop: 8, paddingBottom: 8, width: 100, borderWidth: 0.25,
                    borderColor: '#d6d7da', justifyContent: 'center'
                }}>
                    <Text style={styles.text}>{dataItem.releaseDate}</Text>
                </Col>
            </Row>
        )
    }
}
const styles = StyleSheet.create({

    colBorder: {
        borderWidth: 0.25,
        borderColor: '#d6d7da',
        justifyContent: 'center'
    },
    head: { minHeight: 50, backgroundColor: '#f1f8ff' },
    text: { marginLeft: 5, textAlign: 'center', },
    row: { height: 60 },
    text: { color: '#e1e8af', fontWeight: "400", fontSize: 18, textAlign: 'center' }
});