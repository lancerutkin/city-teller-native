/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Button,
  Animated,
  Text,
  Dimensions
} from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";

import MapView, { Marker, Callout } from "react-native-maps";

import Geolocation from "@react-native-community/geolocation";

const { height, width } = Dimensions.get("screen");

const App = () => {
  const animatedTiming = 200;
  const addressUrl = "https://blooming-springs-94129.herokuapp.com/address";

  const [longitude, setLongitude] = useState(0.0);
  const [latitude, setLatitude] = useState(0.0);
  const [latRange, setLatRange] = useState(0.010);
  const [lngRange, setLngRange] = useState(0.0009);
  const [canUpdate, setCanUpdate] = useState(false);
  const [fadeAnim, setFadeAnim] = useState(new Animated.Value(0));
  const [stores, setStores] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const setPosition = event => {
    setLatitude(event.latitude);
    setLongitude(event.longitude);
    setLatRange(event.latitudeDelta);
    setLngRange(event.longitudeDelta);
  };

  const fetchStores = (lat = latitude, lng = longitude) => {
    fetch(
      `${addressUrl}/?lat=${lat}&lng=${lng}&latRange=${latRange}&lngRange=${lngRange}`
    )
      .then(response =>
        response.json().then(result => {
          setStores(result);
        })
      )
      .catch(err => console.error(err));
  };

  Geolocation.setRNConfiguration({
    authorizationLevel: "whenInUse"
  });

  Geolocation.requestAuthorization();

  if (isInitialLoad) {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setLongitude(coords.longitude);
        setLatitude(coords.latitude);
        setMapLoaded(true);
        fetchStores(coords.latitude, coords.longitude);
      },
      error => alert(error.message),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
    );
  }

  const allowUpdate = event => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    } else {
      setPosition(event);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animatedTiming
      }).start();
      setCanUpdate(true);
      console.log(latitude, longitude, latRange, lngRange);
    }
  };

  const update = () => {
    if (canUpdate) {
      fetchStores();
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animatedTiming
      }).start();
      setCanUpdate(false);
    }
  };

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
          <View style={styles.body}>
            <View style={styles.container}>
              {mapLoaded ? (
                <MapView
                  showUserLocation={true}
                  style={styles.map}
                  initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: latRange,
                    longitudeDelta: lngRange
                  }}
                  onRegionChangeComplete={allowUpdate}
                >
                  {stores.map(store => {
                    return (
                      <Marker
                        key={store._id.toString()}
                        coordinate={{
                          latitude: store.lat,
                          longitude: store.lng
                        }}
                      >
                        <Callout>
                          <View>
                            <Text>{store.storeName}</Text>
                            <Text>{`${store.address1}${
                              store.address2 ? `, ${store.address2}` : ""
                            }`}</Text>
                            {store.minimumPurchase ? (
                              <Text>
                                Minimum purchase: ${store.minimumPurchase}
                              </Text>
                            ) : null}
                            {store.chargeFlat ? (
                              <Text>Flat fee: ${store.chargeFlat}</Text>
                            ) : null}
                            {store.chargePercent ? (
                              <Text>
                                Percentage fee: {store.chargePercent}%
                              </Text>
                            ) : null}
                            {!store.minimumPurchase &&
                            !store.chargeFlat &&
                            !store.chargePercent ? (
                              <Text>No fee</Text>
                            ) : null}
                          </View>
                        </Callout>
                      </Marker>
                    );
                  })}
                </MapView>
              ) : null}
            </View>
            <Animated.View
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                zIndex: 2,
                alignItems: "center",
                opacity: fadeAnim,
                position: 'absolute',
                height: 40,
                width: 100,
                borderRadius: 10,
                left: (width - 100) / 2,
                top: height - 150,
                backgroundColor: 'white'}
              }>
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
    backgroundColor: Colors.lighter
  },
  body: {
    backgroundColor: Colors.white
  },
  container: {
    position: "relative",
    height: height,
    justifyContent: "flex-end",
    alignItems: "center"
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
