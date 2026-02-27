import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import API from '../api/api';

export default function EditProfileScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/user/profile');
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        setAvatarUri(res.data.profileImage || null);
      } catch (err) { console.log(err); }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing:true, aspect:[1,1], quality:0.7, base64:false });
    if (!result.canceled && result.assets?.[0].uri) setAvatarUri(result.assets[0].uri);
  };

  const save = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('phone', phone);
      if (avatarUri) form.append('avatar', { uri: avatarUri, name: `avatar-${Date.now()}.jpg`, type: 'image/jpeg' } as any);

      const res = await API.put('/user/profile', form, { headers: { 'Content-Type': 'multipart/form-data' }});
      Alert.alert('Saved', 'Profile updated');
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TouchableOpacity onPress={pickImage}>
        {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Text>Tap to add</Text></View>}
      </TouchableOpacity>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:18},
  title:{fontSize:20,fontWeight:'700',marginBottom:12},
  avatar:{width:100,height:100,borderRadius:50,alignSelf:'center',marginBottom:12},
  avatarPlaceholder:{width:100,height:100,borderRadius:50,backgroundColor:'#eee',justifyContent:'center',alignItems:'center',alignSelf:'center',marginBottom:12},
  input:{borderWidth:1,borderColor:'#ddd',padding:12,borderRadius:8,marginBottom:10},
  saveBtn:{backgroundColor:'#0ea5a4',padding:14,alignItems:'center',borderRadius:8},
  saveText:{color:'#fff',fontWeight:'700'}
});
