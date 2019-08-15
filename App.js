/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Button,
  Animated
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import MapView from 'react-native-maps';

import Geolocation from '@react-native-community/geolocation';

const App = () => {

  const animatedTiming = 200;
  const addressUrl = 'https://mvp.bartlebyapp.com/address';

  const [longitude, setLongitude] = useState(0.0000);
  const [latitude, setLatitude] = useState(0.0000);
  const [latRange, setLatRange] = useState(0.015);
  const [lngRange, setLngRange] = useState(0.0121);
  const [canUpdate, setCanUpdate] = useState(false);
  const [fadeAnim, setFadeAnim] = useState(new Animated.Value(0));
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const setPosition = event => {
    setLatitude(event.latitude);
    setLongitude(event.longitude);
    setLatRange(event.latitudeDelta);
    setLngRange(event.longitudeDelta);
  };

  Geolocation.setRNConfiguration({
    authorizationLevel: 'whenInUse'
  });

  Geolocation.requestAuthorization();

  Geolocation.getCurrentPosition(
    ({ coords }) => {
      setLongitude(coords.longitude);
      setLatitude(coords.latitude);
      setMapLoaded(true);
    }, error => alert(error.message),
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
  );

  const allowUpdate = (event)=> {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    } else {
      setPosition(event);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animatedTiming
      }).start();
      setCanUpdate(true)
      console.log(latitude, longitude, latRange, lngRange);
    }
  };

  const update = () => {
    if (canUpdate) {
      fetch(addressUrl, {
        query: {
          lat: latitude,
          lng: longitude,
          lngRange: lngRange,
          latRange: latRange
        }}).then(response => console.log(response))
        .catch(err => console.error(err));
    }
  };

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.container}>
              {mapLoaded ? <MapView
                showUserLocation={true}
                followUserLocation={true}
                style={styles.map}
                initialRegion={{
                  latitude: latitude,
                  longitude: longitude,
                  latitudeDelta: latRange,
                  longitudeDelta: lngRange,
                }}
                onRegionChangeComplete={allowUpdate}
              /> : null}
            </View>
            <Animated.View style={{alignItems: 'center', opacity: fadeAnim}}>
              <Button onPress={update} title="Update" />
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  container: {
    position: 'relative',
    height: 500,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: "absolute"
  }
});

export default App;
