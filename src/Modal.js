import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  Easing,
  Modal as ReactNativeModal,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";

export class Modal extends Component {
  static propTypes = {
    onBackdropPress: PropTypes.func,
    onHide: PropTypes.func,
    isVisible: PropTypes.bool,
    contentStyle: PropTypes.any
  };

  static defaultProps = {
    onBackdropPress: () => null,
    onHide: () => null,
    isVisible: false
  };

  state = {
    isVisible: this.props.isVisible,
  };

  animVal = new Animated.Value(0);
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    if (this.state.isVisible) {
      this.show();
    }
    DeviceEventEmitter.addListener(
      "didUpdateDimensions",
      this.handleDimensionsUpdate
    );
  }

  show = () => {
    this.setState({ isVisible: true });
    Animated.timing(this.animVal, {
      easing: Easing.inOut(Easing.quad),
      // Using native driver in the modal makes the content flash
      // useNativeDriver: true,
      duration: 300,
      toValue: 1
    }).start();
  };

  hide = () => {
    Animated.timing(this.animVal, {
      easing: Easing.inOut(Easing.quad),
      // Using native driver in the modal makes the content flash
      // useNativeDriver: true,
      duration: 300,
      toValue: 0
    }).start(() => {
      if (this._isMounted) {
        this.setState({ isVisible: false }, this.props.onHide);
      }
    });
  };

  render() {
    const { children, onBackdropPress, contentStyle } = this.props;
    const { isVisible } = this.state;
    const backdropAnimatedStyle = {
      opacity: this.animVal.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4]
      })
    };
    const contentAnimatedStyle = {
      transform: [
        {
          translateY: this.animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [Dimensions.get("screen").width , 0],
            extrapolate: "clamp"
          })
        }
      ]
    };
    return (
      <ReactNativeModal 
      transparent 
      animationType="none" 
      visible={isVisible} 
      supportedOrientations={['portrait', 'landscape']}
      >
        <TouchableWithoutFeedback onPress={onBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              backdropAnimatedStyle,
              { width: Dimensions.get("screen").width, height: Dimensions.get("screen").height }
            ]}
          />
        </TouchableWithoutFeedback>
        {isVisible && (
          <Animated.View
            style={[styles.content, contentAnimatedStyle, contentStyle]}
            pointerEvents="box-none"
          >
            {children}
          </Animated.View>
        )}
      </ReactNativeModal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "black",
    opacity: 0
  },
  content: {
    flex: 1,
    justifyContent: "flex-end"
  }
});

export default Modal;
