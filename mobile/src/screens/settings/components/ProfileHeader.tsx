import React from "react";
import { View,Text,Image,StyleSheet } from "react-native";

export default function ProfileHeader({
  name,
  userId,
  avatar
}:any){

  const initials = name?.charAt(0)?.toUpperCase();

  return(

    <View style={styles.container}>

      {avatar ? (

        <Image
          source={{uri:avatar}}
          style={styles.avatar}
        />

      ) : (

        <View style={styles.initials}>
          <Text style={styles.initialText}>
            {initials}
          </Text>
        </View>

      )}

      <Text style={styles.name}>
        {name}
      </Text>

      <Text style={styles.userId}>
        {userId}
      </Text>

    </View>

  );

}

const styles = StyleSheet.create({

container:{
alignItems:"center",
marginBottom:20
},

avatar:{
width:80,
height:80,
borderRadius:40
},

initials:{
width:80,
height:80,
borderRadius:40,
backgroundColor:"#0ea5a4",
alignItems:"center",
justifyContent:"center"
},

initialText:{
color:"#fff",
fontSize:28,
fontWeight:"bold"
},

name:{
marginTop:10,
fontSize:18,
fontWeight:"700"
},

userId:{
fontSize:12,
color:"#64748b"
}

});