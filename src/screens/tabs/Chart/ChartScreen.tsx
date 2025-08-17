import WIP from '../../../assets/images/undraw_analytics_6mru.svg';
import React from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text
} from 'react-native';

const ChartScreen = () => {

  return (
    <KeyboardAvoidingView
      /**
       * Required this for
       * the KB avoiding view
       * to work
       */
      behavior='height'
      /**
       * Need exactly at 70
       * or it cause some bugs
       * flickering at the bottom screen
       */
      keyboardVerticalOffset={0}
      style={styles.container}
    >
      <WIP
        width='100%'
        height='100%'
        style={styles.backgroundImage}
      />
      <Text style={styles.text}>
        W.I.P
      </Text>
    </KeyboardAvoidingView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
  },
  text: {
    fontSize: 80,
    fontWeight: 600,
  },
  box: {
    height: 60,
    width: 60,
    backgroundColor: '#fff'
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }
});

export default ChartScreen;