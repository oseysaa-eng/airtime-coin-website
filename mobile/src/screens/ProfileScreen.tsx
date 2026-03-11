import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";

import API from "../api/api";

const ProfileScreen = () => {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [phone,setPhone] = useState("");

  const [profileImage,setProfileImage] = useState<string | null>(null);
  const [badges,setBadges] = useState<string[]>([]);

  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  useEffect(()=>{
    loadProfile();
  },[]);

  /* -------------------------
     LOAD PROFILE
  ------------------------- */

  const loadProfile = async()=>{

    try{

      const res = await API.get("/api/profile");

      const data = res.data;

      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setProfileImage(data.profileImage || null);
      setBadges(data.badges || []);

      await AsyncStorage.setItem("userName",data.name || "");
      await AsyncStorage.setItem("userEmail",data.email || "");
      await AsyncStorage.setItem("userPhone",data.phone || "");

      if(data.profileImage)
        await AsyncStorage.setItem("userImage",data.profileImage);

    }catch(err){

      console.log("Profile load failed. Using local cache");

      loadLocal();

    }finally{

      setLoading(false);

    }

  };

  /* -------------------------
     LOAD LOCAL CACHE
  ------------------------- */

  const loadLocal = async()=>{

    const n = await AsyncStorage.getItem("userName");
    const e = await AsyncStorage.getItem("userEmail");
    const p = await AsyncStorage.getItem("userPhone");
    const img = await AsyncStorage.getItem("userImage");

    if(n) setName(n);
    if(e) setEmail(e);
    if(p) setPhone(p);
    if(img) setProfileImage(img);

  };

  /* -------------------------
     AVATAR MENU
  ------------------------- */

  const chooseAvatar = ()=>{

    Alert.alert(
      "Profile Photo",
      "Select image source",
      [
        { text:"Take Photo", onPress:openCamera },
        { text:"Choose from Gallery", onPress:openGallery },
        { text:"Remove Photo", style:"destructive", onPress:removePhoto },
        { text:"Cancel", style:"cancel" }
      ]
    );

  };

  /* -------------------------
     CAMERA
  ------------------------- */

  const openCamera = async()=>{

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if(!permission.granted){
      Alert.alert("Permission required","Camera access required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing:true,
      aspect:[1,1],
      quality:0.7
    });

    if(!result.canceled){

      const uri = result.assets[0].uri;

      setProfileImage(uri);

      await AsyncStorage.setItem("userImage",uri);

    }

  };

  /* -------------------------
     GALLERY
  ------------------------- */

  const openGallery = async()=>{

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if(!permission.granted){
      Alert.alert("Permission required","Gallery access required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:["images"],
      allowsEditing:true,
      aspect:[1,1],
      quality:0.7
    });

    if(!result.canceled){

      const uri = result.assets[0].uri;

      setProfileImage(uri);

      await AsyncStorage.setItem("userImage",uri);

    }

  };

  /* -------------------------
     REMOVE PHOTO
  ------------------------- */

  const removePhoto = async()=>{

    setProfileImage(null);

    await AsyncStorage.removeItem("userImage");

  };

  /* -------------------------
     SAVE PROFILE
  ------------------------- */

  const handleSave = async()=>{

    try{

      setSaving(true);

      const form = new FormData();

      form.append("name",name);
      form.append("email",email);
      form.append("phone",phone);

      if(profileImage && profileImage.startsWith("file")){

        form.append("avatar",{
          uri:profileImage,
          name:`avatar-${Date.now()}.jpg`,
          type:"image/jpeg"
        } as any);

      }

      await API.put(
        "/api/profile",
        form,
        { headers:{ "Content-Type":"multipart/form-data" } }
      );

      await AsyncStorage.setItem("userName",name);
      await AsyncStorage.setItem("userEmail",email);
      await AsyncStorage.setItem("userPhone",phone);

      Alert.alert("Success","Profile updated");

    }catch(err){

      console.log(err);

      Alert.alert("Error","Could not update profile");

    }finally{

      setSaving(false);

    }

  };

  if(loading){

    return(
      <View style={styles.loader}>
        <ActivityIndicator size="large"/>
      </View>
    );

  }

  return(

    <ScrollView style={{flex:1}} contentContainerStyle={styles.container}>

      <TouchableOpacity onPress={chooseAvatar}>

        {profileImage ? (
          <Image source={{uri:profileImage}} style={styles.avatar}/>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#aaa"/>
          </View>
        )}

        <Text style={styles.editText}>Tap to change photo</Text>

      </TouchableOpacity>

      {/* BADGES */}

      <View style={styles.badgesContainer}>

        {badges.length === 0 ? (
          <Text style={{color:"#555"}}>No badges yet</Text>
        ) : badges.map((b,index)=>(
          <View key={index} style={styles.badge}>
            <Text style={styles.badgeText}>{b}</Text>
          </View>
        ))}

      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >

        {saving
          ? <ActivityIndicator color="#fff"/>
          : <Text style={styles.buttonText}>Save Changes</Text>
        }

      </TouchableOpacity>

    </ScrollView>

  );

};

export default ProfileScreen;

const styles = StyleSheet.create({

container:{
padding:24,
alignItems:"center",
backgroundColor:"#fff"
},

loader:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

avatar:{
width:110,
height:110,
borderRadius:55,
marginBottom:10
},

avatarPlaceholder:{
width:110,
height:110,
borderRadius:55,
backgroundColor:"#eee",
justifyContent:"center",
alignItems:"center",
marginBottom:10
},

editText:{
fontSize:13,
color:"#555",
marginBottom:20,
textAlign:"center"
},

input:{
width:"100%",
backgroundColor:"#f2f2f2",
padding:14,
borderRadius:10,
marginBottom:14,
fontSize:16
},

button:{
width:"100%",
backgroundColor:"#0ea5a4",
padding:14,
borderRadius:10,
alignItems:"center",
marginTop:20
},

buttonText:{
color:"#fff",
fontWeight:"bold",
fontSize:16
},

badgesContainer:{
flexDirection:"row",
flexWrap:"wrap",
gap:10,
marginBottom:20
},

badge:{
backgroundColor:"#FFD700",
paddingVertical:6,
paddingHorizontal:12,
borderRadius:15
},

badgeText:{
color:"#000",
fontWeight:"bold"
}

});