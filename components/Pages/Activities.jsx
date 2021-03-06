import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Modal, Button, Alert, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native'
import { useForm, Controller } from "react-hook-form";
import { FAB } from 'react-native-paper'
import DatePicker from 'react-native-date-picker'
import { useDispatch, useSelector } from "react-redux";
import { db } from '../../firebase';
import { collection, getDocs, doc, addDoc, query, where, updateDoc, onSnapshot, arrayUnion, Timestamp } from 'firebase/firestore'
import Icon from 'react-native-vector-icons/Ionicons';

import moment from 'moment';
import { fontSize, marginLeft } from 'styled-system';

export default function Activities() {
    const logInData = useSelector((state) => state.loginReducer);
    const messageCollectionRef = collection(db, "messaging");

    useEffect(() => {
        handleGetRequest();
        handleGetJobs();

        // GetChat(openChat.room)

    }, [])

    const GetChat = (jobId) => {
        const messageQ = query(collection(db, "messaging"), where("jobId", "==", jobId))
        onSnapshot(messageQ, (queryMessages) => {
            const k = queryMessages.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            console.log(k)
            setMessages(k)
            setMessageId(k[0].id)
        })
    }


    const [openChat, setOpenChat] = useState({
        open: false,
        recepient: '',
        room: '',
        name: '',
        messageId: ''
    })

    const [messageId, setMessageId] = useState("")
    const [messages, setMessages] = useState([])

    const [chat, setChat] = useState("");

    const openMessages = async (jobId, Recepient) => {
        const q = query(collection(db, "messaging"), where("jobId", "==", jobId))
        const add = await getDocs(q)
        const k = add.docs.map((doc) => ({ ...doc.data(), id: doc.id }))

        if (add.size === 0) {
            await addDoc(messageCollectionRef, {
                jobId: jobId,
                messages: []
            })
            openMessages(jobId, Recepient)
        } else {
            setOpenChat({
                ...openChat,
                open: true,
                recepient: jobId,
                name: Recepient,
            })

            GetChat(jobId)
        }

    }

    const addChat = async () => {

        const newChat = {
            message: chat,
            sender: logInData.user[0].userId,
            createdAt: Timestamp.fromDate(new Date()),
        }

        // const messageQ = query(collection(db, "messaging"), where("jobId", "==", openChat.room))
        const messageDoc = doc(db, "messaging", messageId);
        await updateDoc(messageDoc, {
            messages: arrayUnion(newChat)
        }).then((res) => {
            console.log("ResulTUpdate:" + messages)
        })
    }


    const [jobs, setJobs] = useState([])
    const [requests, setRequest] = useState([])

    const handleGetRequest = async () => {
        const q = query(collection(db, "jobs"), where("client.userId", "==", logInData.user[0].userId))
        await getDocs(q).then((res) => {
            const k = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
            setRequest(k)
        })

        // const k = getquery.docs.map((doc) => ({ ...doc.data(), id: doc.id}))
    }

    const handleGetJobs = async () => {
        const q = query(collection(db, "jobs"), where("worker.userId", "==", logInData.user[0].userId))
        await getDocs(q).then(res => {
            const k = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
            setJobs(k)
        })
    }

    const handleUpdateBookings = async (updateStatus, id) => {
        const jobDoc = doc(db, "jobs", id);
        await updateDoc(jobDoc, {
            status: updateStatus
        }).then((res) => {
            handleGetJobs();
            handleGetRequest();
        })
    }


    return (
        <View>
            <View style={{ height: 350, padding: 10 }}>
                <Text>My Requests</Text>
                <ScrollView style={{ padding: 10, height: '100%', width: '100%' }}>
                    {requests.map((request, key) =>
                        <View key={key}
                            onPress={() => {
                                setUserModal(true)
                                setSelectedWorker(worker)

                            }}
                        >
                            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                <Image
                                    source={{
                                        uri: request.worker.photo
                                    }}
                                    style={{ width: 75, height: 75, borderRadius: 400 / 2 }}
                                />
                                <View style={{ flexDirection: 'column', marginLeft: 20 }}>
                                    <Text style={{ color: '#34495e', fontSize: 15 }}>{request.worker.fullname}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: '#34495e', fontSize: 15 }}>{request.jobTitle}</Text>
                                        <Text style={{
                                            backgroundColor: request.status === "Pending" ? '#e67e22' : request.status === "Accepted" ? "#16a085" : "#e74c3c", color: 'white', fontSize: 13,
                                            padding: 2, marginLeft: 10, borderRadius: 4
                                        }}>
                                            {moment(request.dateStart.toDate()).format("MMM DD, YYYY")}
                                        </Text>
                                        <Text style={{ color: "#34495e", fontSize: 15 }}> - </Text>
                                        <Text style={{
                                            backgroundColor: request.status === "Pending" ? '#e67e22' : request.status === "Accepted" ? "#16a085" : "#e74c3c", color: 'white', fontSize: 13,
                                            padding: 2, borderRadius: 4
                                        }}>
                                            {moment(request.dateEnd.toDate()).format("MMM DD, YYYY")}
                                        </Text>
                                    </View>
                                    <View style={{ flexWrap: 'wrap', alignItems: 'flex-start', width: '90%' }}>
                                        <Text style={{ color: '#34495e', fontSize: 12 }}>{request.description}</Text>
                                    </View>

                                    <Text style={{ color: '#34495e', fontSize: 10 }}>
                                        {request.worker.skills.map((skill, key) =>
                                            request.worker.skills.length === key + 1 ? skill + '' : skill + ', '
                                        )}
                                    </Text>
                                    <View style={{ marginTop: 5, flexDirection: "row" }}>
                                        <Text style={{
                                            backgroundColor: request.status === "Pending" ? '#e67e22' : request.status === "Accepted" ? "#16a085" : "#e74c3c",
                                            padding: 5, color: 'white', fontSize: 12, borderRadius: 5
                                        }}>{request.status}</Text>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: '#16a085',
                                                padding: 5,
                                                borderRadius: 4,
                                                marginLeft: 5,
                                                bottom: 0,
                                            }}
                                            onPress={() => openMessages(request.id, request.worker.fullname)}
                                        >
                                            <Icon type="ionicons" name="chatbubble-ellipses" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                    {request.status === "Accepted"
                                        ?
                                        <View style={{ justifyContent: 'flex-start', flexDirection: 'row' }}>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#e67e22',
                                                    padding: 5,
                                                    borderRadius: 4,
                                                    marginRight: 5,
                                                    marginTop: 10,
                                                    bottom: 0,
                                                    width: 50
                                                }}
                                                onPress={() => handleUpdateBookings("Finished", request.id)}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 10 }}>Finish Job</Text>
                                            </TouchableOpacity>
                                        </View>
                                        :
                                        <View></View>
                                    }

                                </View>
                            </View>
                            <View
                                style={{
                                    borderBottomColor: '#2c3e50',
                                    borderBottomWidth: 1,
                                    marginBottom: 10
                                }}
                            />
                        </View>
                    )}

                </ScrollView>
            </View>
            <View style={{ height: 350, padding: 10 }}>
                <Text>Jobs for Me</Text>
                <ScrollView style={{ marginTop: 30, padding: 20, height: '80%', width: '100%' }}>
                    {jobs.map((job, key) =>
                        <View key={key}>
                            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                <View style={{ flexDirection: 'column', marginLeft: 20 }}>
                                    <Text style={{ color: '#34495e', fontSize: 15 }}>{job.client.fullname}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: '#34495e', fontSize: 15 }}>{job.jobTitle}</Text>
                                        <Text style={{
                                            backgroundColor: job.status === "Pending" ? '#e67e22' : job.status === "Accepted" ? "#16a085" : "#e74c3c", color: 'white', fontSize: 13,
                                            padding: 2, marginLeft: 10, borderRadius: 4
                                        }}>
                                            {moment(job.dateStart.toDate()).format("MMM DD, YYYY")}
                                        </Text>
                                        <Text style={{ color: "#34495e", fontSize: 15 }}> - </Text>
                                        <Text style={{
                                            backgroundColor: job.status === "Pending" ? '#e67e22' : job.status === "Accepted" ? "#16a085" : "#e74c3c", color: 'white', fontSize: 13,
                                            padding: 2, borderRadius: 4
                                        }}>
                                            {moment(job.dateEnd.toDate()).format("MMM DD, YYYY")}
                                        </Text>
                                    </View>
                                    <View style={{ flexWrap: 'wrap', alignItems: 'flex-start', width: '90%' }}>
                                        <Text style={{ color: '#34495e', fontSize: 12 }}>{job.description}</Text>
                                    </View>

                                    <View style={{ marginTop: 5, flexDirection: "row" }}>
                                        <Text style={{
                                            backgroundColor: job.status === "Pending" ? '#e67e22' : job.status === "Accepted" ? "#16a085" : "#e74c3c",
                                            padding: 5, color: 'white', fontSize: 12, borderRadius: 5
                                        }}>{job.status}</Text>

                                    </View>
                                    {job.status === "Pending" ?

                                        <View style={{ justifyContent: 'flex-start', flexDirection: 'row' }}>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#e67e22',
                                                    padding: 5,
                                                    borderRadius: 4,
                                                    marginRight: 5,
                                                    marginTop: 10,
                                                    marginBottom: 10,
                                                    bottom: 0,
                                                    width: 65
                                                }}
                                                onPress={() => handleUpdateBookings("Denied", job.id)}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 10 }}>Deny Booking</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#16a085',
                                                    padding: 5,
                                                    borderRadius: 4,
                                                    marginBottom: 10,
                                                    marginTop: 10,
                                                    bottom: 0,
                                                    width: 73
                                                }}
                                                onPress={() => handleUpdateBookings("Accepted", job.id)}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 10 }}>Accept Booking</Text>
                                            </TouchableOpacity>

                                        </View>

                                        : <View></View>

                                    }
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: '#16a085',
                                            padding: 5,
                                            borderRadius: 4,
                                            marginLeft: 5,
                                            bottom: 0,
                                            width: 20
                                        }}
                                        onPress={() => openMessages(job.id, job.client.fullname)}
                                    >
                                        <Icon type="ionicons" name="chatbubble-ellipses" size={10} color="white" />
                                    </TouchableOpacity>

                                </View>
                            </View>
                            <View
                                style={{
                                    borderBottomColor: '#2c3e50',
                                    borderBottomWidth: 1,
                                    marginBottom: 10
                                }}
                            />
                        </View>

                    )}
                </ScrollView>
            </View>


            <Modal
                animationType="slide"
                transparent={true}
                visible={openChat.open}
                onRequestClose={() => {
                    // Alert.alert("Modal has been closed.");
                    setOpenChat(!openChat.open);
                }}
            >
                <View style={{}}>
                    <View style={styles.modalView}>
                        <View style={{ height: '5%', flexDirection: 'row', justifyContent: 'flex-end', alignSelf: 'flex-end' }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#e67e22',
                                    padding: 5,
                                    height: 30,
                                    borderRadius: 4,
                                    justifyContent: 'flex-end',
                                    marginTop: 10,
                                    bottom: 0
                                }}
                                onPress={() => setOpenChat({ open: false })}
                            >
                                <Text style={{ color: '#fff', fontSize: 20 }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ flexDirection: 'column', height: '75%', width: '100%', padding: 10 }}>
                            {messages.map(message =>
                                message.messages.map(chat =>
                                    <View style={{ marginBottom: 25, alignItems: chat.sender === logInData.user[0].userId ? 'flex-end' : 'flex-start' }}>
                                        <Text style={{
                                            color: chat.sender === logInData.user[0].userId ? 'white' : 'black',
                                            backgroundColor: chat.sender === logInData.user[0].userId ? '#2980b9' : '#bdc3c7',
                                            flexWrap: 'wrap',
                                            textAlign: chat.sender === logInData.user[0].userId ? 'right' : 'left',
                                            borderRadius: 10, width: 200, padding: 10
                                        }}>
                                            {chat.message}
                                        </Text>
                                    </View>
                                )

                            )}
                        </ScrollView>
                        <View style={{ height: '20%', flexDirection: 'row', justifyContent: 'flex-end', padding: 20 }}>
                            <TextInput
                                style={styles.inputTextArea}
                                multiline={true}
                                numberOfLines={4}
                                onChangeText={(text) => {
                                    setChat(text)
                                }}
                                value={chat}
                                placeholder="Message"
                                keyboardType="default"
                            />
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#16a085',
                                    padding: 5,
                                    height: 35,
                                    borderRadius: 4,
                                    justifyContent: 'flex-end',
                                    // marginTop: 10,
                                    bottom: 0,
                                    marginLeft: 10
                                }}
                                onPress={() => addChat()}
                            >
                                <Text style={{ color: '#fff', fontSize: 20, textAlign: 'center' }}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    inputTextArea: {
        height: 40,
        width: '90%',
        // marginTop: 10,
        borderWidth: 1,
        borderColor: '#7f8c8d',
        padding: 10,
        borderRadius: 15,
        color: '#7f8c8d',
        backgroundColor: '#fff',
        textAlignVertical: 'top'
    },
    label: {
        color: 'white',
        margin: 20,
        marginLeft: 0,
    },
    button: {
        marginTop: 40,
        color: 'white',
        height: 40,
        backgroundColor: '#ec5990',
        borderRadius: 4,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 10,
        padding: 8,
        //   backgroundColor: '#0e101c',
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#95a5a6',
        textAlign: 'center',
        borderWidth: 1,
        margin: 5,
        height: 40,
        padding: 10,
        borderRadius: 4,
    },
    list: {
        height: 120,
        width: "100%",
        padding: 15,
        backgroundColor: 'white',
        color: '#34495e',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

    },
    modalView: {
        margin: 0,

        height: '100%',
        backgroundColor: "white",
        width: '100%',
        padding: 10,
        alignItems: "flex-start",
        elevation: 5
    },
});