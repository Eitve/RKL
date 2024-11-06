import React, { useState } from 'react';
import { TouchableOpacity, ImageBackground, Text, StyleSheet, GestureResponderEvent } from 'react-native';

export default function NewsContainer({ imageSource, title, onPress }) {
  const [pressStartPosition, setPressStartPosition] = useState({ x: 0, y: 0 });

  const handlePressIn = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setPressStartPosition({ x: pageX, y: pageY });
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const distanceX = Math.abs(pageX - pressStartPosition.x);
    const distanceY = Math.abs(pageY - pressStartPosition.y);

    if (distanceX < 5 && distanceY < 5) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.card}
      activeOpacity={1}
    >
      <ImageBackground
        source={imageSource}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <Text style={styles.title}>{title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 10,
  },
  title: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontSize: 18,
    padding: 8,
    textAlign: 'center',
  },
});
