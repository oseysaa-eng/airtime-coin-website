import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";

export default function EditProfileScreen() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [avatar,setAvatar] = useState<string | null>(null);

  useEffect(()=>{

    loadUser();

  },[]);

  const loadUser = async()=>{

    const res = await API.get("/api/summary");

    setName(res.data.name);
    setEmail(res.data.email);
    setAvatar(res.data.profileImage);

  };

  /* PICK IMAGE */
const pickImage = async()=>{

       const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],   // ✅ FIX
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.7
    });

    if(!result.canceled){

      setAvatar(result.assets[0].uri);

    }

  };

  /* SAVE PROFILE */

  const saveProfile = async()=>{

    try{

      const res = await API.put("/api/user/update-profile",{

        name,
        email,
        profileImage:avatar

      });

      await AsyncStorage.setItem("userName",name);

      if(avatar)
        await AsyncStorage.setItem("avatar",avatar);

      Alert.alert("Success","Profile updated");

    }catch(err){

      Alert.alert("Error","Profile update failed");

    }

  };

  return(

    <View style={styles.container}>

      {/* AVATAR */}

      <TouchableOpacity onPress={pickImage}>

        {avatar ? (

          <Image
            source={{uri:avatar}}
            style={styles.avatar}
          />

        ):(
          <View style={styles.avatarPlaceholder}>
            <Text style={{color:"#fff"}}>Add Photo</Text>
          </View>
        )}

      </TouchableOpacity>

      {/* NAME */}

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* EMAIL */}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      {/* SAVE BUTTON */}

      <TouchableOpacity
        style={styles.button}
        onPress={saveProfile}
      >
        <Text style={{color:"#fff",fontWeight:"700"}}>
          Save Profile
        </Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:"#fff"
},

avatar:{
width:120,
height:120,
borderRadius:60,
alignSelf:"center",
marginBottom:20
},

avatarPlaceholder:{
width:120,
height:120,
borderRadius:60,
backgroundColor:"#0ea5a4",
alignSelf:"center",
alignItems:"center",
justifyContent:"center",
marginBottom:20
},

input:{
borderWidth:1,
borderColor:"#e5e7eb",
padding:12,
borderRadius:10,
marginBottom:15
},

button:{
backgroundColor:"#0ea5a4",
padding:15,
borderRadius:12,
alignItems:"center"
}

});