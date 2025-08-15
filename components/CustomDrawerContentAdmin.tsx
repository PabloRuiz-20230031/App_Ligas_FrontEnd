// components/CustomDrawerContentAdmin.tsx
import React from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { ImageBackground, View, StyleSheet } from 'react-native';

export default function CustomDrawerContentAdmin(props: any) {
  return (
    <ImageBackground
      source={require('@/assets/images/FondoH.png')}
      style={styles.background}
      resizeMode="repeat"
    >
      <View style={styles.overlay}>
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingTop: 40,
    paddingHorizontal: 8,
  },
});
