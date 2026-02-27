import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import io from "socket.io-client";
import api from "../../api/api";

const socket = io("http://192.168.1.217:5000");

export default function SupportChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    api.get("/support/ticket").then(res => {
      setTicket(res.data.ticket);
      setMessages(res.data.messages);
      socket.emit(
        "joinTicket",
        res.data.ticket._id
      );
    });

    socket.on("newMessage", msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  const send = async () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      ticketId: ticket._id,
      sender: "USER",
      message: text,
    });

    setText("");
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={i => i._id}
        renderItem={({ item }) => (
          <Text
            style={{
              alignSelf:
                item.sender === "USER"
                  ? "flex-end"
                  : "flex-start",
              backgroundColor:
                item.sender === "USER"
                  ? "#0ea5a4"
                  : "#e5e7eb",
              padding: 10,
              margin: 6,
              borderRadius: 12,
              color:
                item.sender === "USER"
                  ? "#fff"
                  : "#000",
            }}
          >
            {item.message}
          </Text>
        )}
      />

      <View
        style={{
          flexDirection: "row",
          padding: 10,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 10,
            padding: 10,
          }}
          placeholder="Type message..."
        />

        <TouchableOpacity onPress={send}>
          <Text style={{ padding: 10 }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}